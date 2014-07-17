var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , Admin = require('../models/admin');


// Define authentication strategy
passport.use(new LocalStrategy({
    usernameField: 'adminname',
  },
  function(adminname, password, done) {
    console.log(adminname + password);
    Admin.authenticate(adminname, password, function(err, admin, message) {
      done(err, admin, message);
    });
  }
));


// Serialize user on login
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

// Deserialize user on log out
passport.deserializeUser(function(id, done) {
  Admin.findById(id, function(err, user) {
    done(err, user);
  });
});

module.export = {};
