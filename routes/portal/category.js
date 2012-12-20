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
    Category.find({}, null, { sort: 'name' }, function(err, categories) {
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

    // Log
    // console.log(req.body.description);
    // console.log(category);

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
   * Function to render the update category modal
   */
  updateView: function(req, res) {
    // Get the id
    var categoryId = req.param('id');

    // Find the category 
    Category.findById(categoryId, function(err, category) {
      if (err) {
        // Re-render the user profile
        req.flash('message', 'There is error deleting the category');
        return res.redirect('/gift/categories');
      }

      if (!category) {
        req.flash('message', 'There is no category with this id');
        return res.redirect('/gift/categories');
      }

      // Render the partial
      return res.render('partials/updateCat', {
        category: category
      });
    });
  },

  /*
   * Function to update a category
   */
  update: function(req, res) {
    // Get the id
    var categoryId = req.body.id;

    // Check for category name
    if (_.isUndefined(req.body.name)) {
      req.flash('message', 'Category name is missing');
      return res.redirect('/gift/categories');
    }

    Category.findById(categoryId, function(err, category) {
      if (err) {
        // Re-render the user profile
        req.flash('message', 'There is error deleting the category');
        return res.redirect('/gift/categories');
      }

      if (!category) {
        req.flash('message', 'There is no category with this id');
        return res.redirect('/gift/categories');
      }

      // Update the category
      category.name = req.body.name;
      if (req.body.description) {
        category.description = req.body.description;
      }

      // Attemp to save the category
      category.save(function(err) {
        if (err) {
          // Re-render the user profile
          req.flash('message', 'There is error deleting the category');
          return res.redirect('/gift/categories');
        }

        // Success
        req.flash('message', 'Successfully updated the category');
        return res.redirect('/gift/categories');
      });
    });
  },

  /*
   * Function to delete a category
   */
  delete: function(req, res) {
    // Get category id
    var categoryId = req.param('id');

    Category.findByIdAndRemove(categoryId, function(err, category){
      // If error rerender the page
      if (err) {
        // Re-render the user profile
        req.flash('message', 'There is error deleting the category');
        return res.redirect('/gift/categories');
      }

      // Create the success messge
      req.flash('message', 'Successfully deleting the category');
      return res.redirect('/gift/categories');
    });
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
