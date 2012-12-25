var Category = require('../../models/category')
  , User = require('../../models/user')
  , Gift = require('../../models/gift')
  , helpers = require('./helpers')
  , util = require('util')
  , ObjectId = require('mongoose').Types.ObjectId
  , _ = require('lodash');

/*
 * Portal route for gift
 */
module.exports = {
  /*
   * Function to list all gift
   */
  index: function(req, res) {
    // Check the page num
    var itemsPerPage = 10;
    var skipItems = 0;
    var pageNum = 1;
    var currentCategory;
    // Get the pageNum in the query
    if (req.query.page) {
      req.check('page', 'Cost should be a number').notEmpty().isInt();
      // Create the mapped errors array
      var errors = req.validationErrors(true);

      if (errors && errors.length > 0) {
        req.flash('message', 'Wrong page number');
        return res.redirect('/');
      }

      pageNum = parseInt(req.query.page, 10);
    }


    // Get the category query
    var giftParams = {};
    if (req.query.category) {
      giftParams = { 'category': req.query.category };
      currentCategory =  req.query.category;
    }

    // Find all the categories in the database 
    Category.find({}, null, { sort: 'name' }, function(err, categories) {
      // if err
      if (err) {
        req.flash('message', 'Wrong page number');
        return res.redirect('/');
      }

      // Get the gift count
      Gift.count(giftParams, function(err, itemsCount) {  
        // Get the max number of pages
        var maxNumPage = Math.ceil(itemsCount / itemsPerPage) > 0 ? Math.ceil(itemsCount / itemsPerPage) : 1;
        // if page Num > max num page
        if (pageNum > maxNumPage) {
          pageNum = maxNumPage;
        }

        // Calculate the skipItems
        skipItems = (pageNum - 1) * itemsPerPage;
        console.log(skipItems);
        // Find all the gift in the database
        Gift.find(giftParams, null, { sort: { createdAt: -1 }, limit: itemsPerPage, skip: skipItems }, function(err, gifts) {
          // if err
          if (err) {
            console.log(err);
            req.flash('message', 'There is error getting categories');
            return res.redirect('/');
          }

          var message = req.flash('message');

          // Create the path for upload image
          var env;
          if (process.env.NODE_ENV === 'production') {
            env = 'server';
          } else {
            env = 'local';
          }

          var isPager = true;
          if (itemsCount <= itemsPerPage) {
            isPager = false;
          }

          console.log(categories);
          return res.render('gift/index', {
            slug: 'gift',
            title: 'Gift Store',
            categories: categories,
            currentCategory: currentCategory,
            gifts: gifts,
            message: message,
            env: env,
            pageNum: pageNum,
            isPager: isPager,
            maxPage: maxNumPage,
          });
        });
      });
    });
  },

  /*
   * Function to see a gift detail
   */
  detail: function(req, res) {
    // Get the gift from the database
    Gift.findById(req.params.id).populate('category').exec(function(err, gift) {
      if (err) {
        req.flash('message', 'System error');
        return res.redirect('/gift');
      }

      if (!gift) {
        req.flash('message', 'There is no gift with this id');
        return res.redirect('/gift');
      }

      // Create the path for upload image
      var env;
      if (process.env.NODE_ENV === 'production') {
        env = 'server';
      } else {
        env = 'local';
      }

      return res.render('partials/giftDetail', {
        gift: gift,
        env: env,
      });
    });
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
    } else {
    
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
      if (!req.files.image.name) {
        // If there is no image, use default image
        gift.image = 'noimage.gif';

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
    }
  },

  /*
   * Function to update a gift
   */
  update: function(req, res) {
    var giftId = req.params.id;
    Gift.findById(giftId, function(err, gift) {
      // If err re
      if (err) {
        // Re-render the gift page
        req.flash('message', 'There is error loading the gift');
        return res.redirect('/gift');
      }

      if (!gift) {
        // No gift
        req.flash('message', 'There is no gift with this id');
        return res.redirect('/gift');
      }

      // GET request
      if (req.method !== 'POST') {
        Category.find({}, null, { sort: 'name' }, function(err, categories) {
          // If err 
          if (err) {
            // Re-render the gift page
            req.flash('message', 'There is error loading the categories');
            return res.redirect('/gift');
          }

          var env;
          if (process.env.NODE_ENV === 'production') {
            env = 'server';
          } else {
            env = 'local';
          }

          // Get the message
          var message = req.flash('message');
          return res.render('gift/update', {
            slug: 'gift',
            gift: gift,
            title: 'Update Gift',
            env: env,
            message: message,
            categories: categories
          });
        });
      } else {

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
        
        // Add the new parameter
        gift.name = req.body.name;
        gift.cost = req.body.cost;
        gift.category = req.body.category;

        // If there is a description
        if (req.body.description) {
          gift.description = req.body.description;
        }

        // If there is no new image, save the gift 
        if (!req.files.image.name) {
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
        } else {
          console.log('Gift: Upload image for new gift');
          helpers.uploadFile(req.files.image, function(err, newPhotoName) {
            // If file type check fails or there is error uploading the file
            if (err) {
              if (newPhotoName === false) {
                if (err.type === 'extension') {
                  req.flash('message', 'Wrong type of extension');
                  return res.redirect('/gift/edit/' + gift.id);
                } 
              }

              req.flash('message', 'There is problem uploading the image');
              // Redirect to gift add page
              return res.redirect(500, '/gift/add/' + gift.id);
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
      }
    });
  },

  /*
   * Function to delete a gift
   */
  delete: function(req, res) {
    // Get category id
    var giftId = req.params.id;

    Gift.findByIdAndRemove(giftId, function(err, gift){
      // If error rerender the page
      if (err) {
        // Re-render the user profile
        req.flash('message', 'There is error deleting the category');
        return res.redirect('/gift');
      }

      // Delete the photo image
      helpers.deletePhoto(gift.image);

      // Create the success messge
      req.flash('message', 'Successfully deleting the category');
      return res.redirect('/gift');
    });
  },

};
