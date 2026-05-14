const express = require('express');
const bcrypt = require('bcryptjs');
const { pool } = require('../db/database');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');
const router = express.Router();

// Get all students
router.get('/students', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM students');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add fees for student
router.post('/fees', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { studentId, amount, dueDate, description } = req.body;
    const result = await pool.query(
      'INSERT INTO fees (student_id, amount, due_date, description, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [studentId, amount, dueDate, description, 'unpaid']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all payments
router.get('/payments', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT p.*, s.first_name, s.last_name FROM payments p JOIN students s ON p.student_id = s.id ORDER BY p.created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get payment statistics
router.get('/stats', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const totalStudents = await pool.query('SELECT COUNT(*) as count FROM students');
    const totalFees = await pool.query('SELECT SUM(amount) as total FROM fees WHERE status = \'unpaid\'');
    const totalPaid = await pool.query('SELECT SUM(amount) as total FROM fees WHERE status = \'paid\'');
    
    res.json({
      total_students: totalStudents.rows[0].count,
      total_unpaid_fees: totalFees.rows[0].total || 0,
      total_paid_fees: totalPaid.rows[0].total || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
