const socket = require('socket.io')
const socketAuth = require('socketio-auth')
const jwt = require('jsonwebtoken')

const config = require('./config')

const userSockets = {}
const socketUsers = {}

function addSocketForUser (userId, socket) {
  if (!userSockets[userId])
    userSockets[userId] = []
  userSockets[userId].push(socket)
  socketUsers[socket] = userId
}

function removeSocket (socket) {
  const userId = socketUsers[socket]
  if (!userId)
    return
  const uSockets = userSockets[userId]
  uSockets.splice(uSockets.indexOf(socket), 1)
  delete socketUsers[socket]
}

function sendToUser (userId, eventname, data) {
  const uSockets = userSockets[userId]
  if (!uSockets)
    return
  uSockets.forEach(socket => {
    socket.emit(eventname, data)
  })
}

function init (httpServer) {
  const socketServer = socket().listen(httpServer)

  //authentication
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

  //standard socket code
  socketServer.on('connection', socket => {
    socket.on('disconnect', () => {
      removeSocket(socket)
    })
  })
}

module.exports = {init: init, sendToUser: sendToUser}
