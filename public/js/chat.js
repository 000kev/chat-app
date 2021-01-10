const socket = io()
const msg_form = document.querySelector('#message-form')
const $msg_form_button = msg_form.querySelector('#button')
const $messages = document.querySelector('#messages')
const geo = document.querySelector('#send-location')

const search = document.querySelector('input')
const m1 = document.querySelector('#m1')
const m2 = document.querySelector('#m2')

//Templates - Mustache
const messageTemplate = document.querySelector('#message-template').innerHTML // we need the html stored inside our object
const locationTemplate = document.querySelector('#location-template')
const sidebarTemplate = document.querySelector('#sidebar-template')

//Options - QueryString
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoscroll = () => {
    // new message element
    const $newMessage = $messages.lastElementChild
    
    //height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = $messages.offsetHeight
    //height of messages container
    const conentHeight = $messages.scrollHeight

    //how far have i scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (conentHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $message.scrollHeight
    }
}

socket.emit('join', {username, room}, (error) => {
    if (error) {
        alert(error)
        location.href='./'
    }
})

socket.on('sendMessage', (msg)=> {
   
    const html = Mustache.render(messageTemplate, {
        username: msg.username,
        message: msg.text,
        createdAt: moment(msg.createdAt).format('HH:mm') //momentjs.org
    })
    $messages.insertAdjacentHTML('beforeend', html)
})

socket.on('locationMessage', (message)=> {
    console.log(message.text)
    const html = Mustache.render(locationTemplate.innerHTML, {
        username: message.username,
        location: message.text,
        createdAt: moment(message.createdAt).format('HH:mm')
    })
    $messages.insertAdjacentHTML('beforeend', html)
})

socket.on('roomData', ({room, users})=> {
    const html = Mustache.render(sidebarTemplate.innerHTML, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})
// socket.on('count', (count)=> {
//     console.log('Count updated', count)
// })

// document.querySelector('#increment').addEventListener('click', ()=>{
//     console.log('Clicked')
//     // socket.emit('increment')
// })



msg_form.addEventListener('submit', (event)=> {
    event.preventDefault()
    //$msg_form_button.setAttribute('disabled', 'disabled')

    const msg = event.target.elements.message.value

    // acknowledgement callback
    socket.emit('sendMessage', msg, (error)=> {
        //$msg_form_button.removeAttribute('disabled')
        search.value=''
        search.focus()

        if (error) {
            return console.log(error)
        }
        console.log('Message delivered')
    })

})

geo.addEventListener('click', () => {
    if (!navigator.geolocation) return alert('Geolocation is not supported by your browser!')
    geo.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude
        const long = position.coords.longitude

        // acknowledgement callback
        socket.emit('location', lat, long, (e)=> {
            console.log('Test', e)
            console.log('Location shared')
            geo.removeAttribute('disabled')
        })
    })
})

// socket.on('send-location', (pos)=>{
//     m2.textContent=pos
//     console.log(pos)
// })

