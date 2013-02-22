var mongoose = require('mongoose')
  , redis = require('redis')
  , _ = require('lodash')
  , User = require('../models/user');

process.on('message', function(data) {
  console.log('Child process - message received: ' + data.message + '|' + data.receiver);

  // Connect to mongodb database
  if (process.env.NODE_ENV === 'production') {
    mongoose.connect('mongodb://localhost:27017/ogorin', { user: 'ogorinPro', pass: 'ProOgorinMongo' });
  } else {
    mongoose.connect('mongodb://localhost:27017/ogorin', { user: 'ogorin', pass: 'dragonLinh123' });
  }

  // Get the admin user from the user collection
  User.findOne({ type: 'admin' }, function(err, admin) {
    if (err) {
      console.error(err);
      process.send('Error getting admin user');
      process.exit();
    }

    if (!admin) {
      process.send('There is no admin user');
      process.exit();
    }

    //console.log(admin);

    // -- If there is admin user
    // Find all the users according to type of receiver
    var condition, receiverType = parseInt(data.receiver, 10);
    if (receiverType === 1) {
      condition = { type: { $ne: 'admin' } };
    } else if (receiverType === 2) {
      condition = { gender: 'male', type: { $ne: 'admin' } };
    } else {
      condition = { gender: 'female', type: { $ne: 'admin' } };
    }

    // Get all the users with right condition
    User.find(condition, function(err, users) {
      if (err) {
        console.error(err);
        process.send('Error getting admin user');
        process.exit();
      }

      if (!users || users.length === 0) {
        process.send('There is no users to send message');
        process.exit();
      }

      // Start sending all messages through redis
      var redisClient = redis.createClient()
        , multi = redisClient.multi()
        , currentTimestamp = Math.round(+new Date()/1000);
      var messageObj = {
        message: data.message,
        deviceTimestamp: currentTimestamp,
        timestamp: currentTimestamp,
        senderId: admin.id
      };
      var messageJSON = JSON.stringify(messageObj);

      // Add commands to redis for each user to node redis queue
      _.each(users, function(user) {
        // Create keys in Redis for this user
        multi.sadd('chat:' + user.id + ':keys', 'chat:' + user.id + ':' + admin.id + ':messages', 'chat:' + user.id + ':' + admin.id + ':lastMessage', 'chat:' + user.id +  ':conversations', redis.print);

        // Add/ update the conversations of user
        multi.zadd('chat:' + user.id + ':conversations', currentTimestamp, admin.id, redis.print);
        // Set the last message
        multi.set('chat:' + user.id + ':' + admin.id + ':lastMessage', messageJSON, redis.print);
        // Save the messge obj to the list of messages for user
        multi.rpush('chat:' + user.id + ':' + admin.id + ':messages', messageJSON, redis.print);
      });

      // Process all the commmand
      multi.exec(function(err, replies) {
        if (err) {
          console.error(err);
          process.send('Error sending message');
          process.exit();
        }

        process.send('Success fully sent the messages - Total commands: ' + replies.length);
        redisClient.quit();
        process.exit();
      });
    });

  });
});

process.on('exit', function() {
  process.send('Message sending operation completed');
});
