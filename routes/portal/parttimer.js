var User = require('../../models/user')
  , userCtrl = require('./user')
  , _ = require('lodash')
  , util = require('util')
  , helpers = require('./helpers');

/**
 * Route for parttimer
 */
function Parttimer() {
}

// Implement javascript inheritance
Parttimer.prototype = userCtrl;

/*
 * Function to render the index page for part-timer
 */
Parttimer.prototype.indexParttimer = function(req, res) {
  // Find all online users
  User.find({ type: 'fake' }, null, { sort: 'username'}, function(err, users) {
    if (err) {
      // return handleError(err);
      return res.render('parttimer/index', {
        title: 'User',
        slug: 'parttimer',
      });
    }

    res.render('parttimer/index', {
      title: 'User',
      slug: 'parttimer',
      users: users,
      message: req.flash('message')
    });
  });
};

/*
 * Function to search for part-timer 
 */
Parttimer.prototype.searchParttimer = function(req, res) {
  // Get the parameters
  var searchKey = req.query.searchKey
    , statusOption = req.query.statusOption;

  console.log(req.query);
  var query;

  // Get the regex string of username
  var usernameRegex = new RegExp(searchKey, 'i');
  // console.log(usernameRegex);

  // Create the query based on status option
  if (statusOption === 'all') {
    query = User.find({ 'username': usernameRegex, type: 'fake' });
  } else {
    query = User.find({ 'username': usernameRegex, 'status': statusOption, type: 'fake' });
  }

  query.select('id username profilePhoto email status lastLocation').exec(function(err, users) {

    if (err) {
      // return handleError(err);
      return res.json({ error: 'System Error' });
    }

    console.log(util.inspect(users));
    // return json
    return res.json(users);
  });
};

/*
 * Function to validate the uniqueness of username
 */
Parttimer.prototype.checkUsername = function(req, res) {
  // Find the user with the username
  User.findOne({ username: req.param('value') }, function(err, user) {
    if (err) {
      console.log(err);
      return res.json({
        value: req.param('value'),
        valid: false,
        message: 'System error'
      });
    }

    // If there is a user, return error
    if (user) {
      return res.json({
        value: req.param('value'),
        valid: false,
        message: 'This username was already taken'
      });
    }

    // Return the success message
    return res.json({
      value: req.param('value'),
      valid: true,
    });
  });
};

/*
 * Function to validate the uniqueness of email
 */
Parttimer.prototype.checkEmail = function(req, res) {
  // Find the user with the email
  User.findOne({ email: req.param('value') }, function(err, user) {
    if (err) {
      console.log(err);
      return res.json({
        value: req.param('value'),
        valid: false,
        message: 'System error'
      });
    }

    // If there is a user, return error
    if (user) {
      return res.json({
        value: req.param('value'),
        valid: false,
        message: 'There is another user with this email'
      });
    }

    // Return the success message
    return res.json({
      value: req.param('value'),
      valid: true,
    });
  });
};

/*
 * Function to create a new parttimer
 */
Parttimer.prototype.createParttimer = function(req, res) {
  // Create new user instance
  var user = new User({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    type: 'fake',
  });

  // Save the new user 
  user.save(function(err) {
    if (err) {
      console.log('Error: \n' + util.inspect(err));
      req.flash('message', 'There is problem saving new parttimer');
      res.redirect(500, '/parttimer');
    } else {
      console.log('Save parttimer successfully');
      req.flash('message', 'Successfully create new parttimer! If you want to change parttimer detail, visit parttimer portal');
      res.redirect('/parttimer');
    }
  });
};

/*
 * Function to validate parttimer (double check)
 */
Parttimer.prototype.validateParttimer = function(req, res, next) {
    // Create rule for validate user instance
    req.check('username', 'Invalid Username').notEmpty().is(/^[a-zA-Z0-9_]+$/);
    req.check('username', 'Username must have 6 to 20 characters').notEmpty().is(/^[a-zA-Z0-9_]+$/).len(6);
    req.check('email', 'Invalid Email').notEmpty().isEmail();
    req.check('password', 'Password must not be empty').notEmpty();
    req.check('password', 'Password must have 6 to 20 characters').len(6, 20);
    req.check('passwordConfirm', 'Password and password confirmation must match').notEmpty().equals(req.body.password);

  // Create the mapped errors array
  var errors = req.validationErrors(true);

  // If there is error redirect
  if (errors) {
    console.log("Error: \n" + util.inspect(errors));
    res.redirect('/parttimer');
  } else {
    next();
  }
};

module.exports = new Parttimer();
