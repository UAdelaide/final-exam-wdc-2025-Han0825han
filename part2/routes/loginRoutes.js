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


// GET /api/users/mydogs - get dogs owned by logged-in user
router.get('/mydogs', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'owner') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const [rows] = await pool.query(
      'SELECT dog_id, name FROM Dogs WHERE owner_id = ?',
      [req.session.user.id]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch dogs' });
  }
});


module.exports = router;
