var fs = require('fs')
  , crypto = require('crypto');
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
  // Create the newName by hashing the file path
  newName = crypto.createHash('md5').update(tmpPath).digest('hex') + extension;

  newPath = './public/images/' + newName;

  // Move the image
  fs.rename(tmpPath, newPath, function(err) {
    callback(err, newName);
  });
};
