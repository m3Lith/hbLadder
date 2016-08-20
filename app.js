var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
server.listen(process.env.PORT || '3000');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
require('dotenv').config({path: 'config/local.env'});

// Mongo
var mongoose = require('mongoose');

require('./models/Player');
require('./models/Challenge');
require('./models/Alert');

var db_uri = process.env.MONGODB_URI;
mongoose.connect(db_uri);


var routes = require('./routes/basic');
var player = require('./routes/player');
var challenge = require('./routes/challenge');
var playerAlerts = require('./routes/alert');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Include scripts
app.use('/bower', express.static(path.join(__dirname, 'bower_components')));

app.use('/', routes);
app.use('/api/player', player);
app.use('/api/challenge', challenge);
app.use('/api/playerAlerts', playerAlerts);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handler
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: err
	});
});


// Socket Tracking Variables
var clients = 0;

// Socket Events
io.on('connection', function(socket) {
	console.log('New client connection...');
	
	/* Client Events */
	io.sockets.emit('client:enter', ++clients);
	socket.on('disconnect', function() {
		io.sockets.emit('client:leave', --clients);
	});
	
	/* Player Events */
	socket.on('player:new', function(newPlayer) {
		forwardMessage('player:new', newPlayer);
	});
	/* Challenge Events */
	socket.on('challenge:issued', function(challenge) {
		forwardMessage('challenge:issued', challenge);
	});
	socket.on('challenge:resolved', function(challenge) {
		forwardMessage('challenge:resolved', challenge);
	});
	socket.on('challenge:revoked', function(challenge) {
		forwardMessage('challenge:revoked', challenge);
	});
	socket.on('challenge:forfeited', function(challenge) {
		forwardMessage('challenge:forfeited', challenge);
	});
});

function forwardMessage(eventName, data) {
	console.log('Passing: ['+eventName+']');
	io.sockets.emit(eventName, data);
}

module.exports = app;
