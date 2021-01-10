const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage, generateSystemMessage} = require('./utils/messages')
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users')
const { readvSync } = require('fs')
const app = express()
const port = process.env.PORT || 3001
const server = http.createServer(app) //this usually happens implicitly but we need the explicit call to get access to the raw http variable
const io = socketio(server) // we use the raw http variable in order to enable server side web sockets
const public_directory_path = path.join(__dirname, '../public')

app.use(express.static(public_directory_path))

let count = 0

// connection is the name of the event - on is an event listener
io.on('connection', (socket)=> {
    
    // socket.emit('count', count)
    // socket.on('increment', () => {
    //     count++
    //     //socket.emit('count', count) we want to rather emit to every single connection and not just a single one
    //     io.emit('count', count) //emits to the server / every connection
    // })

    socket.on('sendMessage', (msg, F)=> {
        const filter = new Filter()
        console.log(socket.id)
        const {user, error} = getUser(socket.id)

        if (filter.isProfane(msg)) {
            return F('No cussing allowed!')
        }

        io.to(user.room).emit('sendMessage', generateMessage(user.username, msg))
        F()
    })

    socket.on('location', (lat, long, F) => {
        const return_string = `https://google.com/maps?q=${lat},${long}`
        const {user, error} = getUser(socket.id)
        
        io.to(user.room).emit('locationMessage', generateMessage(user.username, return_string))
        F('Success')
    })


    socket.on('disconnect', ()=>{
        const {user, error} = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('sendMessage', generateSystemMessage(`${user.username} has left!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })

    socket.on('join', ({username, room}, F) => {
        // user.js functionality
        console.log(username, room)
        
        const {error, user} = addUser({id: socket.id, username, room})
        if (error) return F(error)
        
        socket.join(user.room)
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        

         //only available on server-side - gives us access to room specific methods - so only members of this room will receive and send messages to each other
        socket.emit('sendMessage', generateSystemMessage('Welcome!'))
        socket.broadcast.to(user.room).emit('sendMessage', generateSystemMessage(`${user.username} has joined!`))
        
        F()
    })
})

// we call listen on the server instead of the app
server.listen(port, () => { 
    console.log(`Server is up on port ${port}`)
})