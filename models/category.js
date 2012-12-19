/*
 * Model for category
 */
var mongoose = require('mongoose')
  , util = require('util')
  , _ = require('lodash')
  , moment = require('moment')
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;

// Design the schema
var categorySchema = new Schema({
  name: { type: String, required: true, index: { unique: true } },
  description: { type: String },
  createdAt: { type: Date, default: Date.now, index:true },
  updatedAt: { type: Date, default: Date.now, index: true }
});


// Before saving, update timestamp
categorySchema.pre('save', function(next) {
  // Update timestamp
  this.updatedAt = new Date();

  next();
});

var Category = mongoose.model('Category', categorySchema);
module.exports = Category;
