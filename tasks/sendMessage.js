var mongoose = require('mongoose')
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

    console.log(admin);

    // Find all the users according to type of receiver
    var condition, receiverType = parseInt(data.receiver, 10);
    if (receiverType === 1) {
      condition = { type: { $ne: 'admin' } };
    } else if (receiverType === 2) {
      condition = { gender: 'male', type: { $ne: 'admin' } };
    } else {
      condition = { gender: 'female', type: { $ne: 'admin' } };
    }

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

      console.log(users);
      process.exit();
    });
  });
});

process.on('exit', function() {
  process.send('Message sending operation completed');
});
