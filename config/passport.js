const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/user');

module.exports = function(passport) {
  let opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeader();
  opts.secretOrKey = 'dankmemes';
  passport.use(new JwtStrategy(opts, function(jwt_payload, done){
    User.getUserById(jwt_payload._doc._id, function(err, user){
      if(err) {
        return done(err,false);
      }

      if(user) {
        return done(null, user);
      }
      else {
        return done(null, false);
      }
    });
  }));
}
