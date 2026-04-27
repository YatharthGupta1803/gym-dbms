const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const { verifyToken } = require('./auth');
const db = require('../config/db');
const { addMonths, format } = require('date-fns');

const upload = multer({ storage: multer.memoryStorage() });

router.get('/', verifyToken, async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT m.*, p.name as plan_name, t.name as trainer_name 
      FROM members m
      LEFT JOIN plans p ON m.plan_id = p.id
      LEFT JOIN trainers t ON m.trainer_id = t.id
      ORDER BY m.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const { name, age, gender, phone, plan_id, trainer_id } = req.body;
    
    // Get plan duration to calculate expiry
    const planResult = await db.query('SELECT duration_months FROM plans WHERE id = $1', [plan_id]);
    if (planResult.rows.length === 0) return res.status(400).json({ error: 'Invalid plan' });
    
    const duration_months = planResult.rows[0].duration_months;
    const join_date = new Date();
    const expiry_date = addMonths(join_date, duration_months);

    let face_encoding = null;

    if (req.file) {
      // Send to python server
      const form = new FormData();
      form.append('image', req.file.buffer, { filename: 'face.jpg', contentType: req.file.mimetype });
      
      try {
        const pyRes = await axios.post(`${process.env.FACE_API_URL || 'http://localhost:5001'}/api/face/encode`, form, {
          headers: { ...form.getHeaders() }
        });
        
        if (pyRes.data.success) {
          face_encoding = pyRes.data.encoding;
        } else {
          return res.status(400).json({ error: pyRes.data.message });
        }
      } catch (pyErr) {
        console.error("Face API Error:", pyErr.response?.data || pyErr.message);
        return res.status(400).json({ error: 'Failed to encode face: ' + (pyErr.response?.data?.message || pyErr.message) });
      }
    }

    const { rows } = await db.query(
      `INSERT INTO members (name, age, gender, phone, plan_id, trainer_id, join_date, expiry_date, face_encoding) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [name, parseInt(age), gender, phone, parseInt(plan_id), parseInt(trainer_id) || null, join_date, expiry_date, face_encoding]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    if (err.constraint === 'members_phone_key') {
      return res.status(400).json({ error: 'Phone number already exists' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await db.query('DELETE FROM members WHERE id = $1', [req.params.id]);
    res.json({ message: 'Member deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { name, age, phone, status } = req.body;
    const { rows } = await db.query(
      'UPDATE members SET name = $1, age = $2, phone = $3, status = $4 WHERE id = $5 RETURNING *',
      [name, parseInt(age), phone, status, req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
