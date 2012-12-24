var Category = require('../../models/category')
  , User = require('../../models/user')
  , Gift = require('../../models/gift')
  , helpers = require('./helpers')
  , util = require('util')
  , _ = require('lodash');

/*
 * Portal route for gift
 */
module.exports = {
  /*
   * Function to list all gift
   */
  index: function(req, res) {
    // Find all the categories in the database 
    Category.find({}, null, { sort: 'name' }, function(err, categories) {
      // if err
      if (err) {
        return res.render('gift/index', {
          slug: 'gift',
          title: 'Gift Store',
          message: 'There is error getting categories'
        });
      }

      // Find all the gift in the database
      Gift.find({}, null, function(err, gifts) {
        // if err
        if (err) {
          return res.render('gift/index', {
            slug: 'gift',
            title: 'Gift Store',
            message: 'There is error getting gift'
          });
        }

        var message = req.flash('message');

        // Create the path for upload image
        var env;
        if (process.env.NODE_ENV === 'production') {
          env = 'server';
        } else {
          env = 'local';
        }

        return res.render('gift/index', {
          slug: 'gift',
          title: 'Gift Store',
          categories: categories,
          gifts: gifts,
          message: message,
          env: env
        });
      });
    });
  },

  /*
   * Function to see a gift detail
   */
  detail: function(req, res) {

  },

  /*
   * Function to create a gift
   */
  add: function(req, res) {
    // Get request
    if (req.method !== 'POST') {
    // Find all the categories in the database
      Category.find({}, null, { sort: 'name' }, function(err, categories) {

        // if err
        if (err) {
          req.flash('message', 'System error');
          return res.redirect('/gift');
        }

        var message = req.flash('message');

        return res.render('gift/new', {
          slug: 'gift',
          title: 'Add New Gift',
          categories: categories,
          message: message
        });
      });
    }
    
    // POST request
    // Check the parameters
    req.check('name', 'Gift name should not be empty').notEmpty();
    req.check('cost', 'Cost should be a number').notEmpty().isInt();

    // Create the mapped errors array
    var errors = req.validationErrors(true);

    if (errors && errors.length > 0) {
      req.flash('message', 'Save gift failed. Check your name and cost');
      return res.redirect('/gift/add');
    }

    // Create the new gift instance
    var gift = new Gift({
      name: req.body.name,
      cost: req.body.cost,
      category: req.body.category
    });

    // If there is a description
    if (req.body.description) {
      gift.description = req.body.description;
    }

    // Check for image file in the request
    if (_.isUndefined(req.files) || _.isUndefined(req.files.image)) {
      // If there is no image, use default image
      gift.image = 'noimage.gif';
    } else {
      console.log('Gift: Upload image for new gift');
      helpers.uploadFile(req.files.image, function(err, newPhotoName) {
        // If file type check fails or there is error uploading the file
        if (err) {
          if (newPhotoName === false) {
            if (err.type === 'extension') {
              req.flash('message', 'Wrong type of extension');
              return res.redirect('/gift/add');
            } 
          }

          req.flash('message', 'There is problem uploading the image');
          // Redirect to gift add page
          return res.redirect(500, '/gift/add');
        }

        // Save the image
        gift.image = newPhotoName;

        // Attempt to save the gift
        gift.save(function(err) {
          // If err
          if (err) {
            req.flash('message', 'System Error');
            return res.redirect(500, '/');
          }

          // If success
          console.log(gift);
          req.flash('message', 'Sucessfully save the gift');
          return res.redirect('/gift');
        });
      });
    }
  },

  /*
   * Function to update a gift
   */
  update: function(req, res) {

  },

  /*
   * Function to delete a gift
   */
  delete: function(req, res) {

    // Function to delete a gift
  },

};
