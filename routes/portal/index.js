/*
 * Import route for portal part of the service
 */
var passport = require('passport')
  , helpers = require('./helpers');

module.exports = function(app) {
  // Load controllers
  var userCtrl = require('./user')
    , testCtrl = require('./test')
    , giftCtrl = require('./gift')
    , catCtrl = require('./category')
    , parttimerCtrl = require('./parttimer')
    , adminCtrl = require('./admin');

  /*
   * ============= Route for user
   */
  // Route for home page
  app.get('/', helpers.ensureAuthenticated, userCtrl.index);
  app.get('/user', helpers.ensureAuthenticated, userCtrl.index);

  // Route for searching user
  app.get('/user/search-username', helpers.ensureAuthenticated, userCtrl.searchUsername);
  app.get('/user/search-username-api', helpers.ensureAuthenticated, userCtrl.searchUsernameAPI);

  // Route fore searching for user by lcation
  app.get('/user/search-location-api', helpers.ensureAuthenticated, userCtrl.searchLocationAPI);

  // Route for showing a user profile
  app.get('/user/:id', helpers.ensureAuthenticated, userCtrl.showProfile);

  // Route for banning a user
  app.get('/user/ban/:id', helpers.ensureAuthenticated, userCtrl.banUser);
  
  // Route for reenabling a user
  app.get('/user/enable/:id', helpers.ensureAuthenticated, userCtrl.enableUser);

  // Route for deleting a user
  app.get('/user/delete/:id', helpers.ensureAuthenticated, userCtrl.deleteUser);

  /*
   * ============== Route for parttimer
   */
  // Route to render the main page
  app.get('/parttimer', [helpers.ensureAuthenticated, helpers.csrf], parttimerCtrl.indexParttimer);

  // Route to search for a parttimer
  app.get('/parttimer/search-parttimer', helpers.ensureAuthenticated, parttimerCtrl.searchParttimer);

  // Route for check for email & username
  app.get('/parttimer/check-username', helpers.ensureAuthenticated, parttimerCtrl.checkUsername);
  app.get('/parttimer/check-email', helpers.ensureAuthenticated, parttimerCtrl.checkEmail);

  // Route for create a new parttimer
  app.post('/parttimer/create-parttimer', [helpers.ensureAuthenticated, parttimerCtrl.validateParttimer, helpers.csrf], parttimerCtrl.createParttimer);

  // Route for showing a parttimer profile
  app.get('/parttimer/:id', [helpers.ensureAuthenticated, helpers.csrf], parttimerCtrl.showProfile);

  // Route for banning a user
  app.get('/parttimer/ban/:id', helpers.ensureAuthenticated, parttimerCtrl.banUser);
  
  // Route for reenabling a user
  app.get('/parttimer/enable/:id', helpers.ensureAuthenticated, parttimerCtrl.enableUser);

  // Route for deleting a user
  app.get('/parttimer/delete/:id', helpers.ensureAuthenticated, parttimerCtrl.deleteUser);

  // Route for changing password for a user
  app.post('/parttimer/:id/change-password', [helpers.ensureAuthenticated, parttimerCtrl.validatePassword, helpers.csrf], parttimerCtrl.changePassword);

  /*
   * ============== Route for gift
   */
  // Main gift route
  app.get('/gift', [helpers.ensureAuthenticated, helpers.csrf], giftCtrl.index);

  /*
   * ============== Route for category
   */
  // Main category route
  app.get('/gift/categories', [helpers.ensureAuthenticated, helpers.csrf], catCtrl.index);
  // Route to add new category
  app.post('/category/add', helpers.ensureAuthenticated, catCtrl.add);
  // Route to check category name
  app.get('/category/check-name', helpers.ensureAuthenticated, catCtrl.checkName);

  /*
   * ============== Route for admin
   */
  // Route for login
  app.get('/login', [helpers.ensureNotAuthenticated, helpers.csrf], adminCtrl.login);
  app.post('/login', [helpers.ensureNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true,
  })]);

  // Route for logout
  app.get('/logout', helpers.ensureAuthenticated, adminCtrl.logout);

  /*
   * =============== Route for test
   */
  // Route for creating admin user
  app.get('/test/create-admin', helpers.csrf, testCtrl.createAdmin);
  app.post('/test/create-admin', [helpers.csrf, testCtrl.validateAdmin], testCtrl.createAdmin);

  // Route for creating dummy user
  app.get('/test/create-user', helpers.csrf, testCtrl.createUser);
  app.post('/test/create-user', [helpers.csrf, testCtrl.validateUser],testCtrl.createUser);
};
