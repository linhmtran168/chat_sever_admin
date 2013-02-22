var User = require('../models/user');

process.on('message', function(message) {
  console.log('Child process - message received: ' + data.message + '|' + data.receiver);
  process.exit();
});

process.on('exit', function() {
  process.send('Finished sending message');
});
