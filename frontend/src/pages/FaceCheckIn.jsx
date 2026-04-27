import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import api from '../api';
import { Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FaceCheckIn() {
  const webcamRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const capture = useCallback(() => {
    const src = webcamRef.current.getScreenshot();
    if (src) {
      setLoading(true);
      setMessage({ text: 'Processing...', type: 'info' });
      
      fetch(src)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], "live.jpg", { type: "image/jpeg" });
          const formData = new FormData();
          formData.append('image', file);
          
          return api.post('/attendance/face-checkin', formData);
        })
        .then(res => {
          if (res.data.success) {
            setMessage({ text: res.data.message, type: 'success' });
          } else {
            setMessage({ text: 'Not recognized', type: 'error' });
          }
        })
        .catch(err => {
          setMessage({ text: err.response?.data?.error || 'Face recognition failed', type: 'error' });
        })
        .finally(() => {
          setLoading(false);
          // Auto clear message after few seconds
          setTimeout(() => {
            setMessage({ text: '', type: '' });
          }, 4000);
        });
    }
  }, [webcamRef]);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      
      <div className="absolute top-6 left-6">
        <Link to="/" className="text-gray-400 hover:text-white flex items-center gap-2 transition-colors">
          <Home size={24} /> Admin Dashboard
        </Link>
      </div>

      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-xl text-center">
        <h1 className="text-3xl font-extrabold text-blue-400 mb-2">Member Check-In</h1>
        <p className="text-gray-400 mb-8">Please face the camera to mark your attendance</p>

        <div className="relative mx-auto w-full max-w-sm rounded-xl overflow-hidden border-4 border-gray-700 shadow-inner mb-8 bg-black">
          <Webcam 
            audio={false} 
            ref={webcamRef} 
            screenshotFormat="image/jpeg" 
            className="w-full h-auto object-cover opacity-90"
            videoConstraints={{ facingMode: "user" }}
          />
          
          {/* Scanning overlay effect */}
          {loading && (
            <div className="absolute inset-0 bg-blue-500/20 z-10 flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {message.text && (
          <div className={`p-4 rounded-lg mb-6 text-lg font-medium transition-all transform animate-fade-in ${
            message.type === 'success' ? 'bg-green-100 text-green-800 border border-green-300' :
            message.type === 'error' ? 'bg-red-100 text-red-800 border border-red-300' :
            'bg-blue-100 text-blue-800 border border-blue-300'
          }`}>
            {message.type === 'success' && '✅ '}
            {message.type === 'error' && '❌ '}
            {message.text}
          </div>
        )}

        <button 
          onClick={capture} 
          disabled={loading}
          className={`w-full py-4 rounded-xl text-xl font-bold text-white transition-all shadow-lg ${
            loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/30'
          }`}
        >
          {loading ? 'Scanning Face...' : 'CHECK IN'}
        </button>
      </div>
    </div>
  );
}
