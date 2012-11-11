var User = require('../../models/user')
  , Admin = require('../../models/admin')
  , util = require('util')
  , helpers = require('./helpers');
/*
 * Route for creating data to test
 */
module.exports = {

  // Function to create admin for the site
  createAdmin: function(req, res) {

    if (req.method !== 'POST') {
      res.render('test/createAdmin', {
        title: 'Create Admin',
      });
    } else {
      // Post request => save user
      var admin = new Admin({
        adminname: req.body.adminname,
        email: req.body.email,
        password: req.body.password,
        role: req.body.role
      });

      // Save the admin
      admin.save(function(err) {
        if (err) {
          console.log('Error: \n' + util.inspect(err.errors));
          res.redirect(500, '/test/create-admin');
        } else {
          console.log('Save admin successfully');
          res.redirect('/');
        }
      });
    }
  },

  // Function to create dummy user
  createUser: function(req, res) {

    if (req.method !== 'POST') {
      res.render('test/createUser', {
        title: 'Create User',
      });
    } else {
      // Post request
      // When the form is completed, handle file upload and create the user instance

      helpers.uploadFile(req.files.profilePhoto, function(err, newFileName) {
        // If error redirect
        if (err) {
          console.log('Error: \n' + util.inspect(err));
          return res.redirect('/test/create-user');
        }

        // Else create the the new user instance
        // Create the array of coordinations
        var lnglat = [parseFloat(req.body.longitude), parseFloat(req.body.latitude)];
        var user = new User({
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
          profilePhoto: newFileName,
          'lastLocation.coords': lnglat,
          'lastLocation.name': '',
        });

        // Save the new user 
        user.save(function(err) {
          if (err) {
            console.log('Error: \n' + util.inspect(err));
            res.redirect(500, '/test/create-user');
          } else {
            console.log('Save user successfully');
            res.redirect('/');
          }
        });
      });
    }
  },

  // Function to validate new Admin
  validateAdmin: function(req, res, next) {
    // Create rule for validate admin instance
    req.check('adminname', 'Invalid Username').notEmpty().is(/^[a-zA-Z0-9_]+$/);
    req.check('email', 'Invalid Email').notEmpty().isEmail();
    req.check('password', 'Password must not be empty').notEmpty();
    req.check('passwordConfirm', 'Password and password confirmation must match').notEmpty().equals(req.body.password);

    // Create the mapped errors array
    var errors = req.validationErrors(true);

    // If there is error redirect
    if (errors) {
      console.log("Error: \n" + util.inspect(errors));
      res.redirect('/test/create-admin');
    } else {
      next();
    }
  },

  // Function to validate new User
  validateUser: function(req, res, next) {
    // Create rule for validate user instance
    req.check('username', 'Invalid Username').notEmpty().is(/^[a-zA-Z0-9_]+$/);
    req.check('username', 'Username must have 6 to 20 characters').notEmpty().is(/^[a-zA-Z0-9_]+$/).len(6);
    req.check('email', 'Invalid Email').notEmpty().isEmail();
    req.check('password', 'Password must not be empty').notEmpty();
    req.check('password', 'Password must have 6 to 20 characters').len(6, 20);
    req.check('passwordConfirm', 'Password and password confirmation must match').notEmpty().equals(req.body.password);
    req.check('longitude', 'Longitude must be a float number').isFloat();
    req.check('latitude', 'Latitude must be a float number').isFloat();

    // Create the mapped errors array
    var errors = req.validationErrors(true);

    // If there is error redirect
    if (errors) {
      console.log("Error: \n" + util.inspect(errors));
      res.redirect('/test/create-user');
    } else {
      next();
    }
  }
};
