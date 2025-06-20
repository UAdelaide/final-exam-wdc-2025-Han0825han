const express = require('express');
const path = require('path');
const session = require('express-session');
require('dotenv').config();

const app = express();


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'superSecretDog',
  resave: false,
  saveUninitialized: true
}));
app.use(express.static(path.join(__dirname, '/public')));

// Routes
const walkRoutes = require('./routes/walkRoutes');
const userRoutes = require('./routes/userRoutes');
const loginRoutes = require('./routes/loginRoutes');
app.use('/api/walks', walkRoutes);
app.use('/api', userRoutes);
app.use('/', loginRoutes);


window.addEventListener('DOMContentLoaded', async () => {
  try {
    const meRes = await fetch('/api/users/me');
    const me = await meRes.json();
    console.log('当前 session 用户:', me);
  } catch (e) {
    console.error('获取 session 用户失败:', e);
  }
});
// Export the app
module.exports = app;

