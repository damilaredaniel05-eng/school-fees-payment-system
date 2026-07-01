const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { pool } = require('../db/database');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');
const router = express.Router();

// Admin Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Get admin from database
    const result = await pool.query(
      'SELECT id, email, password, role FROM users WHERE email = $1 AND role = $2',
      [email, 'admin']
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const admin = result.rows[0];

    // Check password
    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: admin.id, role: admin.role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      adminId: admin.id,
      role: admin.role
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Dashboard Overview
router.get('/overview', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const totalStudents = await pool.query('SELECT COUNT(*) as count FROM students');
    const totalFeesAssigned = await pool.query('SELECT SUM(amount) as total FROM fees');
    const totalPaid = await pool.query('SELECT SUM(amount) as total FROM fees WHERE status = \'paid\'');
    const outstandingFees = await pool.query('SELECT SUM(amount) as total FROM fees WHERE status = \'unpaid\'');

    res.json({
      totalStudents: totalStudents.rows[0].count || 0,
      totalFeesAssigned: totalFeesAssigned.rows[0].total || 0,
      totalPaid: totalPaid.rows[0].total || 0,
      outstandingFees: outstandingFees.rows[0].total || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all students
router.get('/students', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, student_id, first_name, last_name, email, department, class FROM students ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new student (Admin only)
router.post('/students', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { firstName, lastName, email, studentId, department, level } = req.body;

    // Create user account
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('defaultPassword123', salt);

    const userResult = await pool.query(
      'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id',
      [email, hashedPassword, 'student']
    );

    const userId = userResult.rows[0].id;

    // Create student record
    const studentResult = await pool.query(
      'INSERT INTO students (user_id, student_id, first_name, last_name, email, department, class) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [userId, studentId, firstName, lastName, email, department, level]
    );

    res.status(201).json(studentResult.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all fees
router.get('/fees', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT f.*, s.first_name, s.last_name, s.student_id FROM fees f LEFT JOIN students s ON f.student_id = s.id ORDER BY f.created_at DESC'
    );
    
    const feesWithNames = result.rows.map(fee => ({
      ...fee,
      student_name: fee.first_name && fee.last_name ? `${fee.first_name} ${fee.last_name}` : 'Unknown'
    }));

    res.json(feesWithNames);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add fees for student
router.post('/fees', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { studentId, feeType, amount, dueDate } = req.body;

    const result = await pool.query(
      'INSERT INTO fees (student_id, fee_type, amount, due_date, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [studentId, feeType, amount, dueDate, 'unpaid']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update fee
router.put('/fees/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { feeType, amount, dueDate, status } = req.body;
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE fees SET fee_type = $1, amount = $2, due_date = $3, status = $4 WHERE id = $5 RETURNING *',
      [feeType, amount, dueDate, status, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete fee
router.delete('/fees/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM fees WHERE id = $1', [id]);
    res.json({ message: 'Fee deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all payments
router.get('/payments', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT p.*, s.first_name, s.last_name, r.receipt_number FROM payments p LEFT JOIN students s ON p.student_id = s.id LEFT JOIN receipts r ON p.id = r.payment_id ORDER BY p.created_at DESC'
    );

    const paymentsWithNames = result.rows.map(payment => ({
      ...payment,
      student_name: payment.first_name && payment.last_name ? `${payment.first_name} ${payment.last_name}` : 'Unknown'
    }));

    res.json(paymentsWithNames);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get reports
router.get('/reports', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    // Get collection rate
    const collectionResult = await pool.query(
      'SELECT SUM(CASE WHEN status = \'paid\' THEN amount ELSE 0 END) as paid, SUM(amount) as total FROM fees'
    );
    const paid = collectionResult.rows[0].paid || 0;
    const total = collectionResult.rows[0].total || 1;
    const collectionRate = Math.round((paid / total) * 100);

    // Get average per student
    const avgResult = await pool.query(
      'SELECT AVG(total_amount) as average FROM (SELECT SUM(amount) as total_amount FROM fees GROUP BY student_id) as subquery'
    );
    const averagePerStudent = Math.round(avgResult.rows[0].average || 0);

    // Get defaulting students
    const defaultingResult = await pool.query(
      'SELECT COUNT(DISTINCT student_id) as count FROM fees WHERE status = \'unpaid\''
    );
    const defaultingStudents = defaultingResult.rows[0].count || 0;

    // Get department summary
    const deptResult = await pool.query(`
      SELECT 
        s.department,
        COUNT(DISTINCT s.id) as total_students,
        SUM(f.amount) as total_fees,
        SUM(CASE WHEN f.status = 'paid' THEN f.amount ELSE 0 END) as total_paid,
        SUM(CASE WHEN f.status = 'unpaid' THEN f.amount ELSE 0 END) as outstanding
      FROM students s
      LEFT JOIN fees f ON s.id = f.student_id
      GROUP BY s.department
    `);

    res.json({
      collectionRate: collectionRate + '%',
      averagePerStudent,
      defaultingStudents,
      departmentSummary: deptResult.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get payment statistics (legacy endpoint)
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
