/*
 * Model for gifts
 */
var mongoose = require('mongoose')
  , util = require('util')
  , _ = require('lodash')
  , moment = require('moment')
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;

// Design the schema
var giftSchema = new Schema({
  name: { type: String, required: true, index: true },
  cost: { type: Number, required: true, index: true },
  category: { type: ObjectId, ref: 'Category', index: true },
  description: { type: String },
  image: { type: String },
  createdAt: { type: Date, default: Date.now, index:true },
  updatedAt: { type: Date, default: Date.now, index: true }
});


// Before saving, update timestamp
giftSchema.pre('save', function(next) {
  // Update timestamp
  this.updatedAt = new Date();

  next();
});

// Create the virtual createdAt timestamp
giftSchema.virtual('createdAtTimestamp').get(function() {
  return moment(this.createdAt).unix();
});

var Gift = mongoose.model('Gift', giftSchema);
module.exports = Gift;
