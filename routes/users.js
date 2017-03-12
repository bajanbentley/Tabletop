const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

router.post('/register', function(req, res, next) {
  let newUser = new User({
    name: req.body.name,
    email: req.body.email,
    username: req.body.username,
    password: req.body.password
  });

  User.addUser(newUser, function(err, user){
    if(err) {
      console.log(err);
      res.json({success: false, msg:'Failed to register user'});
    }
    else {
      res.json({success: true, msg:'Registration successful'});
    }
  });
}); //register

router.post('/auth', function(req, res, next) {
  res.send('Authenticate');
}); //authenticate

router.get('/profile', function(req, res, next) {
  res.send('PROFILE');
}); //profile

module.exports = router;
