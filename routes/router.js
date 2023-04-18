const express = require('express');
const router = express.Router();

// GET Routes
router.get('/', (req, res) => {
  res.render('index.ejs', { title: 'Home' });
});

router.get('/login', (req, res) => {
  res.render('login', { title: 'Login' });
});

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

module.exports = router;