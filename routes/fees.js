const express = require('express');
const { pool } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Get student fees
router.get('/', authenticateToken, async (req, res) => {
  try {
    const studentResult = await pool.query(
      'SELECT id FROM students WHERE user_id = $1',
      [req.user.userId]
    );
    
    if (studentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const studentId = studentResult.rows[0].id;
    const result = await pool.query(
      'SELECT * FROM fees WHERE student_id = $1 ORDER BY due_date DESC',
      [studentId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get fees summary
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const studentResult = await pool.query(
      'SELECT id FROM students WHERE user_id = $1',
      [req.user.userId]
    );
    
    const studentId = studentResult.rows[0].id;
    const result = await pool.query(
      'SELECT SUM(CASE WHEN status = \'unpaid\' THEN amount ELSE 0 END) as total_unpaid, SUM(CASE WHEN status = \'paid\' THEN amount ELSE 0 END) as total_paid FROM fees WHERE student_id = $1',
      [studentId]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
