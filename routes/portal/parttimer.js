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

Parttimer.prototype.index = function(req, res) {
  // Find all online users
  User.find({ type: 'fake' }, null, { sort: 'username'}, function(err, users) {
    if (err) {
      // return handleError(err);
      return res.render('user/index', {
        title: 'User',
        slug: 'user',
      });
    }

    res.render('user/index', {
      title: 'User',
      slug: 'user',
      users: users,
      message: req.flash('message')
    });
  });
};

module.exports = new Parttimer();
