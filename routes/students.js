const express = require('express');
const { pool } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Get student profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM students WHERE user_id = $1',
      [req.user.userId]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update student profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, phone, parentEmail } = req.body;
    const result = await pool.query(
      'UPDATE students SET first_name = $1, last_name = $2, phone = $3, parent_email = $4 WHERE user_id = $5 RETURNING *',
      [firstName, lastName, phone, parentEmail, req.user.userId]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
