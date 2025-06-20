const express = require('express');
const router = express.Router();
const pool = require('../models/db'); // 使用你已有的 db.js

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await pool.query(
      'SELECT * FROM Users WHERE username = ? AND password_hash = ?',
      [username, password]
    );

    if (rows.length === 1) {
      const user = rows[0];

      req.session.user = {
        id: user.user_id,
        username: user.username,
        role: user.role
      };

      if (user.role === 'owner') {
        res.redirect('/owner-dashboard.html');
      } else {
        res.redirect('/walker-dashboard.html');
      }
    } else {
      res.send('❌ Invalid credentials');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
