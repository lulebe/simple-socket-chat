const socket = require('socket.io')
const socketAuth = require('socketio-auth')
const jwt = require('jsonwebtoken')

const config = require('./config')

//socket storage
const userSockets = {}
const socketUsers = {}

//insert socket for specified user
function addSocketForUser (userId, socket) {
  if (!userSockets[userId])
    userSockets[userId] = []
  userSockets[userId].push(socket)
  socketUsers[socket] = userId
}

//delete specified socket from storage
function removeSocket (socket) {
  const userId = socketUsers[socket]
  if (!userId)
    return
  const uSockets = userSockets[userId]
  uSockets.splice(uSockets.indexOf(socket), 1)
  delete socketUsers[socket]
}

//send data to all sockets of specified user
function sendToUser (userId, eventname, data) {
  const uSockets = userSockets[userId]
  if (!uSockets)
    return
  uSockets.forEach(socket => {
    socket.emit(eventname, data)
  })
}

//init socket.io
function init (httpServer) {
  const socketServer = socket().listen(httpServer)

  //socket user authentication
  socketAuth(socketServer, {
    authenticate: (socket, data, cb) => {
      jwt.verify(data, config.jwtSecret, (err, decoded) => {
        if (err || !decoded.userId) {
          cb(err, false)
          return
        }
        addSocketForUser (decoded.userId, socket)
        cb(null, true)
      })
    }
  })

  //handle socket disconnect
  socketServer.on('connection', socket => {
    socket.on('disconnect', () => {
      removeSocket(socket)
    })
  })
}

module.exports = {init: init, sendToUser: sendToUser}
