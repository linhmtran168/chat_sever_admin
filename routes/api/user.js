/*
 * API routes for user
 */
var User = require('../../models/user')
  , util = require('util')
  , helpers = require('./helpers')
  , _ = require('lodash');

module.exports = {
  /*
   * Function to register a user with the service
   */
  register: function(req, res) {
    "use strict";
    // Create the new user instance
    var user = new User({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      status: 'online',
      loggedIn: Math.round(+new Date()/1000)
    });

    // Save the new user 
    user.save(function(err) {
      if (err) {
        console.log(util.inspect(err));
        return res.json({
          status: 0,
          error: {
            type: 'system',
            message: 'System Error'
          }
        });
      }

      // Create the accessToken for thi suser
      user.createAccessToken(function(err) {
        if (err) {
          console.log(util.inspect(err));
          return res.json({
            status: 0,
            error: {
              type: 'system',
              message: 'System Error'
            }
          });
        }
        return res.json({
          status: 1,
          user: {
            _id: user.id,
            username: user.username,
            email: user.email,
            accessToken: user.accessToken,
            loggedIn: user.loggedIn,
          },
          message: 'Successfully register the user'
        });
      });
    });
  },

  /*
   * Function to login a user
   */
  login: function(req, res) {
    // Call the authenticate method of the User model
    User.authenticate(req.body.username, req.body.password, function(err, user, message) {
      // If err return the error message
      if (err) {
        return res.json({
          status: 0,
          error: {
            type: 'authentication',
            message: message.message
          }
        });
      }

      // If successful login return the accessToken
      if (user) {
        // Create the accessToken for thi suser
        user.createAccessToken(function(err) {
          if (err) {
            console.log(util.inspect(err));
            return res.json({
              status: 0,
              error: {
                type: 'system',
                message: 'System Error'
              }
            });
          }

          return res.json({
            status: 1,
            user: {
              _id: user.id,
              username: user.username,
              email: user.email,
              accessToken: user.accessToken,
              loggedIn: user.loggedIn,
            },
            message: 'Successfully login the user'
          });
        });
      }
    });
  },

  /*
   * Function to logout a user
   */
  logout: function(req, res) {
    // Find the user and remove its accessToken
    User.findByIdAndUpdate(req.currentUserId, { 'accessToken': '', 'status': 'offline' }, function(err, user) {
      // If a error occurs
      if (err) {
        return res.json({
          status: 0,
          error: {
            type: 'system',
            message: 'System Error'
          }
        });
      }

      // return the success response
      return res.json({
        status: 1,
        message: 'Successfully log out',
      });
    });
  },

  /*
   * Function to get a user information
   */
  getUserInfo: function(req, res) {
    // Find the corresponding user
    User.findById(req.params.id, '-hash -accessToken -createdAt -updatedAt', function(err ,user) {
      // If a error occurs
      if (err) {
        return res.json({
          status: 0,
          error: {
            type: 'system',
            message: 'System Error'
          }
        });
      }

      // Send the successful message
      return res.json({
        status: 1,
        user: user,
        message: 'Successfully get user\'s information'
      });

    });
  },

  /*
   * Function to update a user profile
   */
  updateProfile: function(req, res) {
    // Find the corresponding user
    User.findById(req.currentUserId, '-hash -accessToken -loggedIn -createdAt -updatedAt', function(err, user) {
      // If a error occurs
      if (err) {
        return res.json({
          status: 0,
          error: {
            type: 'system',
            message: 'System Error'
          }
        });
      }

      // Update user profile
      if (!_.isUndefined(req.body.about)) {
        user.about = req.body.about;
      }

      if (!_.isUndefined(req.body.statusMessage)) {
        user.statusMessage = req.body.statusMessage;
      }

      if (!_.isUndefined(req.body.gender)) {
        user.gender = req.body.gender;
      }

      if (!_.isUndefined(req.body.screenName)) {
        user.screenName = req.body.screenName;
      }

      if (!_.isUndefined(req.body.bloodType)) {
        user.bloodType = req.body.bloodType;
      }

      if (!_.isUndefined(req.body.birthday)) {
        user.birthday = req.body.birthday;
      }

      if (!_.isUndefined(req.body.occupation)) {
        user.occupation = req.body.occupation;
      }

      if (!_.isUndefined(req.body.email)) {
        user.email = req.body.email;
      }

      // If there is a photo upload the photo else return the response
      if (!_.isUndefined(req.files) && !_.isUndefined(req.files.profilePhoto)) {
        // Upload the image file
        console.log('To upload file');
        console.log(req.files);
        helpers.uploadFile(req.files.profilePhoto, function(err, newPhotoName) {
          // If file type check fails
          if (newPhotoName === false) {
            // Return the error message
            return res.json({
              status: 0,
              error: {
                type: err.type,
                message: err.message
              }
            });
          }

          // If there is error saving the file
          if (err) {
            return res.json({
              status: 0,
              error: {
                type: 'system',
                message: 'System Error'
              }
            });
          }

          // If success saving the file
          user.profilePhoto = newPhotoName;

          // Attempt to save the user
          user.save(function(err) {
            // If a error occurs
            if (err) {
              return res.json({
                status: 0,
                error: {
                  type: 'system',
                  message: 'System Error'
                }
              });
            }
            
            // Send the successful message
            return res.json({
              status: 1,
              user: user,
              message: 'Successfully update the user'
            });
          });
        });
      } else {
        // Attempt to save the user
        user.save(function(err) {
          // If a error occurs
          if (err) {
            return res.json({
              status: 0,
              error: {
                type: 'system',
                message: 'System Error'
              }
            });
          }

          return res.json({
            status: 1,
            user: user,
            message: 'Successfully update the user'
          });
        });
      }
    });
  },

  /*
   * Function for a user to update his/her location
   */
  updateLocation: function(req, res) {
    // Get the user instance and update the location
    User.findById(req.currentUserId, function(err, user) {
      // If a err occured
      if (err) {
        return res.json({
          status: 0,
          error: {
            type: 'system',
            message: 'System Error'
          }
        });
      }

      // Check if there is a location name
      if (!_.isUndefined(req.body.locationName)) {
        user.lastLocation.name = req.body.locationName;
      }

      // Get the longlat from the request
      var lnglat = [parseFloat(req.body.longitude), parseFloat(req.body.latitude)];
      user.lastLocation.coords = lnglat;

      // Attempt to save the user
      user.save(function(err, user) {
        // If a err occured
        if (err) {
          return res.json({
            status: 0,
            error: {
              type: 'system',
              message: 'System Error'
            }
          });
        }

        // Return the successful message
        return res.json({
          status: 1,
          lastLocation: user.lastLocation,
          message: 'Successfully update user location'
        });
      });
    });
  },

  /*
   * Function to get near by user according to his/her location
   */
  getNearbyUsers: function(req, res) {
    // Get the currentUser
    User.findById(req.currentUserId, function(err, user) {
      // If an error occured
      if (err) {
        return res.json({
          status: 0,
          error: {
            type: 'system',
            message: 'System Error'
          }
        });
      }

      var radius = 10;
      var earthRadius = 6378;

      // check if there is a radius param, use it to query
      if (!_.isUndefined(req.query.radius)) {
        radius = parseFloat(req.query.radius);
      }

      // Check if user has location param or not
      console.log(user.lastLocation.coords);
      if (_.isEmpty(user.lastLocation.coords)) {
        return res.json({
          status: 0,
          error: {
            type: 'location',
            message: 'This user has not yet updated his/her location'
          }
        });
      }

      User.find({ 'lastLocation.coords': { $within: { $centerSphere: [ user.lastLocation.coords, radius/earthRadius ] } }, 'status': 'online' }, '-hash -accessToken -createdAt -updatedAt', function(err, users) {
        // If an error occured
        if (err) {
          return res.json({
            status: 0,
            error: {
              type: 'system',
              message: 'System Error'
            }
          });
        }


        // Return the users
        return res.json({
          status: 1,
          users: users,
          message: 'Successfully get the list of users'
        });
      });

    });
  },

  /* 
   * Function to add a user to favorite list
   */
  addToFavorite: function(req, res) {
    // Find the user with the given id in the param
    User.findById(req.params.id, function(err, userToAdd) {
      // If an error occured
      if (err) {
        return res.json({
          status: 0,
          error: {
            type: 'system',
            message: 'System Error'
          }
        });
      }

      // If no user was return
      if (!userToAdd) {
        return res.json({
          status: 0,
          error: {
            type: 'user',
            message: 'There is no user with that id',
          }
        });
      }

      // If a user with that id exist
      User.findById(req.currentUserId, function(err, user) {
        // If an error occured
        if (err) {
          return res.json({
            status: 0,
            error: {
              type: 'system',
              message: 'System Error'
            }
          });
        }

        if (user.favoriteUsers.indexOf(userToAdd.id) !== -1) {
          return res.json({
            status: 0,
            error: {
              type: 'user',
              message: 'This user already in your favorite list'
            }
          });
        }

        // Attemp to save the user to add to current user favorite list
        user.favoriteUsers.push(userToAdd.id);

        user.save(function(err) {
          // If an error occured
          if (err) {
            return res.json({
              status: 0,
              error: {
                type: 'system',
                message: 'System Error'
              }
            });
          }
          
          // If successful, send the successful message
          return res.json({
            status: 1,
            message: 'Successfully add the user to favorite list'
          });
        });
      });
    });
  },

  /*
   * Function to remove a user from a favorite list
   */
  removeFromFavorite: function(req, res) {
    User.findById(req.currentUserId, function(err, user) {
        // If an error occured
        if (err) {
          return res.json({
            status: 0,
            error: {
              type: 'system',
              message: 'System Error'
            }
          });
        }

        // Check if the user id param is in this user favorite list or not
        if (user.favoriteUsers.indexOf(req.params.id) === -1) {
          // Return the message error if not
          return res.json({
            status: 0,
            error: {
              type: 'user',
              message: 'The use is not in favorite list'
            }
          });
        }

        // If the user id is in the favorite list remove
        user.favoriteUsers.remove(req.params.id);

        // Save the user
        user.save(function(err) {
          // If an error occured
          if (err) {
            return res.json({
              status: 0,
              error: {
                type: 'system',
                message: 'System Error'
              }
            });
          }

          // Return the successful message
          return res.json({
            status: 1,
            message: 'Successfully remove the user from favorite list'
          });
        });
    });
  },

  /*
   * Get the user favoriteUsers list 
   */
  getFavoriteList: function(req, res) {
    // Get the current user by Id and alse populate the favoriteList
    User.findById(req.currentUserId).populate('favoriteUsers', '-hash -accessToken -createdAt -updatedAt').exec(function(err, user) {
      // If an error occured
      if (err) {
        return res.json({
          status: 0,
          error: {
            type: 'system',
            message: 'System Error'
          }
        });
      }

      // Return the list of favoriteUsers
      return res.json({
        status: 1,
        users: user.favoriteUsers,
        message: 'Successfully get the list of favorite users'
      });
    });
  },

  /*
   * Function after a user see another user profile
   */
  profileViewed: function(req, res) {
    // Find the user with the given id in the param
    User.findById(req.params.id, function(err, userToAdd) {
      // If an error occured
      if (err) {
        return res.json({
          status: 0,
          error: {
            type: 'system',
            message: 'System Error'
          }
        });
      }

      // If no user was return
      if (!userToAdd) {
        return res.json({
          status: 0,
          error: {
            type: 'user',
            message: 'There is no user with that id',
          }
        });
      }

      // add the current user to the list viewedBy of the other user
      userToAdd.update({ $addToSet: { 'viewedBy': req.currentUserId } }, function(err) {
        // If error
        if (err) {
          console.log(err);
          return res.json({
            status: 0,
            error: {
              type: 'system',
              message: 'System Error'
            }
          });
        }

        // Update the current user's list of viewedusers
        User.update({ '_id': req.currentUserId }, { $addToSet: { 'viewedUsers': userToAdd.id } }, function(err) {
          // If error
          if (err) {
            return res.json({
              status: 0,
              error: {
                type: 'system',
                message: 'System Error'
              }
            });
          }

          return res.json({
            status: 1,
            message: 'Succesfully update the list of viewed users and view by users'
          });
        });
      });

    });
  },

  /*
   * Function to return the list viewed users 
   */
  recentlyViewedUsers: function(req, res) {
    // Get the current user by Id and alse populate the viewed Users list
    User.findById(req.currentUserId).populate('viewedUsers', '-hash -accessToken -createdAt -updatedAt').exec(function(err, user) {
      // If an error occured
      if (err) {
        console.log(err);
        return res.json({
          status: 0,
          error: {
            type: 'system',
            message: 'System Error'
          }
        });
      }

      // Return the list of viewed users list
      return res.json({
        status: 1,
        users: user.viewedUsers.reverse(),
        message: 'Successfully get the list of recently viewed users'
      });
    });
  },

  /*
   * Function to return the list of recently users that view current user profile
   */
  recentlyViewedBy: function(req, res) {
    // Get the current user by Id and alse populate the list
    User.findById(req.currentUserId).populate('viewedBy', '-hash -accessToken -createdAt -updatedAt').exec(function(err, user) {
      // If an error occured
      if (err) {
        return res.json({
          status: 0,
          error:{
            type: 'system',
            message: 'System Error'
          }
        });
      }

      // Return the list of users
      return res.json({
        status: 1,
        users: user.viewedBy.reverse(),
        message: 'Successfully get the list of users that recently view your profile'
      });
    });
  },

  /*
   * Function to clear list of recently viewed users
   */
  clearRecentlyViewedUsers: function(req, res) {
    // update the current user (change the array of viewedUsers to [])
    User.findByIdAndUpdate(req.currentUserId, { $set: { 'viewedUsers': [] } }, { select: '-hash -accessToken -createdAt -updatedAt' }, function(err, user) {
      // If an error occured
      if (err) {
        return res.json({
          status: 0,
          error: {
            type: 'system',
            message: 'System Error'
          }
        });
      }

      // Return
      return res.json({
        status: 1,
        user: user,
        messsage: 'Successfully clear the list'
      });
    });
  },

  /*
   * Function to clear list of users that recently viewed your profile
   */
  clearRecentlyViewedBy: function(req, res) {
    // update the current user (change the array of viewedBy to [])
    User.findByIdAndUpdate(req.currentUserId, { $set: { 'viewedBy': [] } }, { select: '-hash -accessToken -createdAt -updatedAt' }, function(err, user) {
      // If an error occured
      if (err) {
        return res.json({
          status: 0,
          error: {
            type: 'system',
            message: 'System Error'
          }
        });
      }

      // Return
      return res.json({
        status: 1,
        user: user,
        messsage: 'Successfully clear the list'
      });
    });
  },

  /*
   * Function to validate a new user
   */
  validateUser: function(req, res, next) {
    // Validate 
    req.check('username', 'Invalid Username').notEmpty().is(/^[a-zA-Z0-9_]+$/);
    req.check('username', 'Username must have 6 to 20 characters').len(6, 20);
    req.check('email', 'Invalid Email').notEmpty().isEmail();
    req.check('password', 'Password must not be empty').notEmpty();
    req.check('password', 'Password must have 6 to 20 characters').len(6, 20);
    req.check('passwordConfirm', 'Password and password confirmation must match').notEmpty().equals(req.body.password);

    // Create the mapped errors array
    var errors = req.validationErrors(true);

    if (errors === null) {
      errors = {};
    }
    // check if the username is exist or not
    if (!errors.username) {
      User.findOne({ 'username': req.body.username }, function(err, user) {
        // If system error
        if (err) {
          return res.json({
            status: 0,
            error: {
              type: 'system',
              message: 'System Error'
            }
          });
        }

        // If a user with that username exist
        if (user) {
          errors.username = {
            msg: 'A user with this username already exist',
            param: 'username',
            value: req.body.username
          };
        }
         
        // Check if there is error with email and check for if email exits
        if (!errors.email) {
          User.findOne({ 'email': req.body.email }, function(err, user) {
            // If system error
            if (err) {
              return res.json({
                status: 0,
                error: {
                  type: 'system',
                  message: 'System Error'
                }
              });
            }

            // If a user with that email exist
            if (user) {
              errors.email = {
                msg: 'A user with this email already exist',
                param: 'email',
                value: req.body.email
              };
            }

            // Return the results
            if (!_.isEmpty(errors)) {
              // Get the errors object and transform it to an array
              var msgArray =  _.map(errors, function(error) {
                return error.msg;
              });

              return res.json({
                status: 0,
                error: {
                  type: 'register',
                  message: msgArray[msgArray.length - 1]
                }
              });
            } 
            
            // Process to next function
            next();
            
          });

        } else {
          // Return the results
          if (!_.isEmpty(errors)) {
            // Get the errors object and transform it to an array
            var msgArray =  _.map(errors, function(error) {
              return error.msg;
            });

            return res.json({
              status: 0,
              error: {
                type: 'register',
                message: msgArray[msgArray.length - 1]
              },
            });
          } 

          // Process to next function
          next();
        }

      });
    } else if (!errors.email) {
      // Check if the email is taken or not
      User.findOne({ 'email': req.body.email }, function(err, user) {
        // If system error
        if (err) {
          return res.json({
            status: 0,
            error: {
              type: 'system',
              message: 'System Error'
            }
          });
        }

        // If a user with that email exist
        if (user) {
          errors.email = {
            msg: 'A user with this email already exist',
            param: 'email',
            value: req.body.email
          };
        }

        // Return the results
        if (!_.isEmpty(errors)) {
          // Get the errors object and transform it to an array
          var msgArray =  _.map(errors, function(error) {
            return error.msg;
          });

          return res.json({
            status: 0,
            error: {
              type: 'register',
              message: msgArray[msgArray.length - 1]
            }
          });
        } 
          
        // Process to next function
        next();
        
      });
    } else {
      if (!_.isEmpty(errors)) {
        // Get the errors object and transform it to an array
        var msgArray =  _.map(errors, function(error) {
          return error.msg;
        });

        return res.json({
          status: 0,
          error: {
            type: 'register',
            message: msgArray[msgArray.length - 1]
          }
        });
      } 

      // Process to next function
      next();

    }
  },
  
  /*
   * Function to check for login param
   */
  checkLoginParams: function(req, res, next) {
    // Check if there is username and password param in the request
    if (_.isUndefined(req.body.username) || _.isUndefined(req.body.password)) {
      return res.json({
        status: 0,
        error: {
          type: 'authentication',
          message: 'The request must have username and password params'
        }
      });
    } 

    // Process to next function
    next();
    
  },

  /*
   * Function to check for update params
   */
  checkUpdateParams: function(req, res, next) {
    // Check if there is email param
    if (!_.isUndefined(req.body.email)) {
      req.check('email', 'Invalid Email').isEmail();
    }

    // Check if there is gender param
    if (!_.isUndefined(req.body.gender)) {
      req.check('gender', 'Invalid gender').isIn(['male', 'female']);
    }

    // Create the mapped errors array
    var errors = req.validationErrors(true);

    // Get the errors object and transform it to an array
    var msgArray =  _.map(errors, function(error) {
      return error.msg;
    });

    // If there is errors
    if (!_.isNull(errors)) {
      return res.json({
        status: 0,
        error: {
          type: 'update',
          message: msgArray[msgArray.length - 1]
        }
      });
    }

    // Process the next function
    next();
  },

  /*
   * Function to check for long lat when update location
   */
  checkForLngLat: function(req, res, next) {
    // Check if there is long, lat in the request
    req.check('longitude', 'Invalid Longitude').notEmpty().isFloat().min(-180).max(180);
    req.check('latitude', 'Invalid Latitude').notEmpty().isFloat().min(-90).max(90);
    
    // Create the mapped errors array
    var errors = req.validationErrors(true);

    // Get the errors object and transform it to an array
    var msgArray =  _.map(errors, function(error) {
      return error.msg;
    });

    if (errors) {
      return res.json({
        status: 0,
        error: {
          type: 'location',
          message: msgArray[msgArray.length - 1]
        }
      });
    }

    // Process to the next function
    next();
  },

  /*
   * Function to check for the format of radius if provide
   */
  checkRadius: function(req, res, next) {
    // Check if there is a a radius param
    if (!_.isUndefined(req.query.radius)) {
      req.check('radius', 'Invalid radius').isFloat().min(0).max(6378);

      // Create the mapped errors array
      var errors = req.validationErrors(true);
      
      // Get the errors object and transform it to an array
      var msgArray =  _.map(errors, function(error) {
        return error.msg;
      });

      if (errors) {
        return res.json({
          status: 0,
          error: {
            type: 'location',
            message: msgArray[msgArray.length - 1]
          }
        });
      }
    }

    // Process to the next function
    next();
  }
};
