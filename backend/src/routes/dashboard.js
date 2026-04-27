const express = require('express');
const router = express.Router();
const { verifyToken } = require('./auth');
const db = require('../config/db');

router.get('/', verifyToken, async (req, res) => {
  try {
    const membersCount = await db.query("SELECT COUNT(*) FROM members WHERE status = 'ACTIVE'");
    const trainersCount = await db.query("SELECT COUNT(*) FROM trainers");
    const todayAttendance = await db.query("SELECT COUNT(*) FROM attendance WHERE DATE(check_in_time) = CURRENT_DATE");
    const revenueStats = await db.query("SELECT SUM(amount) FROM payments WHERE status = 'PAID' AND EXTRACT(MONTH FROM payment_date) = EXTRACT(MONTH FROM CURRENT_DATE)");
    const expiringMemberships = await db.query("SELECT COUNT(*) FROM members WHERE expiry_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '7 days') AND status = 'ACTIVE'");

    res.json({
      activeMembers: parseInt(membersCount.rows[0].count),
      totalTrainers: parseInt(trainersCount.rows[0].count),
      todayAttendance: parseInt(todayAttendance.rows[0].count),
      monthlyRevenue: parseFloat(revenueStats.rows[0].sum || 0),
      expiringMemberships: parseInt(expiringMemberships.rows[0].count),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
