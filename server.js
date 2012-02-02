/*===========================================================================
	HTML5 Express Boilerplate ("H5EB")
============================================================================= */


/*===========================================================================
	TODO: JSHINT GLOBAL VARS, CONFIG, AND INSTRUCTIONS
============================================================================= */


/*===========================================================================
	DEPENDENCIES
============================================================================= */

var express = require('express'),
		inspect = require('inspect'),
		colors = require('colors'),
		sys = require('util'),
		mime = require('mime'),
		cleanCSS = require('clean-css'),
		app = module.exports = express.createServer();
		var io = require('socket.io').listen(app);


/*===========================================================================
	SETTINGS
============================================================================= */

var port = 3003,
		cacheAge = 60000 * 60 * 24 * 365,
		logs = {
			set: false,
			string: '\\n  ' + ':date'.bold.underline + '\\n\\n' + '  IP: '.cyan.bold
				+ ' ' + ':remote-addr'.white + '\\n' + '  Method: '.red.bold
				+ ':method'.white + '\\n' + '  URL: '.blue.bold + ':url'.white
				+ '\\n' + '  Status: '.yellow.bold + ':status'.white + '\\n'
				+ '  User Agent: '.magenta.bold + ':user-agent'.white
		};


/*===========================================================================
	DEFAULT CONFIG
============================================================================= */

app.configure(function(){
	app.set('views', __dirname + '/views');
	app.set('view engine', 'ejs');
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.favicon(__dirname + '/public/favicon.ico'));
	app.use(app.router);
	if(logs.set) app.use(express.logger(logs.string));
});


/*===========================================================================
	DEVELOPMENT CONFIG
	$ node server.js
============================================================================= */

app.configure('development', function() {
	
	app.use(express.static(__dirname + '/public'));
	app.use(express.errorHandler({
		dumpExceptions : true,
		showStack      : true
	}));

	var dev_scripts = [
		'jquery.tmpl.js',
		'jquery-ui-1.8.17.custom.min.js', 
		'socket.io.js' ,
		'underscore.js', 
		'backbone.js', 
		'plugins.js',
		'tab_main.js', 
		'tab_collections.js', 
		'tab_pairing.js', 
		'tab_views.js', 
		'tab_ui.js', 
		'tab_forms.js'
	];

	var dev_styles = [
		'bptop.css', 
		'1140.css', 
		'tab.css', 
		'bpbottom.css', 
		'jquery-ui-1.8.17.custom.css'
	];

	app.get('/tab', function(req, res) {
		res.render('tab', {
			title: 'Debate Tab | Development',
			javascripts: dev_scripts,
			stylesheets: dev_styles
		});
	});

	app.get('/tab/:id', function(req, res) {
		res.render('tab', {
			title: 'Debate Tab | Development',
			javascripts: dev_scripts,
			stylesheets: dev_styles,
			tournament_id: req.params.id
		});
	});

	var Client = require('twilio').Client,
	Twiml = require('twilio').Twiml,
	sys = require('sys'),
	tClient = new Client('AC89170a4e43fc4a38daed8f055879a20f', 'b6fd343fee0be8aaad34ed8df07ffb3f', 'debatetab.com', {port:3019});

	var phone = tClient.getPhoneNumber('+15128430409');
	// code to send MASS texts
	// TODO verify user logged in
	app.post('/textMass' , function(req, res){
		try {
			var list = req.body.smsList;
			console.log('Mass Message request: ');
			console.log(list);
			
			for (var i=0; i< list.length; i++) {
				var number = list[i].phone_number;
				var message = list[i].message;
				
				console.log('Sending ith message where i = ' + i);

				sendMassTexts(i, number, message);
			}
			res.send('mass texts sent');
		} catch (e) {
			console.log('An error has occured while sending the mass messages: ' + e.message);
			res.send('An error has occured while sending the mass messages: ' + e.message);
		}
	});

	// function that sends message and provides a callback with specific log actions as well
	// used by post('/textMass')
	// abstracting this action into a function allows the logging to work correctly because of
	// variable scope, which was an issue earlier
	function sendMassTexts(i, number, message) {
		 phone.sendSms(number, message, null, function () {
			console.log('i = ' + i);
			console.log('SMS sent to: ' + number);
			console.log('Message Sent: ' + message);
			console.log('');
		});
	}




});


/*===========================================================================
	PRODUCTION CONFIG
	$ NODE_ENV=production node server.js
============================================================================= */

app.configure('production', function() {
	app.use(express.static(__dirname + '/public', { maxAge: cacheAge }));
	app.use(express.errorHandler());
		app.get('/tab', function(req, res) {
			res.render('tab', {
				title: 'DebateTab',
				javascripts: ['tab-min.js'],
				stylesheets: ['tab-min.css']
			});
		});
		app.get('/tab/:id/', function(req, res) {
			res.render('tab', {
				title: 'DebateTab',
				javascripts: ['tab-min.js'],
				stylesheets: ['tab-min.css'],
				tournament_id: req.params.id
			});
	});
});

/*===========================================================================
	SOCKET.IO
============================================================================= */

/*
io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('ping', function (data) {
    console.log(data);
  });
});
*/

/*===========================================================================
	ERROR HANDLING
============================================================================= */

// Since this is the last non-error-handling
// middleware use()d, we assume 404, as nothing else
// responded.
app.use(function(req, res, next){
	// the status option, or res.statusCode = 404
	// are equivalent, however with the option we
	// get the "status" local available as well
	res.render('404', {
		layout: false,
		status: 404,
		//url: req.url,
		title: '404 Error'
	});
});

