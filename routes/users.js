const express = require('express');
const router = express.Router();

router.get('/register', function(req, res, next) {
  res.send('REGISTER');
}); //register

router.get('/auth', function(req, res, next) {
  res.send('Authenticate');
}); //authenticate

router.get('/profile', function(req, res, next) {
  res.send('PROFILE');
}); //profile

module.exports = router;
