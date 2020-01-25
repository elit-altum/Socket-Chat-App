// Function for storing and validating user

const users = [];

// For adding a user
const addUser = ({ id, username, room }) => {
    // Clean the data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // Validate the data
    if (!username || !room) {
        return {
            error: 'Username and room are required!'
        }
    }

    // Check for an existing user
    const existingUser = users.find( user => {
        return user.username === username && user.room === room;
    });

    if (existingUser) {
        return {
            error: 'Username is taken'
        }
    }

    // Adding the new user
    const user = { id, username, room };
    users.push(user);
    return { user };
}

// For removing a user by id
const removeUser = (id) => {

    const deletedIndex = users.findIndex( user => user.id === id); 

    // Splice returns the deleted users in the form of an array
    return users.splice(deletedIndex, 1)[0];    // returns the deleted user object
}

// For getting a user by id
const getUser = (id) => {
    const found = users.find( user => user.id === id );
    return found;
}

// For getting all users in a room
const getUsersInRoom = (room) => {

    room = room.trim().toLowerCase();
    const roomUsers = users.filter( user => user.room === room );
    return roomUsers;
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}