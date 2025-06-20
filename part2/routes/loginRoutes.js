const express = require('express');
const router = express.Router();
const pool = require('../models/db');

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

// Logout route: destroy session, clear cookie, and redirect to login page
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      // Log server-side error and inform user
      console.error('Failed to destroy session:', err);
      return res.status(500).send('Logout failed');
    }

    // Clear cookie and redirect to login form
    res.clearCookie('connect.sid'); // 'connect.sid' is default session cookie name
    return res.redirect('/index.html'); // redirect to login page
  });
});




module.exports = router;
