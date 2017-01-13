const socket = require('socket.io')
const socketAuth = require('socketio-auth')
const jwt = require('jsonwebtoken')

const config = require('./config.json')

const userSockets = {}
const socketUsers = {}

function addSocketForUser (username, socket) {
  console.log("add socket for", username)
  if (!userSockets[username])
    userSockets[username] = []
  userSockets[username].push(socket)
  socketUsers[socket] = username
}

function removeSocket (socket) {
  const username = socketUsers[socket]
  if (!username)
    return
  const uSockets = userSockets[username]
  uSockets.splice(uSockets.indexOf(socket), 1)
  delete socketUsers[socket]
}

function sendToUser (username, eventname, data) {
  const uSockets = userSockets[username]
  if (!uSockets)
    return
  console.log("send to user:")
  console.log(username, eventname, data)
  uSockets.forEach(socket => {
    console.log("found socket")
  })
}

function init (httpServer) {
  const socketServer = socket().listen(httpServer)

  //authentication
  socketAuth(socketServer, {
    authenticate: (socket, data, cb) => {
      jwt.verify(data, config.jwt_secret, (err, decoded) => {
        if (err || !decoded.username) {
          cb(err, false)
          return
        }
        addSocketForUser (decoded.username, socket)
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
