const jwt = require('jsonwebtoken');
const { pool } = require('../db/database');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const secret = process.env.JWT_SECRET || 'your_jwt_secret';

  jwt.verify(token, secret, (err, user) => {
    if (err) {
      console.error('Token verification error:', err);
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

const authorizeAdmin = async (req, res, next) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(403).json({ error: 'User not authenticated' });
    }

    const result = await pool.query('SELECT role FROM users WHERE id = $1', [req.user.userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    next();
  } catch (error) {
    console.error('Authorization error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { authenticateToken, authorizeAdmin };
