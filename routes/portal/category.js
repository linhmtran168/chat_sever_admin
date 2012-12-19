var Category = require('../../models/category')
  , User = require('../../models/user')
  , helpers = require('./helpers')
  , util = require('util')
  , _ = require('lodash');

/*
 * Portarl route for category
 */
module.exports = {
  /*
   * Function to list all category
   */
  index: function(req, res) {
    // Find all the categories in the database 
    Category.find({}, function(err, categories) {
      // if err, redirect
      if (err) {
        return res.redirect('/gift');
      }

      // console.log(categories);
      // Get the error message
      var message = req.flash('message');

      return res.render('category/index', {
        slug: 'gift',
        title: 'Category Management',
        categories: categories,
        message: message
      });
    });
  },

  /*
   * Function to create a new category
   */
  add: function(req, res) {
    // Check for category name
    if (_.isUndefined(req.body.name)) {
      req.flash('message', 'Category name is missing');
      return res.redirect('/gift/categories');
    }

    // Create new category
    var category = new Category({
      name: req.body.name
    });

    if (!_.isUndefined(req.body.description)) {
      category.description = req.body.description;
    }

    // Attempt to save the category
    category.save(function(err) {
      if (err) {
        req.flash('message', 'There is error saving the category');
        return res.redirect('/gift/categories');
      }

      // Re-render index page
      req.flash('message', 'Successfully saving the category');
      return res.redirect('/gift/categories');
    });
  },

  /*
   * Function to update a category
   */
  update: function(req, res) {

  },

  /*
   * Function to delete a category
   */
  delete: function(req, res) {

  },

  /*
   * Function to check a category name
   */
  checkName: function(req, res) {
    Category.findOne({ name: req.param('value') }, function(err, user) {
      if (err) {
        console.log(err);
        return res.json({
          value: req.param('value'),
          valid: false,
          message: 'System error'
        });
      }

      // If there is a user, return error
      if (user) {
        return res.json({
          value: req.param('value'),
          valid: false,
          message: 'There is already a category with this name'
        });
      }

      // Return the success message
      return res.json({
        value: req.param('value'),
        valid: true,
      });
    });
  }
};
