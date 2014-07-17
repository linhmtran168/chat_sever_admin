var _ = require('lodash')
  , bcrypt = require('bcrypt')
  , Admin = require('../../models/admin');
/*
 * Admin route
 */
module.exports = {
  /*
   * Function to show login page
   */
  login: function(req, res) {
    var message = req.flash('error');
    res.render('admin/login', {
      title: 'ログイン',
      message: message,
    });
  },

  /*
   * Function for a admin to update his info
   */
  update: function(req, res) {
    if (req.method !== 'POST') {
      // Get the message
      var message = req.flash('message');

      return res.render('admin/update', {
        title: '管理者アカウント',
        message: message
      });
    } 

    // Post parameter
    // Get the admin from the databaose
    Admin.findById(req.user.id, function(err, admin) {
      // Error 
      if (err) {
        console.log(err);
        req.flash('message', 'System Error');
        return res.redirect('/');
      }

      // Change password
      admin.password = req.body.password;

      // Save the admin
      admin.save(function(err) {
        // Error 
        if (err) {
          console.log(err);
          req.flash('message', 'System Error');
          return res.redirect('/');
        }

        req.flash('message', 'パスワードの変更が成功しました');
        return res.redirect('/admin/account');
      });
    });
   
  },

  /*)
   * Function to send message to all user
   */
  message: function(req, res) {
    // Render the page if it is GET request
    if (req.method !== 'POST') {
      return res.render('admin/message', {
        title: 'メッセージを送る',
        slug: 'operations',
        message: req.flash('message')
      });
    }

    // POST request
    // Handle the request with a child process
    if (!req.body.message || !req.body.receiver) {
      req.flash('message', 'ッセージの送信が失敗しました');
      return res.redirect('back');
    }

    process.nextTick(function() {
      var childPath = '/home/linhtm/sites/ogorinAdmin/tasks/';
      var child = require('child_process').fork(childPath + 'sendMessage.js', [], { cwd: childPath, env: process.env } );

      var data = { message: req.body.message, receiver:  req.body.receiver };
      child.send(data);

      child.on('message', function(message) {
        console.log('Form child process: ' + message);
      });
    });

    // Redirect the page
    req.flash('message', 'メッセージが送信されました');
    return res.redirect('/operations');
  },

  /* 
   * Function to logout
   */
  logout: function(req, res) {
    req.logout();
    res.redirect('/');
  },

  checkUpdatePassword: function(req, res, next) {
    // Check for password
    req.check('oldPassword', 'パスワードは必須です').notEmpty();
    req.check('password', 'パスワードは4文字以上、20文字以内でなければなりません').len(4, 20);
    req.check('passwordConfirm', 'パスワードとパスワードの確認は一致しなけらばなりません').notEmpty().equals(req.body.password);

    // Create the mapped errors array
    var errors = req.validationErrors(true);

    if (!_.isEmpty(errors)) {
      // Get the error messages
      var msgArray =  _.map(errors, function(error) {
        return error.msg;
      });

      req.flash('message', msgArray[msgArray.length - 1]);
      return res.redirect('/admin/account');
    }
    
    // Check for the old password
    if (!bcrypt.compareSync(req.body.oldPassword, req.user.hash)) {
      req.flash('message', '旧パスワードは正しくありません');
      return res.redirect('/admin/account');
    }

    return next();
  }
};
