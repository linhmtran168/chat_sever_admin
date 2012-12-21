/*
 * Import route for api part of the web service
 */
var helpers = require('./helpers')
  , chatCtrl = require('./chat')
  , giftCtrl = require('./gift')
  , userCtrl = require('./user');

module.exports = function(app) {

  /*
   * ========== Route for chat
   */
  // Route for getting a user's conversations
  app.get('/api/chat/conversations', helpers.checkForAccessToken, chatCtrl.getConversations);

  // Route for getting a user chat history
  app.get('/api/chat/history/:partnerId', [helpers.checkForAccessToken, chatCtrl.checkNumMessage], chatCtrl.getChatHistory);

  // Route for deleting a user's conversation
  app.delete('/api/chat/conversation/:partnerId', helpers.checkForAcessToken, chatCtrl.deleteConversation);

  /*
   * ========== Route for gift
   */
  // Route to purchase a gift
  app.post('/api/gift/purchase/:id', helpers.checkForAccessToken, giftCtrl.order);
  // Route to get an order's detail
  app.get('/api/order/:id', helpers.checkForAccessToken, giftCtrl.orderDetail);
  // Route to list a user orders
  app.get('/api/user/orders', helpers.checkForAccessToken, giftCtrl.listOrders);
  // Route to list categories
  app.get('/api/gift/catgories', helpers.checkForAccessToken, giftCtrl.listCategories);
  // Route to get gift list
  app.get('/api/gifts', helpers.checkForAccessToken, giftCtrl.list);
  // Route to get a gift detail
  app.get('/api/gift/:id', helpers.checkForAccessToken, giftCtrl.detail);

  /*
   * ========== Route for user
   */
  // Route for registering a user
  app.post('/api/user/register', [helpers.checkForApiKey, userCtrl.validateUser], userCtrl.register);
  // Route for logging in a user
  app.post('/api/user/login', [helpers.checkForApiKey, userCtrl.checkLoginParams], userCtrl.login);
  // Route for a user to logout
  app.get('/api/user/logout', helpers.checkForAccessToken, userCtrl.logout);

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

  // Route to add a user to the user's recent viewed profile
  app.get('/api/user/viewed/:id', helpers.checkForAccessToken, userCtrl.profileViewed);
  // Route to get a user list of recently viewed profile
  app.get('/api/user/recently-viewed', helpers.checkForAccessToken, userCtrl.recentlyViewedUsers);
  // Route to get a user list of users that recently viewed your profile
  app.get('/api/user/recently-viewed-by', helpers.checkForAccessToken, userCtrl.recentlyViewedBy);
  // Route for user to clear the list of recent viewed profile
  app.delete('/api/user/clear/recently-viewed', helpers.checkForAccessToken, userCtrl.clearRecentlyViewedUsers);
  // Route for usr to clear the list of recent users that viewed user's profile
  app.delete('/api/user/clear/recently-viewed-by', helpers.checkForAccessToken, userCtrl.clearRecentlyViewedBy);

  // Route for a user update their success purchase
  app.post('/api/user/purchase', helpers.checkForAccessToken, userCtrl.purchaseTime);

  // Route for a user to edit their profile
  app.put('/api/user/update', [helpers.checkForAccessToken, userCtrl.checkUpdateParams], userCtrl.updateProfile);
  // Route for getting a user info
  app.get('/api/user/:id', helpers.checkForAccessToken, userCtrl.getUserInfo);
};
