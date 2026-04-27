const express = require('express');
const router = express.Router();
const { verifyToken } = require('./auth');
const db = require('../config/db');

router.get('/', verifyToken, async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT p.*, m.name as member_name 
      FROM payments p
      JOIN members m ON p.member_id = m.id
      ORDER BY p.payment_date DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const { member_id, amount, status } = req.body;
    const { rows } = await db.query(
      'INSERT INTO payments (member_id, amount, status) VALUES ($1, $2, $3) RETURNING *',
      [parseInt(member_id), parseFloat(amount), status || 'PAID']
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await db.query('DELETE FROM payments WHERE id = $1', [req.params.id]);
    res.json({ message: 'Payment deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
