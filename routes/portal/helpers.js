var fs = require('fs')
  , crypto = require('crypto')
  , im = require('imagemagick')
  , _ = require('lodash');
/*
 * Helpers for portal route
 */

// Middleware to ensure an user is authenticated
exports.ensureAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) {
  return next();
  }

  res.redirect('/login');
};

// Middleware to ensure an user is not authenticated
exports.ensureNotAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/user');
  }

  next();
};

// Middleware to create a csrf token to use with the request
exports.csrf = function(req, res, next) {
  // Set the local token variable
  res.locals.token = req.session._csrf;
  // console.log(req.session._csrf);
  
  next();
};

// Middleware to handle file upload
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
      message: 'Please upload an image'
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

// Middleware to delete a profilePhoto
exports.deletePhoto = function(profilePhoto) {
  var defaultPhotos = ['male_avatar.png', 'female_avatar.png', 'default_avatar.png', 'noimage.gif'];
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
