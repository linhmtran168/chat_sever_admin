/*
 * Helpers middleware for api part
 */
var apiConfig = require('../../config/api'),
    User = require('../../models/user'),
    crypto = require('crypto'),
    fs = require('fs'),
    im = require('imagemagick'),
    _ = require('lodash');

/*
 * Function to check for an api key in the request
 */
exports.checkForApiKey = function(req, res, next) {
  // check for the existence of the apiKey param
  if (req.body.apiKey !== apiConfig.apiKey) {
    return res.json({
      status: 0,
      error: {
        type: 'access',
        message: 'You must provide a correct apiKey'
      } 
    });
  } 
  console.log(req.body.apiKey);
  // Process to next function
  next();
};

/*
 * Function to check for the accessToken in an api key
 */
exports.checkForAccessToken = function(req, res, next) {
  // Check for the existence of the accessToken
  if (!req.param('accessToken')) {
    return res.json({
      status: 0,
      error: {
        type: 'access',
        message: 'You must provide an accessToken'
      }
    });
  } 

  // If there is an accessToken check if there is a user with this accessToken
  var accessToken = req.param('accessToken');
  User.findOne({ 'accessToken': accessToken }, function (err, user) {
    // console.log(user);
    // If an error occurs
    // console.log(err);
    if (err) {
      return res.json({
        status: 0,
        error: {
          type: 'system',
          message: 'System error'
        }
      });
    }

    // If no user with this accessToken
    if (!user) {
      return res.json({
        status: 0,
        error: {
          type: 'api',
          message: 'You must provide a correct accessToken'
        }
      });
    } 

    // If the is a user exist
    req.currentUserId = user.id;
    console.log(user);
    next();
  });
};

/*
 * Function to help upload file
 */
exports.uploadFile = function(file, callback) {
  var tmpPath = file.path
    , oldName = file.name
    , extension, newName, newPath;

  // get the extension of the file
  extension = oldName.substr(oldName.lastIndexOf('.'));

  // Check file type
  var allowed_extensions = ['.gif', '.GIF', '.png', '.jpeg', '.jpg', '.JPG', '.JPEG'];
  if (!_.contains(allowed_extensions, extension)) {
    var err = {
      type: 'extension',
    };

    return callback(err, false);
  }

  // Create the newName by hashing the file path
  newName = crypto.createHash('md5').update(tmpPath).digest('hex') + extension;

  // Create the path for upload image
  if (process.env.NODE_ENV === 'production') {
    newPath = '/home/linhtm/sites/ogorinImage/' + newName;
  } else {
    newPath = './public/images/' + newName;
  }

  // resize and move the image
  im.resize({
    srcPath: tmpPath,
    dstPath: newPath,
    width: 300
  }, function(err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    console.log(err);
    callback(err, newName);
  });
};

// Middle ware to delete the profile photo
exports.deletePhoto = function(profilePhoto) {
  var defaultPhotos = ['male_avatar.png', 'female_avatar.png', 'default_avatar.png'];
  // If profile photo of this user is a default one do nothing
  if (_.indexOf(defaultPhotos, profilePhoto) !== -1) {
    return;
  }

  var photoPath;
  // Create the photo path according to environment
  if (process.env.NODE_ENV === 'production') {
    photoPath = '/home/linhtm/sites/ogorinImage/';
  } else {
    photoPath = './public/images/';
  }
  // Delete the photo
  fs.unlink(photoPath + profilePhoto, function(err) {
    if (err) {
      console.log(err);
      return;
    }

    console.log('Successfully delete the profile Photo');
  });
};
