const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getUsersRoom } = require('./utils/user');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
const server = http.createServer(app);
const io = socketio(server);

const BOT_NAME = 'Simple Chat Bot';

io.on('connection', (socket) => {
	// Send this to new connected client

	socket.on('joinRoom', ({ username, room }) => {
		const user = userJoin(socket.id, username, room);
		socket.join(user.room);
		socket.emit('message', formatMessage(BOT_NAME, 'Welcome to Simple Chat'));

		// Send this to every one except new connected client
		socket.broadcast
			.to(user.room)
			.emit('message', formatMessage(BOT_NAME, `${user.username} has just joined the chat`));

		io.to(user.room).emit('roomUsers', {
			room: user.room,
			users: getUsersRoom(user.room),
		});
	});

	socket.on('chatMessage', (message) => {
		const user = getCurrentUser(socket.id);
		io.to(user.room).emit('message', formatMessage(user.username, message));
	});

	// Send this to every one when some one disconnect
	socket.on('disconnect', () => {
		const user = userLeave(socket.id);
		if (user) {
			io.to(user.room).emit('message', formatMessage(BOT_NAME, `${user.username} has just left the chat`));
			io.to(user.room).emit('roomUsers', {
				room: user.room,
				users: getUsersRoom(user.room),
			});
		}
	});
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server running http://localhost:${PORT}`));
