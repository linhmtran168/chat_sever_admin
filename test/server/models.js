var mongoose = require('mongoose')
  , chai = require('chai')
  , expect = chai.expect
  , should = chai.should()
  , User = require("../../models/user")
  , Admin = require("../../models/admin");

beforeEach(function() {
  mongoose.connect('mongodb://localhost:27017/ogorinTest');
});

afterEach(function() {
  mongoose.connection.close();
});

//---- Test for admin model
describe("Admin Model",function() {
  var testAdmin = null;

  beforeEach(function(done) {
    // Add test data
    testAdmin = new Admin({
      adminname: "testAdmin1",
      email: "linhmtran168@live.com",
      password: "abcxyz",
      role: "admin"
    });

    testAdmin.save(function(err, admin) {
      if (!err) {
        done();
      }
    });

  });

  afterEach(function(done) {
    Admin.remove({}, function() {
      done();
    });
  });

  it("should save a new admin", function(done) {
    var testAdmin2 = new Admin({
      adminname: "TestAdmin2",
      email: "dragon2@abc.com",
      password: "asdfdf",
      role: "parttime"
    });

    testAdmin2.save(function(err, admin) {
      if (!err) {
        done();
      }
    });
  });

  it("should fail when save a user with the same adminname", function(done) {
    var testAdmin3 = new Admin({
      adminname: "TestAdmin2",
      email: "dragon1@abc.com",
      password: "asdfdf",
      role: "admin"
    });

    testAdmin3.save(function(err, admin) {
      if (!err) {
        done();
      }
    });
  });

  it("should fail when save an admin with the same email", function(done) {
    var testAdmin3 = new Admin({
      adminname: "TestAdmin3",
      email: "dragon2@abc.com",
      password: "asdfdf",
      role: "admin",
    });

    testAdmin3.save(function(err, admin) {
      if (!err) {
        done();
      }
    });
  });

  it("should authenticate an admin with correct credentials", function(done) {
    Admin.authenticate("testAdmin1", 'abcxyz', function(err, admin, message) {
      admin.email.should.equal("linhmtran168@live.com");
      done();
    });
  });

  it("should fail when authenticating an admin with incorrect credentials", function(done) {
    Admin.authenticate("TestAdmin2", 'asdsfdsdf', function(err, admin, message) {
      should.equal(undefined);
      done();
    });
  });
});


//---- Test for user model
describe("User Model", function() {
  var testUser = null;

  beforeEach(function(done) {
    // Add test data
    testUser = new User({
      username: "testUser1",
      email: "linhmtran168@live.com",
      password: "Dragon"
    });

    testUser.save(function(err, user) {
      if (!err) {
        done();
      }
    });
  });

  afterEach(function(done) {
    User.remove({}, function() {
      done();
    });
  });

  it("Save a new user", function(done) {
    var testUser2 = new User({
      username: "testUser2",
      email: "dragon1@live.com",
      password: "abcxyz",
    });

    testUser2.save(function(err, user) {
      user.username.should.equal('testUser2');
      user.hash.should.not.equal('abcxyz');
      done();
    });
  });

}); 

