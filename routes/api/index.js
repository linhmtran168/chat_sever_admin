/*
 * Import route for api part of the web service
 */
var helpers = require('./helpers')
  , chatCtrl = require('./chat')
  , userCtrl = require('./user');

module.exports = function(app) {

  /*
   * ========== Route for chat
   */
  // Route for getting a user's conversations
  app.get('/api/chat/conversations', helpers.checkForAccessToken, chatCtrl.getConversations);

  // Route for getting a user chat history
  app.get('/api/chat/:id1/:id2', helpers.checkForAccessToken, chatCtrl.getChatHistory);

  /*
   * ========== Route for user
   */
  // Route for registering a user
  app.post('/api/user/register', [helpers.checkForApiKey, userCtrl.validateUser], userCtrl.register);
  // Route for logging in a user
  app.post('/api/user/login', [helpers.checkForApiKey, userCtrl.checkLoginParams], userCtrl.login);
  // Route for a user to logout
  app.get('/api/user/logout', helpers.checkForAccessToken, userCtrl.logout);
  // Route for a user to edit their profile
  app.put('/api/user/update', [helpers.checkForAccessToken, userCtrl.checkUpdateParams], userCtrl.updateProfile);
  // Route for a user to update their location
  app.put('/api/user/update-location', [helpers.checkForAccessToken, userCtrl.checkForLngLat], userCtrl.updateLocation);
  // Route for user to get near by users
  app.get('/api/user/get-nearby', [helpers.checkForAccessToken, userCtrl.checkRadius], userCtrl.getNearbyUsers);
  // Route to add a user to favorite list
  app.get('/api/user/add-favorite/:id', helpers.checkForAccessToken, userCtrl.addToFavorite);
  // Route to remove a user from favorite list
  app.get('/api/user/remove-favorite/:id', helpers.checkForAccessToken, userCtrl.removeFromFavorite);
  // Route to get the user's list of favoriteUsers
  app.get('/api/user/get-favorite', helpers.checkForAccessToken, userCtrl.getFavoriteList);

  // Route for getting a user info
  app.get('/api/user/:id', helpers.checkForAccessToken, userCtrl.getUserInfo);
};
