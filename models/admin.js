/*
 * Models for Admin
 */
var mongoose = require('mongoose')
  , bcrypt = require('bcrypt')
  , util = require('util')
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;

var adminSchema = new Schema({
  adminname: { type: String, required: true, index: { unique: true }},
  email: { type: String, required: true, index: { unique: true }},
  hash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'parttime'] },
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now, index: true }
});

// Update timestamp before save
adminSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create the virtual attribute password
adminSchema.virtual('password').set(function(password) {
  // Use bcrypt to hash the password
  var salt = bcrypt.genSaltSync(10);
  this.hash = bcrypt.hashSync(password, salt);
});

// Method to verify password
adminSchema.method('verifyPassword', function(password, callback) {
  bcrypt.compare(password, this.hash, callback);
});

// Static method to authenticate a user
adminSchema.static('authenticate', function(adminname, password, callback) {
  this.findOne({ adminname: adminname }, function(err, admin) {
    // If error return error          
    console.log(util.inspect(admin));
    if (err) {
      return callback(err, false, { message: "System error" });
    }

    // If no user return false
    if (!admin) {
      return callback(null, false, { message: "No admin with this username" });
    }

    // Verify Password
    admin.verifyPassword(password, function(err, isCorrect) {
      // If error
      if (err) {
        return callback(err, false, { message: "System error" });
      }

      // If password not corrcet return false
      if (!isCorrect) {
        return callback(null, false, { message: "Wrong password" });
      }

      // Return the user
      return callback(null, admin, { message: "Successfully logged in" });
    });
  });
});

var Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
