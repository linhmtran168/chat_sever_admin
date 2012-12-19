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
    return res.render('gift/index', {
      slug: 'gift',
      title: 'Gift Store'
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

  },

};
