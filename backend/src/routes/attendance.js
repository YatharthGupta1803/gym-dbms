const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const { verifyToken } = require('./auth');
const db = require('../config/db');

const upload = multer({ storage: multer.memoryStorage() });

router.get('/', verifyToken, async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT a.*, m.name as member_name 
      FROM attendance a
      JOIN members m ON a.member_id = m.id
      ORDER BY a.check_in_time DESC
      LIMIT 100
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/manual', verifyToken, async (req, res) => {
  try {
    const { member_id } = req.body;
    const { rows } = await db.query(
      "INSERT INTO attendance (member_id, method) VALUES ($1, 'MANUAL') RETURNING *",
      [member_id]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/face-checkin', verifyToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    // Get all active encodings from DB
    const { rows: members } = await db.query(
      "SELECT id, face_encoding FROM members WHERE face_encoding IS NOT NULL AND status = 'ACTIVE'"
    );

    if (members.length === 0) {
      return res.status(400).json({ error: 'No enrolled faces found in the system' });
    }

    // Prepare encodings data
    const encodings_data = members.map(m => ({
      member_id: m.id,
      encoding: m.face_encoding
    }));

    const form = new FormData();
    form.append('image', req.file.buffer, { filename: 'live.jpg', contentType: req.file.mimetype });
    form.append('encodings', JSON.stringify(encodings_data));

    try {
      const pyRes = await axios.post(`${process.env.FACE_API_URL || 'http://localhost:5001'}/api/face/match`, form, {
        headers: { ...form.getHeaders() }
      });

      if (pyRes.data.success && pyRes.data.match) {
        // Record successful attendance
        const matchedMemberId = pyRes.data.member_id;
        const confidence = pyRes.data.confidence;

        // Ensure user hasn't checked in recently (within 1 hour)
        const checkRecent = await db.query(
          "SELECT id FROM attendance WHERE member_id = $1 AND check_in_time > NOW() - INTERVAL '1 HOUR'",
          [matchedMemberId]
        );

        if (checkRecent.rows.length > 0) {
          return res.status(400).json({ error: 'Member already checked in recently' });
        }

        const { rows } = await db.query(
          "INSERT INTO attendance (member_id, method, confidence_score) VALUES ($1, 'FACE_RECOGNITION', $2) RETURNING *",
          [matchedMemberId, confidence]
        );

        // Fetch user data
        const memberData = await db.query("SELECT name FROM members WHERE id = $1", [matchedMemberId]);
        
        return res.json({ 
          success: true, 
          message: `Checked in successfully: ${memberData.rows[0].name}`,
          attendance: rows[0]
        });

      } else {
        return res.status(400).json({ error: pyRes.data.message || 'Face not recognized' });
      }

    } catch (pyErr) {
      console.error(pyErr);
      return res.status(500).json({ error: 'Face recognition service failed' });
    }
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
