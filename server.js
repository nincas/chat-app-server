const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);

server.listen(process.env.PORT || 8888);

let users = [];
let connections = [];
let messages = [];

io.sockets.on('connection', (socket) => {
	connections.push(socket.id);
	console.log(`User Connected: ${connections.length}`);
	socket.on('new user', (user, callback) => {
		let status = checkUser(user, socket);
		callback(status, users);
		SendMessages();
		updateUsers();
	})

	socket.on('TYPING', (user, callback) => {
		callback(user);
		io.sockets.emit('TYPING', user );
	})

	socket.on('disconnect', (status) => {
		users.splice(users.indexOf(socket.username), 1);
		connections.splice(connections.indexOf(socket.id), 1);
		console.log(`User Connected: ${connections.length}`);
		updateUsers();
	});

	socket.on('SENDING', (data, callback) => {
		callback('Sent');
		messages.push({user: data.user, message: data.message});
		SendMessages()
		console.log(messages);
	})

	function updateUsers() {
		io.sockets.emit('newuser_connected', users);
		console.log(users);
	}

	function SendMessages() {
		io.sockets.emit('SENT', { messages });
	}
});

let checkUser = (user, socket) => {
	if (users.indexOf(user.user) === -1) {
		socket.username = user.user;
		users.push(socket.username);
		return true;
	} else {
		return false;
	}
	// console.log(users);
}