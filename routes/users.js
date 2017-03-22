const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

router.post('/register', function(req, res, next) { //register the new user
  let newUser = new User({
    name: req.body.name,
    email: req.body.email,
    username: req.body.username,
    password: req.body.password,
    wins: 3,
    loses: 3
  });

  User.addUser(newUser, function(err, user){ //tells us if adding user was successful
    if(err) {
      res.json({success: false, msg:'Failed to register user'});
    }
    else {
      res.json({success: true, msg:'Registration successful'});
    }
  });
}); //register

router.post('/auth', function(req, res, next) {
  const username = req.body.username;
  const password = req.body.password;

  User.getUserByUsername(username, function(err, user){ //get username
    if(err) throw err;
    if(!user) {
      return res.json({success: false, msg: 'User not found'}); //if user exists
    }

    User.comparePassword(password, user.password, function(err, isMatch) { //if match password
      if(err) throw err;
      if(isMatch) {
        const token = jwt.sign(user, 'dankmemes', { //options
          expiresIn: 604800 //1 week
        });

        res.json({ //if match
          success: true,
          token: 'JWT '+token,
          user: {
            id: user._id,
            name: user.name,
            username: user.username,
            email: user.email
          }
        });
      }
      else { //if no match
          return res.json({success: false, msg: 'Wrong password'});
      }
    });
  });
}); //authenticate

router.get('/profile', passport.authenticate('jwt', {session: false}), function(req, res, next) { //session: false lets you protect
  res.json({user: req.user});
}); //profile

module.exports = router;
