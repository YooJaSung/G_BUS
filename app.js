var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

/**
 *
 * basic express require
 */

var http = require('http');
var cors = require('cors');
var domain = require('express-domain-middleware');
/**
 *
 * http & cors & domain require
 */

var route = require('./routes/route/routeJs');
var place = require('./routes/place/placeJs');
var station = require('./routes/station/stationJs');
var region = require('./routes/common/region.js');

var app = express();

// view engine setup
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));

app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(domain);

/**
 * basic setting end
 */

app.use('/', route);
app.use('/', station);
app.use('/', place);
app.use('/', region);

/**
 * show index page first get request
 */
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('page Not Found');
  err.status = 404;
  next(err);
});

// error handlers

app.use(function errorHandler(err, req, res, next) {

  console.log('error on request %d | %s | %s | %d', process.domain.id, req.method, req.url, err.status);

  console.log(err.stack);

  err.message = err.status == 500 ? ' Error -->  ' : err.message;

  res.status(err.status).send(err.message);
});




/**
 * create server & server running
 */
http.createServer(app).listen(app.get('port'), function(){
  console.log('G_BUS server running at 3000 port');
});

module.exports = app;
