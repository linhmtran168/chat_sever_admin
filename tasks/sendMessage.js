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
    process.exit();
  });
});

process.on('exit', function() {
  process.send('Message sending operation completed');
});
