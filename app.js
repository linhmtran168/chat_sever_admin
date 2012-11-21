
/**
 * Module dependencies.
 */

var express = require('express')
  , mongoose = require('mongoose')
  , http = require('http')
  , path = require('path')
  , RedisStore = require('connect-redis')(express)
  , passport = require('passport')
  , validator = require('express-validator')
  , flash = require('connect-flash');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view option', {
    layout: false
  });
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser({
    keepExtensions: true
  }));
  app.use(validator);
  app.use(express.methodOverride());

  // Session configuration
  app.all(/^(?!\/api).*$/, express.cookieParser());
  app.all(/^(?!\/api).*$/, express.session({
    store: new RedisStore({ db: 'sessions', maxAge: 14400000 }),
    secret: 'DragonLinh123456789'
  }));
  
  // Passport inintialization
  app.all(/^(?!\/api).*$/, passport.initialize());
  app.all(/^(?!\/api).*$/, passport.session());

  // Set up flash message
  app.all(/^(?!\/api).*$/, flash());

  // CSRF configuration
  app.all(/^(?!\/api).*$/, express.csrf());

  // Authentication configuration
  app.all(/^(?!\/api).*$/, function(req, res, next) {
    // Set the local user = req.user
    res.locals.currentUser = req.user;
    // Set the page title 
    res.locals.slug = '';

    next();
  });


  // Router configuration
  app.use(app.router);

  // Static assets 
  app.use(require('less-middleware')({ src: __dirname + '/public' }));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  mongoose.connect('mongodb://localhost:27017/ogorin', { user: 'ogorin', pass: 'dragonLinh123' });
});

app.configure('production', function() {
  app.use(express.errorHandler());
  mongoose.connect('mongodb://localhost:27017/ogorin', { user: 'ogorinPro', pass: 'ProOgorinMongo' });
});

// Require passport configuration
require('./config/passport');

// Require route configuration
require('./routes/')(app);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
