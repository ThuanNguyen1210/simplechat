// scroll message to the lastest one
const messagesDiv = document.querySelector('.chat-messages');
messagesDiv.scrollTop = messagesDiv.scrollHeight;

// Get username and room from URL
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const socket = io();

socket.emit('joinRoom', { username, room });

socket.on('roomUsers', ({ room, users }) => {
	outputRoomName(room);
	outputUsers(users);
});

socket.on('message', (message) => {
	console.log(message);
	outputMessage(message);
});

const chatForm = document.querySelector('#chat-form');
chatForm.addEventListener('submit', (e) => {
	e.preventDefault();
	const text = e.target.elements.msg.value;
	socket.emit('chatMessage', text);
	e.target.elements.msg.value = '';
});

function outputMessage(message) {
	const div = document.createElement('div');
	div.classList.add('message');
	div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
      ${message.text}
    </p>`;
	messagesDiv.appendChild(div);
	messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function outputRoomName(room) {
	roomDiv = document.querySelector('#room-name');
	roomDiv.innerHTML = room;
}

function outputUsers(users) {
	usersDiv = document.querySelector('#users');
	usersDiv.innerHTML = `
		${users.map((user) => `<li>${user.username}</li>`).join('')}
	`;
}
