const generateSystemMessage = (text) => {
    return {
        text,
        createdAt: new Date().getTime()
    }
}

const generateMessage = (username, text) => {
    return {
        username,
        text,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateSystemMessage,
    generateMessage
}