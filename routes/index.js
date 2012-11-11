
/*
 * Main entry for setting all the app route
 */

module.exports = function(app) {
  require('./portal')(app);
  require('./api')(app);
};
