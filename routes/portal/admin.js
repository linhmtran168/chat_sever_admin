/*
 * Admin route
 */
module.exports = {
  /*
   * Function to show login page
   */
  login: function(req, res) {
    var message = req.flash('error');
    res.render('admin/login', {
      title: 'Login',
      message: message,
    });
  },

  /* 
   * Function to logout
   */
  logout: function(req, res) {
    req.logout();
    res.redirect('/');
  },
};