// error-handling middleware, take the same form
// as regular middleware, however they require an
// arity of 4, aka the signature (err, req, res, next).
// when connect has an error, it will invoke ONLY error-handling
// middleware.

// If we were to next() here any remaining non-error-handling
// middleware would then be executed, or if we next(err) to
// continue passing the error, only error-handling middleware
// would remain being executed, however here
// we simply respond with an error page.

app.use(function(err, req, res, next){
	// we may use properties of the error object
	// here and next(err) appropriately, or if
	// we possibly recovered from the error, simply next().
	res.render('500', {
		layout: false,
		status: err.status || 500,
		error: err,
		title: '500 Error'
	});
});


/*===========================================================================
	YOUR ROUTES
============================================================================= */

// Index
app.get('/', function(req, res) {
	res.render('index', {
		modernizr: "javascripts/libs/modernizr-2.0.6.min.js",
		jquery: "javascripts/libs/jquery-1.7.1.min.js",
		title: 'this is a title',
		description: 'this is a description',
		javascripts: [],
		stylesheets: []
	});
});

/*===========================================================================
	ERROR TESTING
============================================================================= */

/*
// 404 Error
app.get('/404', function(req, res, next){
	next();
});

// 403 Error
app.get('/403', function(req, res, next){
	var err = new Error('not allowed!');
	err.status = 403;
	next(err);
});

// 500 Error
app.get('/500', function(req, res, next){
	next(new Error('keyboard cat!'));
});
*/

/*===========================================================================
	WILDCARD MIDDLEWARE
============================================================================= */

function wildcard(req, res, next) {

	/*=========================================================================
		BETTER WEBSITE EXPERIENCE FOR IE USERS
	=========================================================================== */
	var url = req.url,
			ua = req.headers['user-agent'],
			reqPath = req.url;

	if(ua && ua.indexOf('MSIE'))
		res.setHeader('X-UA-Compatible', 'IE=Edge,chrome=1');

	// We don't want to send this header on _everything_
	if(reqPath.match(/\.(js|css|gif|png|jpe?g|pdf|xml|oga|ogg|m4a|ogv|mp4|m4v|webm|svg|svgz|eot|ttf|otf|woff|ico|webp|appcache|manifest|htc|crx|xpi|safariextz|vcf)$/)) {
		res.removeHeader('X-UA-Compatible');
		res.removeHeader('IE=Edge,chrome=1');
	}

	/*=========================================================================
		CORS
	=========================================================================== */
	// Force the latest IE version, in cases when it may fall back to IE7 mode
	// http://github.com/rails/rails/commit/123eb25#commitcomment-118920
	// Use ChromeFrame if it's installed, for a better experience with IE folks
	// Control cross domain using CORS http://enable-cors.org
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader("Access-Control-Allow-Headers", "X-Requested-With");

	/*=========================================================================
		MIME TYPES
	=========================================================================== */

	// Until pull request is in
	// https://github.com/bentomas/node-mime
	mime.define({
		'font/opentype'                  : ['otf'],
		'text/cache-manifest'            : ['appcache', 'manifest'],
		'text/x-component'               : ['htc'],
		'application/x-chrome-extension' : ['crx'],
	});

	// TODO: Allow concatenation from within specific js and css files
	// https://github.com/paulirish/html5-boilerplate/blob/master/.htaccess/#L111

	// TODO: Gzip compression
	// https://github.com/paulirish/html5-boilerplate/blob/master/.htaccess/#L137

	// TODO: Expires headers (for better cache control)
	// https://github.com/paulirish/html5-boilerplate/blob/master/.htaccess/#L186

	// TODO: Stop screen flicker in IE on CSS rollovers
	// https://github.com/paulirish/html5-boilerplate/blob/master/.htaccess/#L271

	// TODO: Cookie setting from iframes
	// https://github.com/paulirish/html5-boilerplate/blob/master/.htaccess/#L286

	// TODO: Suppress or force the "www." at the beginning of URLs
	// https://github.com/paulirish/html5-boilerplate/blob/master/.htaccess/#L315

	// TODO: Built-in filename-based cache busting
	// https://github.com/paulirish/html5-boilerplate/blob/master/.htaccess/#L356

	// TODO: Prevent SSL cert warnings
	// https://github.com/paulirish/html5-boilerplate/blob/master/.htaccess/#L376

	// TODO: UTF-8 encoding
	// https://github.com/paulirish/html5-boilerplate/blob/master/.htaccess/#L411

	// TODO: Block access to "hidden" directories whose names begin with a period
	// https://github.com/paulirish/html5-boilerplate/blob/master/.htaccess/#L442

	next();
}

/*===========================================================================
	ALWAYS KEEP THIS ROUTE LAST
============================================================================= */
app.use(wildcard);

/*===========================================================================
	START EXPRESS SERVER
============================================================================= */

app.listen(port);
var appPort = app.address().port + '',
		appEnv = app.settings.env.toUpperCase();

sys.puts(''
	+ 'SERVER LISTENING ON PORT '.rainbow
	+ " ".white.inverse
	+ appPort.white.inverse
	+ " ".white.inverse
	+ ' IN '.rainbow
	+ " ".white.inverse
	+ appEnv.white.inverse
	+ " ".white.inverse
	+ ' MODE '.rainbow
);

