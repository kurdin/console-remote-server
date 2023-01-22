const http = require('http');
const { version } = require('../package.json');
// var cors = require('cors');


var app = http.createServer(function (req,res){
	// Set CORS headers
	console.log(req.headers)
	res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
	res.setHeader('Access-Control-Request-Method', '*');
	res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
	res.setHeader('Access-Control-Allow-Headers', req.headers.origin);
	return;
	// ...
});

require('custom-env').env(process.env.NODE_ENV || 'development');

if (process.env.PORT) process.env.SERVER_PORT = process.env.PORT;
const ignoreList = process.env.IGNORE_CHANNELS ? process.env.IGNORE_CHANNELS.split(',') : [];

const io = require('socket.io')(app, {
	cors: {
		origin: '*',
		methods: ['GET', 'POST'],
	},
});

// eslint-disable-next-line no-console
console.log(
	`\nRemote Console Personal Server ver: ${version} host: ${process.env.SERVER_PROTOCOL}://${
		process.env.SERVER_DOMAIN
	} env: ${process.env.NODE_ENV ? process.env.NODE_ENV : 'development'} ${
		process.env.SERVER_PORT ? `port: ${process.env.SERVER_PORT}` : 80
	}`
);

app.listen(process.env.SERVER_PORT || 80);
io.serveClient(false);
io.use((socket, next) => {
	if (socket.request.headers['x-consolere']) return next();
	return next(new Error('Authentication error'));
});

io.on('connection', function (socket) {
	socket.on('command', function (data) {
		if (!data.channel) data.channel = 'public';
		socket.broadcast.to(data.channel).emit('toConsoleRe', data);
	});

	socket.on('channel', function (channel) {
		socket.join(channel);
		if (!ignoreList.includes(channel)) {
			socket.join(channel);
			// eslint-disable-next-line no-console
			console.info('join channel:', channel);
		}
	});

	socket.on('toServerRe', function (data, cb) {
		if (!data.channel) data.channel = 'public';
		if (data.loopback) {
			io.to(data.channel).emit('toConsoleRe', data);
		} else {
			socket.broadcast.to(data.channel).emit('toConsoleRe', data);
		}
		if (cb !== undefined) cb('success');
	});
});