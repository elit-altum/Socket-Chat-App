// single fn to indicate we want to connect with a web socket
const socket = io();

// DOM elements
const $messageForm = document.querySelector('#form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormSubmit = $messageForm.querySelector('button');

const $locationButton = document.querySelector('#location');

const $messages = document.querySelector('#messages');
const $sidebar = document.querySelector('#sidebar');
const $burger = document.querySelector('#burger');
const $burgerLines = document.querySelectorAll('#burger div');

const messageTemplate = document.querySelector('#message-template-other').innerHTML;
const messageTemplateMine = document.querySelector('#message-template-mine').innerHTML;

const locationTemplate = document.querySelector('#location-template').innerHTML;
const locationTemplateMine = document.querySelector('#location-template-mine').innerHTML;

const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// Parses the attached query strings(location.search) in the page for username and room-name
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

if (!username || !room) {
    // if one tries to use chat without logging in, redirect to home
    location.href = '/';

} else {
    // To make a user join a particular room
    socket.emit('join', { username, room }, (error) => {
        if (error) {
            alert(error);
            location.href = '/';
        }
    });
}

// Autoscrolling for the user
const autoscroll = () => {
    // Stores the new message
    const $newMessage = $messages.lastElementChild;

    // Calulates height of new message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMarginBottom = parseInt(newMessageStyles.marginBottom);
    //final height 
    const newMessageHeight = $newMessage.offsetHeight + newMessageMarginBottom;

    // Visible/viewport height
    const visibleHeight = $messages.offsetHeight;

    // Height of messages container
    const containerHeight = $messages.scrollHeight;

    // How far have I scrolled ?
    const scrollOffset = $messages.scrollTop + visibleHeight;

    // if the user is already at bottom of screen, scroll to display the new message
    if ( (containerHeight - newMessageHeight) <= scrollOffset ) {
        $messages.scrollTop = containerHeight;
    }
    // if not let him stay there

}

// To display a message sent by server
socket.on('message', (message) => {
    if (message.id === socket.id) {
        const html = Mustache.render(messageTemplateMine, {
            username: message.username,
            message: message.text,
            createdAt: moment(message.createdAt).format('h:mm a')
        });
        $messages.insertAdjacentHTML('beforeend', html);
        
    } else {
        const html = Mustache.render(messageTemplate, {
            username: message.username,
            message: message.text,
            createdAt: moment(message.createdAt).format('h:mm a')
        });
        $messages.insertAdjacentHTML('beforeend', html);
    }
    

    autoscroll();
});

// To display a location message sent by server
socket.on('locationMessage', (message) => {

    if (message.id === socket.id) {
        const html = Mustache.render(locationTemplateMine, {
            username: message.username,
            url: message.url,
            createdAt: moment(message.createdAt).format('h:mm a')
        });
        $messages.insertAdjacentHTML('beforeend', html);
        
    } else {
        const html = Mustache.render(locationTemplate, {
            username: message.username,
            url: message.url,
            createdAt: moment(message.createdAt).format('h:mm a')
        });
        $messages.insertAdjacentHTML('beforeend', html);
    }

    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
});

// To display sidebar contents
socket.on('roomData', ({ room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    });
    $sidebar.innerHTML = html;
})

// To send the user's message to the server
$messageForm.addEventListener('submit', (event) => {
    event.preventDefault();

    // disables the button while sending the message
    $messageFormSubmit.setAttribute('disabled', 'disabled');

    const message = event.target.elements.message.value;
    if (!message) {
        alert('Empty message!');
    } else {
        socket.emit('sendMessage', message, () => {
            // renables button if message sent successsfully
            $messageFormSubmit.removeAttribute('disabled');
            event.target.elements.message.value = "";
    
            // sends focus back to input field for faster messaging
            $messageFormInput.focus();
        });
    }    

});

// To send the user's location to the server
$locationButton.addEventListener('click', () => {

    // checks if browser supports HTML geolocation
    if (!navigator.geolocation) {
        return alert('Your browser does not support location.');
    }

    // disables the location button to avoid multiple clicks
    $locationButton.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition( (location) => {

        const position = {
            lat: location.coords.latitude,
            long: location.coords.longitude,
        }
        socket.emit('sendLocation', position, (error) => {
            // re-enables the location button
            $locationButton.removeAttribute('disabled');

            // acknowledgement function
            if (error) {
                return console.log(error)
            }

            console.log('Location shared successfully!');
        });

    });

    

});

// Show and hide nav
$burger.addEventListener('click', () => {

    $burger.classList.toggle('toggle');

    if ($sidebar.style.width === '225px') {
        //close the nav
        $sidebar.style.width = '0px';
        $sidebar.style.transform = 'translateX(-100%)';

    } else {
        $sidebar.style.width = '225px';
        $sidebar.style.transform = 'translateX(0%)';    
    }

})

