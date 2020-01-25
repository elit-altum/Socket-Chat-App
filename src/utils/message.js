// Utility functions for the chat app

// function for creating a standard message object
const generateMessage = (user, text) => {
    return {
        id: user.id,
        username: user.username,
        text,
        createdAt: new Date().getTime()
    }
}

// function for creating a location message object
const generateLocationMessage = (user, url) => {
    return {
        id: user.id,
        username: user.username,
        url,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}