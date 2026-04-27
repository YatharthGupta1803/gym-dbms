const express = require('express');
const router = express.Router();
const { verifyToken } = require('./auth');
const db = require('../config/db');

router.get('/', verifyToken, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM plans ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, duration_months, price } = req.body;
    const { rows } = await db.query(
      'INSERT INTO plans (name, duration_months, price) VALUES ($1, $2, $3) RETURNING *',
      [name, parseInt(duration_months), parseFloat(price)]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await db.query('DELETE FROM plans WHERE id = $1', [req.params.id]);
    res.json({ message: 'Plan deleted' });
  } catch (err) {
    if (err.constraint === 'members_plan_id_fkey') {
      return res.status(400).json({ error: 'Cannot delete plan as members are associated with it.' });
    }
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
