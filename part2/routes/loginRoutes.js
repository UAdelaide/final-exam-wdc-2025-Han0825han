const express = require('express');
const router = express.Router();
const pool = require('../models/db');

// POST /login：登录验证 + session 设置 + 根据角色跳转
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await pool.query(
      'SELECT * FROM Users WHERE username = ? AND password_hash = ?',
      [username, password]
    );

    if (rows.length === 1) {
      const user = rows[0];

      // 存储登录用户到 session
      req.session.user = {
        id: user.user_id,
        username: user.username,
        role: user.role
      };

      // 登录成功后根据角色跳转
      if (user.role === 'owner') {
        return res.redirect('/owner-dashboard.html');
      } else if (user.role === 'walker') {
        return res.redirect('/walker-dashboard.html');
      } else {
        return res.status(403).send('Unknown role');
      }
    } else {
      return res.status(401).send('Invalid username or password');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error during login');
  }
});

// GET /logout：清除 session 并跳回首页
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Failed to destroy session:', err);
      return res.status(500).send('Logout failed');
    }
    res.clearCookie('connect.sid');
    return res.redirect('/index.html');
  });
});

// GET /api/users/mydogs：仅 owner 可访问，获取其狗狗列表
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
