/*
 * API routes for gift
 */
var Gift = require('../../models/gift')
  , Category = require('../../models/category')
  , Order = require('../../models/order')
  , User = require('../../models/user')
  , util = require('util')
  , helpers = require('./helpers')
  , _ = require('lodash');

module.exports = {

  /*
   * Function to list all categories
   */
  listCategories: function(req, res) {
    Category.find({}, function(err, categories) {
      // if err
      if (err) {
        return res.json({
          status: 0,
          error: {
            type: 'system',
            message: 'System Error'
          }
        });
      }

      // Return all the category
      return res.json({
        status: 1,
        categories: categories,
        message: 'Successfully get the categories'
      });
    });
  },

  /*
   * Function to list gifts from the store
   */
  list: function(req, res) {
    // If there is a category query in the request get only gift in this category
    if (req.query.category) {
      // Get gift according to category
      console.log('Get gift in category: ' + req.query.category);
      // Check if there is a category with this id
      Category.findById(req.query.category, function(err, category) {
        // If err
        if (err) {
          return res.json({
            status: 0,
            error: {
              type: 'system',
              message: 'System Error'
            }
          });
        }

        // If there is no category
        if (!category) {
          return res.json({
            status: 0,
            error: {
              type: 'gift',
              message: 'There is no category with this id'
            }
          });
        }

        // Find all the gift with this category
        Gift.find({ category: category.id }, function(err, gifts) {
          // If err
          if (err) {
            return res.json({
              status: 0,
              error: {
                type: 'system',
                message: 'System Error'
              }
            });
          }

          // Return the gifts
          return res.json({
            status: 1,
            gifts: gifts,
            message: 'Successfully getting the gifts in the category'
          });
        });
      });
    } else {

      // Or get all the gifts
      Gift.find({}, function(err, gifts) {
        // If err
        if (err) {
          return res.json({
            status: 0,
            error: {
              type: 'system',
              message: 'System Error'
            }
          });
        }

        // if success return all the gifts
        return res.json({
          status: 1,
          gifts: gifts,
          message: 'Success fully getting all the gifts'
        });
      });
    }
  },
  
  /*
   * Function to get a gift detail
   */
  detail: function(req, res) {
    // Check if there is a gift with the id
    Gift.findById(req.params.id, '-createdAt -updatedAt').populate('category', '-createdAt -updatedAt').exec(function(err, gift) {
      // If err
      if (err) {
        return res.json({
          status: 0,
          error: {
            type: 'system',
            message: 'System Error'
          }
        });
      }

      // If there is no gift with this id return error
      if (!gift) {
        return res.json({
          status: 0,
          error: {
            type: 'gift',
            message: 'There is no gift with this id'
          }
        });
      }

      // Return the gift
      return res.json({
        status: 1,
        gift: gift,
        message: 'Sucessfully getting the gift detail'
      });
    });
  },

  /*
   * Function for a user to order a gift
   */
  order: function(req, res) {
    // Check if there is address, postalcode, phoneNumber param
    if (!req.body.address || !req.body.postalCode || !req.body.phoneNumber) {
      return res.json({
        status: 0,
        error: {
          type: 'gift',
          message: 'Please enter all of your information'
        }
      });
    }

    // Check if there is a gift with the id
    Gift.findById(req.params.id, function(err, gift) {
      // If err
      if (err) {
        return res.json({
          status: 0,
          error: {
            type: 'system',
            message: 'System Error'
          }
        });
      }

      // If there is no gift with this id return error
      if (!gift) {
        return res.json({
          status: 0,
          error: {
            type: 'gift',
            message: 'There is gift with this id'
          }
        });
      }

      // If the gift is not in stock, return false - to-do later

      // Get the current user
      User.findById(req.currentUserId, function(err, user) {
        // If err
        if (err) {
          return res.json({
            status: 0,
            error: {
              type: 'system',
              message: 'System Error'
            }
          });
        }

        // Check if user point is enough to buy the gift
        if (user.points < gift.cost) {
          return res.json({
            status: 0,
            error: {
              type: 'gift',
              message: 'ギフト購入のためのポイントが足りません'
            }
          });
        }

        // Find the latest inserted order in the database
        Order.find({}).sort('-orderCode').limit(1).exec(function(err, orders) {
          console.log(orders);
          var lastOrder = orders.shift()
            , orderCode = 1;

          // Get the order code
          console.log(lastOrder);
          if (lastOrder) {
            orderCode = lastOrder.orderCode + 1;
          }

          // All are satisfied, create new orders
          var order = new Order({
            user: user.id,
            gift: gift.id,
            address: req.body.address,
            postalCode: req.body.postalCode,
            phoneNumber: req.body.phoneNumber,
            orderTime: Math.round(+new Date()/1000),
            orderCode: orderCode
          });

          // Attempt to save the order
          order.save(function(err) {
            // If err 
            if (err) {
              console.log(err);
              return res.json({
                status: 0,
                error: {
                  type: 'system',
                  message: 'System Error'
                }
              });
            }

            // Save the new points for the user
            user.points = user.points - gift.cost;

            // Save the user
            user.save(function(err) {

              // If err 
              if (err) {
                return res.json({
                  status: 0,
                  error: {
                    type: 'system',
                    message: 'System Error'
                  }
                });
              }

              // Return the success message
              return res.json({
                status: 1,
                order: order,
                message: '購入が成功した'
              });
            });

          });
        });
      });
    });
  },

  /*
   * Function to list user's orders
   */
  listOrders: function(req, res) {
    // Get the current user
    User.findById(req.currentUserId, function(err, user) {
      // If err
      if (err) {
        return res.json({
          status: 0,
          error: {
            type: 'system',
            message: 'System Error'
          }
        });
      }

      // Find all the the that have the current user id
      Order.find({ user: user.id }).sort('-updatedAt').populate('gift', '-createdAt -updatedAt').exec(function(err, orders) {
        // If err
        if (err) {
          return res.json({
            status: 0,
            error: {
              type: 'system',
              message: 'System Error'
            }
          });
        }

        // Return the orders
        return res.json({
          status: 1,
          orders: orders,
          message: 'Successfully getting user\'s orders'
        });
      });
    });
  },

  /*
   * Function to see a order's detail
   */
  orderDetail: function(req, res) {
    // Find the order with the id from the param
    Order.findById(req.params.id, '-createdAt -updatedAt').populate('gift', '-createdAt -updatedAt').exec(function(err, order) {
      // If err
      if (err) {
        return res.json({
          status: 0,
          error: {
            type: 'system',
            message: 'System Error'
          }
        });
      }

      // Return the order 
      return res.json({
        status: 1,
        order: order,
        message: 'Successfully getting order\'s detail'
      });
    });
  }
};
