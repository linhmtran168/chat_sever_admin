/**
 * Module for chat related api
 */
var redis = require('redis')
  , redisClient = redis.createClient();

module.exports = {
  /**
   * Function to get current user's list of conversation
   */
  getConversations: function(req, res) {
  },

  /**
   * Function get a user chat history with another user
   */
  getChatHistory: function(req, res) {

  },
};
