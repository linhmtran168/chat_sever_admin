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
  User.find({ type: 'fake' }, null, { sort: 'username', limit: 60 }, function(err, users) {
    if (err) {
      // return handleError(err);
      return res.render('parttimer/index', {
        title: 'ユーザー',
        slug: 'parttimer',
      });
    }

    res.render('parttimer/index', {
      title: 'ユーザー',
      slug: 'parttimer',
      users: users,
      page: 1, 
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

  // If there is a page number in the query calculate the skip Item
  var itemsPerPage = 60;
  var skipItems = 0;

  if (req.query.page) {
    var page = parseInt(req.query.page, 10);
    // If valid page variable, increade the skipItems
    if (_.isNumber(page) && page > 0 ) {
      skipItems += itemsPerPage * (page - 1);
    }
  }

  // Create the query based on status option
  if (statusOption === 'all') {
    query = User.find({ 'username': usernameRegex, type: 'fake' });
  } else {
    query = User.find({ 'username': usernameRegex, 'status': statusOption, type: 'fake' });
  }

  query.skip(skipItems).limit(itemsPerPage).select('id username profilePhoto email status lastLocation').sort({ username: 1 }).exec(function(err, users) {

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
      req.flash('message', '新しいパートタイマーの作成が成功しました');
      res.redirect('/parttimer');
    }
  });
};

/*
 * Function to reset password for a parttimer
 */
Parttimer.prototype.changePassword = function(req, res) {
  // Find the corresponding user with the user id
  User.findById(req.params.id,function(err, user) {
    if (err) {
      return res.redirect('/parttimer/' + req.params.id);
    }

    if (!user) {
      return res.redirect('/parttimer');
    }

    user.password = req.body.password;
    user.save(function(err) {
      if (err) {
        console.log('Error: \n' + util.inspect(err));
        req.flash('message', 'There is problem chaning password');
        return res.redirect(500, '/parttimer/' + user.id);
      }

      req.flash('message', 'パスワードの変更が成功しました');
      return res.redirect('/parttimer/' + user.id);
    });
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
        message: 'このユーザー名が既に登録されました'
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
        message: 'このメールアドレスが既に登録されました'
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
 * Function to validate parttimer (double check)
 */
Parttimer.prototype.validateParttimer = function(req, res, next) {
    // Create rule for validate user instance
    req.check('username', 'ユーザー名は正しくありません').notEmpty().is(/^\S+$/);
    req.check('username', 'ユーザー名は1文字以上、30文字以内でなければなりません').len(1, 30);
    req.check('email', 'メールアドレスは正しくありません').isEmail();
    req.check('password', 'パスワードは必須です').notEmpty();
    req.check('password', 'パスワードは4文字以上、30文字以内でなければなりません').len(4, 30);
    req.check('passwordConfirm', 'パスワードとパスワードの確認は一致しなけらばなりません').notEmpty().equals(req.body.password);

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

/*
 * Function to validate parttimer password (double check)
 */
Parttimer.prototype.validatePassword = function(req, res, next) {
    // Create rule for validate user instance
    req.check('password', 'パスワードは必須です').notEmpty();
    req.check('password', 'パスワードは4文字以上、20文字以内でなければなりません').len(4, 20);
    req.check('passwordConfirm', 'パスワードとパスワードの確認は一致しなけらばなりません').notEmpty().equals(req.body.password);

  // Create the mapped errors array
  var errors = req.validationErrors(true);

  // If there is error redirect
  if (errors) {
    console.log("Error: \n" + util.inspect(errors));
    res.redirect('/parttimer/' + req.params.id);
  } else {
    next();
  }
};

module.exports = new Parttimer();
