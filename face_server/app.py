import os
import io
import json
import numpy as np
import cv2
from flask import Flask, request, jsonify
from flask_cors import CORS

try:
    import face_recognition
    USE_DLIB = True
except ImportError:
    USE_DLIB = False
    print("WARNING: 'face_recognition' (dlib) not found. Falling back to OpenCV structural match.")

app = Flask(__name__)
CORS(app)

def load_image_from_bytes(file_bytes):
    nparr = np.frombuffer(file_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return img

def encode_face_opencv(img):
    """Fallback OpenCV encoding logic if dlib isn't available."""
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Load default Haar cascade for face detection
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    faces = face_cascade.detectMultiScale(gray, 1.1, 4)
    
    if len(faces) == 0:
        return []
    
    encodings = []
    for (x, y, w, h) in faces:
        face_roi = gray[y:y+h, x:x+w]
        # Resize to standard size 32x32 for structurally comparing 1024 flat vector
        face_resized = cv2.resize(face_roi, (32, 32))
        
        # Flatten and normalize
        encoding = face_resized.flatten().astype(np.float32)
        encoding /= np.linalg.norm(encoding) + 1e-10
        encodings.append(encoding)
        
    return encodings

@app.route('/api/face/encode', methods=['POST'])
def encode_face():
    if 'image' not in request.files:
        return jsonify({"success": False, "message": "No image provided"}), 400
    
    file = request.files['image']
    file_bytes = file.read()
    
    try:
        img = load_image_from_bytes(file_bytes)
        
        if USE_DLIB:
            rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            encodings = face_recognition.face_encodings(rgb_img)
        else:
            encodings = encode_face_opencv(img)
            
        if len(encodings) == 0:
            return jsonify({"success": False, "message": "No face detected"}), 400
        if len(encodings) > 1:
            return jsonify({"success": False, "message": "Multiple faces detected, please just upload one person"}), 400
            
        encoding_list = encodings[0].tolist() if USE_DLIB else encodings[0].tolist()
        return jsonify({
            "success": True, 
            "encoding": json.dumps(encoding_list)
        })
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/face/match', methods=['POST'])
def match_face():
    if 'image' not in request.files or 'encodings' not in request.form:
        return jsonify({"success": False, "message": "Missing image or encodings"}), 400
        
    try:
        file_bytes = request.files['image'].read()
        img = load_image_from_bytes(file_bytes)
        
        if USE_DLIB:
            rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            face_encs = face_recognition.face_encodings(rgb_img)
        else:
            face_encs = encode_face_opencv(img)
            
        if len(face_encs) == 0:
            return jsonify({"success": False, "message": "No face detected in live image"}), 400
        
        live_encoding = face_encs[0]
        encodings_data = json.loads(request.form['encodings'])
        
        known_encodings = []
        member_ids = []
        
        for item in encodings_data:
            known_encodings.append(np.array(json.loads(item['encoding'])))
            member_ids.append(item['member_id'])
            
        if not known_encodings:
            return jsonify({"success": True, "match": False, "message": "No known faces available"}), 200
            
        if USE_DLIB:
            face_distances = face_recognition.face_distance(known_encodings, live_encoding)
            best_match_index = np.argmin(face_distances)
            confidence = 1 - face_distances[best_match_index]
            threshold = 0.6
            is_match = face_distances[best_match_index] <= threshold
        else:
            # Euclidean distance for normalized structural flat vector
            distances = [np.linalg.norm(live_encoding - kn) for kn in known_encodings]
            best_match_index = np.argmin(distances)
            
            # Simple threshold for structural match
            # since vectors are normalized, max distance is 2. 
            # A completely identical face might have distance < 0.6, different people ~ 1.0+
            threshold = 0.85
            is_match = distances[best_match_index] <= threshold
            confidence = max(0, 1 - (distances[best_match_index] / 1.5))
            
        if is_match:
            return jsonify({
                "success": True,
                "match": True,
                "member_id": member_ids[best_match_index],
                "confidence": float(confidence)
            })
        else:
            return jsonify({
                "success": True,
                "match": False,
                "message": "Face not recognized"
            })
            
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)

