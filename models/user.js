const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validation');
const bcrypt = require('bcryptjs');

//User schema
const UserSchema = mongoose.Schema({ //how our schema should look
  name: {
    type: String
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  wins: {
    type: Number
  },
  loses: {
    type: Number
  }
});

UserSchema.plugin(uniqueValidator);

const User = module.exports = mongoose.model('User', UserSchema); //Allows for routes to make new user schema

module.exports.getUserById = function(id, callback) {
  User.findById(id, callback);
}

module.exports.getUserByUsername = function(username, callback) {
  const query = {username: username}
  User.findOne(query, callback);
}

module.exports.addUser = function(newUser, callback) { //encrypt password
  bcrypt.genSalt(10, function(err, salt) { //generate a salt
    bcrypt.hash(newUser.password, salt, function(err, hash) { //hash
      newUser.password = hash;
      newUser.save(callback);
    });
  });
}

module.exports.comparePassword = function(candidatePassword, hash, callback) {
  bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    if(err) throw err;
    callback(null, isMatch);
  });
}
