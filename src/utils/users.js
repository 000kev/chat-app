const users = []

// addUser, removeUser, getUser, getUsersInRoom

const addUser = ({id, username, room}) => {
    // clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // validate data
    if (!username || !room) return new Error('Username and room are required!')

    // check for existing user
    const existing_user = users.find((user)=> {
        return user.room === room && user.username === username
    })
    // validate username
    if (existing_user) return new Error('Username is in use!')

    // store user
    const user = {id, username, room}
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex((user) =>{
        return user.id === id
    })

    if (index!==-1) return {user: users.splice(index, 1)[0], error: undefined}
    else return {user: undefined, error: 'No user found'}
}

const getUser = (id) => {

    const index = users.findIndex((user) => {
        return user.id === id
    })
    console.log(users[index])
    if (index!==-1) return {user: users[index], error: undefined}
    else return {user: undefined, error: 'No user found'}
}

const getUsersInRoom = (room) => {
    const usersInRoom = []
    users.map((user) => {
        if(user.room === room) usersInRoom.push(user)
    })

    return usersInRoom
}


module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}