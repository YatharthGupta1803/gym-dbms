const express = require('express');
const router = express.Router();
const { verifyToken } = require('./auth');
const db = require('../config/db');

router.get('/', verifyToken, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM trainers ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, phone, specialization } = req.body;
    const { rows } = await db.query(
      'INSERT INTO trainers (name, phone, specialization) VALUES ($1, $2, $3) RETURNING *',
      [name, phone, specialization]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await db.query('DELETE FROM trainers WHERE id = $1', [req.params.id]);
    res.json({ message: 'Trainer deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
