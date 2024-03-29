var User = require('../../models/user')
  , moment = require('moment')
  , _ = require('lodash')
  , util = require('util')
  , helpers = require('./helpers');

moment.lang('jp');

/*
 * Route for user
 */
module.exports = {
  
  /*
   * Function to show the user list
   */
  index: function(req, res) {
    // Find all online users
    User.find({ type: 'real' }, null, { sort: 'username', limit: 60 }, function(err, users) {
      if (err) {
        // return handleError(err);
        return res.render('user/index', {
          title: 'ユーザー',
          slug: 'user',
        });
      }

      res.render('user/index', {
        title: 'ユーザー',
        slug: 'user',
        users: users,
        page: 1,
        message: req.flash('message')
      });
    });
  },


  /*
   * Function to search for user using username
   */
  searchUsername: function(req, res) {
    // Get the param
    var searchKey = req.param('searchUsername')
      , statusOption = req.param('statusOption');

    // console.log(searchKey + '\n' + location + '\n' + username + '\n' + online);

    var query;
    // ----- If this is the search by usename
    // Get the )egex string of username
    var usernameRegex = new RegExp(searchKey, 'i');
    // console.log(usernameRegex);

    // Create the query based on status option
    if (statusOption === 'all') {
      query = User.find({ 'username': usernameRegex, type: 'real' });
    } else {
      query = User.find({ 'username': usernameRegex, 'status': statusOption, 'type': 'real' });
    }

    query.exec(function(err, users) {

      if (err) {
        // return handleError(err);
        return res.render('user/index', {
          title: 'User',
          slug: 'user',
          searchKey: searchKey,
        });
      }

      res.render('user/index', {
        title: 'User',
        slug: 'user',
        users: users,
        searchKey: searchKey,
      });

    });

  },

  /*
   * Function to search for user using username and return JSON
   */
  searchUsernameAPI: function(req, res) {
    // Get the parameters
    var searchKey = req.query.searchKey
      , statusOption = req.query.statusOption;

    console.log(req.query);
    var query;

    // Get the regex string of username
    var usernameRegex = new RegExp(searchKey, 'i');
    // console.log(usernameRegex);

    var itemsPerPage = 60;
    var skipItems = 0;

    // If there is a page number in the query calculate the skip Item
    if (req.query.page) {
      var page = parseInt(req.query.page, 10);
      // If valid page variable, increade the skipItems
      if (_.isNumber(page) && page > 0 ) {
        skipItems += itemsPerPage * (page - 1);
      }
    }

    // Create the query based on status option
    if (statusOption === 'all') {
      query = User.find({ 'username': usernameRegex, type: 'real' });
    } else {
      query = User.find({ 'username': usernameRegex, 'status': statusOption, type: 'real' });
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
  }, 

  /*
   * Function to search for users using location data and return JSON
   */
  searchLocationAPI: function(req, res) {
    // Get the bounds of the map
    var southWest = req.query.bounds.southWest,
        northEast = req.query.bounds.northEast;

    // Create the box to query in Mongo
    var box = [[parseFloat(southWest[1]), parseFloat(southWest[0])], [parseFloat(northEast[1]), parseFloat(northEast[0])]];

    console.log(box);
    // Query to find the users in the bounds
    User.find({ 'lastLocation.coords': { $within: { $box: box } }, type: 'real' }, 'id username profilePhoto status lastLocation gender', function(err, users) {
      if (err) {
        return res.json({ error: 'System Error' });
      }

      console.log(util.inspect(users));
      return res.json(users);
    });

  },

  /*
   * Function to show a user profile
   */
  showProfile: function(req, res) {
    var userId = req.param('id');

    // console.log(userId);
    User.findById(userId , function(err, user) {
      if (err) {
        console.log(util.inspect(err));
        return res.redirect('/');
      }

      // If there is no user with this id redirect
      if (!user) {
        return res.redirect('/');
      }

      // Change the birthday of User
      if (!_.isUndefined(user.birthday) && !_.isEmpty(user.birthday)) {
        user.birthday = moment.unix(parseInt(user.birthday, 10)).format('DD/MM/YYYY');
      }

      // Change the format of the gender
      if (!_.isUndefined(user.gender) && !_.isEmpty(user.gender)) {
        user.gender = user.gender.charAt(0).toUpperCase() + user.gender.slice(1);
      }

      if (user.type === 'fake') {
        // If there is a user render the profile page for partimer 
        return res.render('parttimer/profile', {
          title: 'アルバイト情報',
          slug: 'parttimer',
          user: user,
          message: req.flash('message')
        });
      } 
      
      // Render the profile page for user
      return res.render('user/profile', {
        title: 'ユーザー情報',
        slug: 'user',
        user: user
      });
      
    });
  },

  /*
   * Function to ban a user
   */
  banUser: function(req, res) {
    var userId = req.param('id');

    // Update the model change status and revoke the accessToken from the user
    User.findByIdAndUpdate(userId, { $set: { 'status': 'banned', 'accessToken': '' } }, function(err, user) {
      // If error
      if (err) {
        res.redirect('/');
      }


      if (user.type === 'fake') {
        // If there is a user render the profile page for partimer 
        return res.redirect('/parttimer/' + user.id);
      } 
      
      // Render the profile page for user
      return res.redirect('/user/' + user.id);
    });
  },

  /*
   * Function to reenable a user
   */
  enableUser: function(req, res) {
    var userId = req.param('id');

    // Find the user object and update
    User.findOneAndUpdate({ '_id': userId, 'status': 'banned' }, { 'status': 'offline' }, function(err, user) {
      // If error
      if (err) {
        return res.redirect('/');
      }

      console.log(util.inspect(user));

      // Re-render the user profile
      if (user.type === 'fake') {
        // If there is a user render the profile page for partimer 
        return res.redirect('/parttimer/' + user.id);
      } 
      
      // Render the profile page for user
      return res.redirect('/user/' + user.id);
    });
  },

  /*
   * Function to delete a User
   */
  deleteUser: function(req, res) {
    var userId = req.param('id');

    // Delete user
    User.findByIdAndRemove(userId, function(err, user) {
      // If error rerender the page
      if (err) {
        // Re-render the user profile
        return res.redirect('/');
      }

      // Delete the profile photo
      helpers.deletePhoto(user.profilePhoto);

      // Delete all the key related to this user in the redis
      var redis = require('redis')
        , redisClient = redis.createClient();

      redisClient.smembers('chat:' + userId + ':keys', function(err, replies) {
        // If err
        if (err) {
          console.log('Error deleting data');
          return;
        }

        // If not, delete all the key in the replies
        if (replies.length !== 0) {
          redisClient.del(replies, redis.print);
        }
      });

      // Remove all the references of this id in the database
      User.find({ $or: [ { favoriteUsers: userId }, { viewedUsers: userId }, { viewedBy: userId } ] }, function(err, users) {
        // if err
        if (err) {
          console.log('Error finding users with references to this user');
          return;
        }

        // If there is no user return
        if (users.length === 0) {
          console.log('There is no refenrences of this user id');
          return;
        }

        // Remove the references
        _.forEach(users, function(user) {
          user.favoriteUsers.remove(userId);
          user.viewedBy.remove(userId);
          user.viewedUsers.remove(userId);
          // Save the user
          user.save(function(err, user) {
            if (err) {
              console.log('Error delete the references');
            }
          });
        });

        console.log('Successfully remove the user id references from the database');
        return;
      });

      // Create the flash message and redirect
      req.flash('message', 'Successfully delete user');
      if (user.type === 'fake') {
        return res.redirect('parttimer');
      }
      
      return res.redirect('/');
    });
  }
};
