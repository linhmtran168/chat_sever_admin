/*
 * Model for order
 */
var mongoose = require('mongoose')
  , util = require('util')
  , _ = require('lodash')
  , moment = require('moment')
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;

// Design the schema
var orderSchema = new Schema({
  orderCode: { type: Number, default: 0, index: { unique: true } },
  user: { type: ObjectId, ref: 'User', index: true },
  gift: { type: ObjectId, ref: 'Gift', index: true },
  address: { type: String },
  postalCode: { type: String },
  phoneNumber: { type: String },
  status: { type: String, enum: ['untouched', 'contacted', 'done'], default: 'untouched', index: true },
  orderTime: { type: String, require: true, index: true },
  createdAt: { type: Date, default: Date.now, index:true },
  updatedAt: { type: Date, default: Date.now, index: true }
});


// Before saving, update timestamp
orderSchema.pre('save', function(next) {
  // Update timestamp
  this.updatedAt = new Date();

  next();
});

var Order = mongoose.model('Order', orderSchema);
module.exports = Order;
