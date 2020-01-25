const path = require('path');
const http = require('http');

const express = require('express');
const socketio = require('socket.io');

const { generateMessage, generateLocationMessage } = require('../src/utils/message');
const { addUser, removeUser, getUser, getUsersInRoom } = require('../src/utils/users');

const app = express();

// creates a new http server for express app
const server = http.createServer(app);

// now io accesses the web socket based http server
// adds web sockets to the existing http server
const io = socketio(server);

// add listener on the server for any new web socket connection
io.on('connection', (socket) => {

    // Creating and adding users to a room
    socket.on('join', ({ username, room }, callback) => {
        const { error, user } = addUser({id: socket.id, username, room});

        if (error || !user) {
            return callback(error);
        }

        socket.join(user.room); // makes a subset of the server for all clients in this room only

        // Sends a welcome message to the client on the new room  
        socket.emit('message', generateMessage({id: 1, username: 'Admin'},'Welcome to the app!'));

        // Tells every client (in the 'room' only) except the connected one that a new user has joined
        socket.broadcast.to(user.room).emit('message', generateMessage({id: 1, username: 'Admin'}, `${user.username} has joined!`));

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback();
    })

    // Listens for any client trying to send a new message
    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);

        if (!user) {
            alert('Invalid operation');
            return;
        }

        io.to(user.room).emit('message', generateMessage(user, message));       
        // indicates success to the emitter
        callback();
    });

    // Listens for any client trying to send his location
    socket.on('sendLocation', (position, callback) => {
        const locationUrl = `https://google.com/maps?q=${position.lat},${position.long}`;
        const user = getUser(socket.id);

        if (!user) {
            alert('Invalid operation');
            return;
        }

        io.to(user.room).emit('locationMessage', generateLocationMessage(user, locationUrl));
        callback();
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if (user) {
            socket.broadcast.to(user.room).emit('message', generateMessage({id: 1, username: 'Admin'}, `${user.username} has disconnected`));
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }

    });

});

const port = process.env.PORT || 3000;
const assetsPath = path.join(__dirname, '..', 'public');

app.use(express.static(assetsPath));

// the server runs on the port 
server.listen(port, () => {
    console.log('Server is on port:', port);
});