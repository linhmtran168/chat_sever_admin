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
   * ============== Route for category
   */
  // Main category route
  app.get('/gift/categories', [helpers.ensureAuthenticated, helpers.csrf], catCtrl.index);
  // Route to add new category
  app.post('/category/add', helpers.ensureAuthenticated, catCtrl.add);
  // Route to check category name
  app.get('/category/check-name', helpers.ensureAuthenticated, catCtrl.checkName);
  // Route to delete category
  app.get('/category/delete/:id', helpers.ensureAuthenticated, catCtrl.delete);
  // Route to render update view for a category
  app.get('/category/update-view/:id', helpers.ensureAuthenticated, catCtrl.updateView);
  // Route to update a category
  app.post('/category/update', helpers.ensureAuthenticated, catCtrl.update);

  /*
   * ============== Route for gift
   */
  // Main gift route
  app.get('/gift', [helpers.ensureAuthenticated, helpers.csrf], giftCtrl.index);
  // Route to render the new gift view
  app.get('/gift/add', [helpers.ensureAuthenticated, helpers.csrf], giftCtrl.add);
  // Route to create a new gift
  app.post('/gift/add', helpers.ensureAuthenticated, giftCtrl.add);
  // Route to render the edit gift page
  app.get('/gift/edit/:id', [helpers.ensureAuthenticated, helpers.csrf], giftCtrl.update);
  // Route to update a gift
  app.post('/gift/edit/:id', helpers.ensureAuthenticated, giftCtrl.update);
  // Route to delete a gift
  app.get('/gift/delete/:id', helpers.ensureAuthenticated, giftCtrl.delete);
  // Route to show latest orders
  app.get('/gift/orders', [helpers.ensureAuthenticated, helpers.csrf], giftCtrl.orders);
  // Route to update order status
  app.post('/gift/order/:id', helpers.ensureAuthenticated, giftCtrl.updateOrder);
  // Route to show a gift detail
  app.get('/gift/:id', helpers.ensureAuthenticated, giftCtrl.detail);

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
  // Route to edit info
  app.get('/admin/account', [helpers.ensureAuthenticated, helpers.csrf], adminCtrl.update);
  // Route to edit password
  app.post('/admin/update-password', [helpers.ensureAuthenticated, adminCtrl.checkUpdatePassword], adminCtrl.update);
  // Route for send message
  app.get('/operations', [helpers.ensureAuthenticated, helpers.csrf], adminCtrl.message);
  app.post('/admin/send-message', [helpers.ensureAuthenticated], adminCtrl.message);

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
