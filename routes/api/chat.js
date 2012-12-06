/**
 * Module for chat related api
 */
var redis = require('redis')
  , redisClient = redis.createClient()
  , _ = require('lodash')
  , User = require('../../models/user');

module.exports = {
  /**
   * Function to get current user's list of conversation
   */
  getConversations: function(req, res) {
    redisClient.sort('chat:' + req.currentUserId + ':conversations', 'BY', 'nosort', 'GET', '#', 'GET', 'chat:' + req.currentUserId + ':*' + ':lastMessage', function (err, replies) {
      if (err) {
        return res.json({
          status: 0,
          error: {
            type: 'system',
            message: 'System Error',
          }
        });
      }

      // Log
      console.log(replies);

      // If there is no conversations, return an empty array
      if (replies.length === 0) {
        return res.json({
          status: 1,
          conversations: replies,
          message: 'Successfully got the list of conversations for this user'
        });
      }

      var i, partnerIds = [], conversations = [];
      // Create the array of conversations from the replies
      for (i = 0; i < replies.length; i = i + 2) {
        // Create the conversation object
        var converObj = {
          partnerId: replies[i],
          lastMessage: JSON.parse(replies[i + 1])
        };

        // Add the user id to the list of user id
        partnerIds.push(replies[i]);

        // Add to the conversations array
        conversations.push(converObj);
      }

      // Log 
      console.log(conversations);
      console.log(partnerIds);

      // Get the array of user from the mongo database that have userId in the list of userid conversations
      User.find({ '_id': { $in: partnerIds } }, 'status profilePhoto username screenName', function(err, users) {
        // If err
        if (err) {
          return res.json({
            status: 0,
            error: {
              type: 'system',
              message: 'System Error',
            }
          });
        }

        // Log
        console.log(users);
        // Iterate through the list of user and create the final results
        _.forEach(users, function(user) {
          // Get the index of current user in the list from redis
          var userIndex = _.indexOf(partnerIds, user.id);

          // Set the status and profile photo for the object in the conversations list
          if (userIndex !== -1) {
            conversations[userIndex].partnerStatus = user.status;
            conversations[userIndex].partnerProfilePhoto = user.profilePhoto;
            conversations[userIndex].partnerUsername = user.username;
            conversations[userIndex].partnerScreenName = user.screenName;
          }
        });

        // Iterate through all the conversation list and mark the the conversation with no status as delete
        _.forEach(conversations, function(conversation) {
          if (!_.has(conversation, 'partnerStatus')) {
            // Mark the status as deleted and profilePhoto as default
            conversation.partnerStatus = 'deleted';
            conversation.partnerProfilePhoto = 'default_avatar.png';
            conversation.partnerUsername = 'Unknown';
            conversation.partnerScreenName = 'Unknown';
          }
        });

        // Return the list of conversations
        return res.json({
          status: 1,
          conversations: conversations.reverse(),
          message: 'Successfully got the list of conversations for this user'
        });
      });
    });
  },

  /**
   * Function to delete a conversation
   */
  deleteConversation: function(req, res) {
    // Delete the keys corressponding to this conversation in redis
    redisClient.zrem('chat:' + req.currentUserId + ':conversations', req.params.partnerId, function(err, response) {
      // If error happen
      if (err) {
        return res.json({
          status: 0,
          error: {
            type: 'system',
            message: 'System Error',
          }
        });
      }

      console.log(response);
      // Delete the last message instance
      redisClient.del('chat:' + req.currentUserId + ':' + req.params.partnerId + ':lastMessage', redis.print);

      // Delete the list of chat that in that conversation
      redisClient.del('chat:' + req.currentUserId + ':' + req.params.partnerId + ':messages', redis.print);

      return res.json({
        status: 1,
        message: 'Sucessfully deleted the conversation'
      });
    });
  },

  /**
   * Function get a user chat history with another user
   */
  getChatHistory: function(req, res) {
    // Get the list of chat message from the redis database
    var numMessage = 20;
    if (!_.isUndefined(req.query.numMessage)) {
      numMessage = parseInt(req.query.numMessage, 10);
    }

    // Create the num message query 
    numMessage = -numMessage;
    // Query the messages from the database
    redisClient.lrange('chat:' + req.currentUserId + ':' + req.params.partnerId + ':messages', numMessage, -1, function(err, replies) {
      // If err
      if (err) {
        return res.json({
          status: 0,
          error: {
            type: 'system',
            message: 'System Error',
          }
        });
      }

      // There is no message in this conversation return the empty set
      if (replies.length === 0) {
        return res.json({
          status: 1,
          chats: replies,
          message: 'Successfully got the chat messages'
        });
      }

      // If there is message in the replies
      var chats = _.map(replies, function(chat) {
        return JSON.parse(chat);
      });

      // Return the chat messages
      return res.json({
        status: 1,
        chats: chats,
        message: 'Successfully got the chat messages'
      });
    });
  },

  /**
   * Function to check the param for number of message to get
   */
  checkNumMessage: function(req, res, next) {
    // Check if there is a a numMessage param
    if (!_.isUndefined(req.query.numMessage)) {
      req.check('numMessage', 'Invalid number of messages to get').isInt().min(1);

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
            type: 'num-message',
            message: msgArray[msgArray.length - 1]
          }
        });
      }
    }

    // Process to the next function
    next();
  }
};
