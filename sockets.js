const socket = require('socket.io')
const socketAuth = require('socketio-auth')


module.exports = function (httpServer) {
  const socketServer = socket().listen(httpServer)

}
