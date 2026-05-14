const express = require('express');
const axios = require('axios');
const { pool } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Initialize payment
router.post('/initialize', authenticateToken, async (req, res) => {
  try {
    const { feeId, amount, email } = req.body;

    // Get student
    const studentResult = await pool.query(
      'SELECT id FROM students WHERE user_id = $1',
      [req.user.userId]
    );
    
    const studentId = studentResult.rows[0].id;

    // Create payment record
    const paymentResult = await pool.query(
      'INSERT INTO payments (student_id, fee_id, amount, payment_method, status) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [studentId, feeId, amount, 'paystack', 'pending']
    );

    const paymentId = paymentResult.rows[0].id;

    // Initialize Paystack payment
    try {
      const response = await axios.post(
        'https://api.paystack.co/transaction/initialize',
        {
          email: email,
          amount: amount * 100, // Paystack uses kobo
          metadata: {
            payment_id: paymentId,
            fee_id: feeId
          }
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      res.json({
        authorization_url: response.data.data.authorization_url,
        access_code: response.data.data.access_code,
        reference: response.data.data.reference,
        payment_id: paymentId
      });
    } catch (paystackError) {
      res.status(400).json({ error: 'Failed to initialize payment', details: paystackError.message });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify payment
router.post('/verify', authenticateToken, async (req, res) => {
  try {
    const { reference, paymentId } = req.body;

    // Verify with Paystack
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      }
    );

    if (response.data.data.status === 'success') {
      // Update payment status
      await pool.query(
        'UPDATE payments SET status = $1, transaction_ref = $2, payment_date = NOW() WHERE id = $3',
        ['completed', reference, paymentId]
      );

      // Update fee status
      const paymentData = await pool.query(
        'SELECT fee_id FROM payments WHERE id = $1',
        [paymentId]
      );

      if (paymentData.rows[0].fee_id) {
        await pool.query(
          'UPDATE fees SET status = $1 WHERE id = $2',
          ['paid', paymentData.rows[0].fee_id]
        );
      }

      // Generate receipt
      const receiptNumber = `RCP-${Date.now()}`;
      await pool.query(
        'INSERT INTO receipts (payment_id, receipt_number) VALUES ($1, $2)',
        [paymentId, receiptNumber]
      );

      res.json({ success: true, message: 'Payment verified', receiptNumber });
    } else {
      await pool.query(
        'UPDATE payments SET status = $1 WHERE id = $2',
        ['failed', paymentId]
      );
      res.status(400).json({ error: 'Payment failed' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get payment history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const studentResult = await pool.query(
      'SELECT id FROM students WHERE user_id = $1',
      [req.user.userId]
    );
    
    const studentId = studentResult.rows[0].id;
    const result = await pool.query(
      'SELECT p.*, r.receipt_number FROM payments p LEFT JOIN receipts r ON p.id = r.payment_id WHERE p.student_id = $1 ORDER BY p.created_at DESC',
      [studentId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
