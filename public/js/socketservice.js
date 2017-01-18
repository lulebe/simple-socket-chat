angular.module('chatapp')
.factory('socket', function ($window, $rootScope, $window) {

  var socket = null

  function openSocket (authToken) {
    if (socket != null)
      closeSocket()
    var token = authToken
    if (!token)
      return false
    socket = io.connect($window.location.origin)
    socket.on('connect', function () {
      socket.emit('authentication', token)
      socket.on('authenticated', function () {
        socket.on('createdChat', function (data) {
          $rootScope.$emit('createdChat', data)
        })
        socket.on('newMessage', function (data) {
          $rootScope.$emit('newMessage', data)
        })
        socket.on('messageUpdate', function (data) {
          $rootScope.$emit('messageUpdate', data)
        })
      })
    })
  }

  function closeSocket () {
    if (socket == null) return
    socket.disconnect()
    socket = null
  }

  return {
    openSocket: openSocket,
    closeSocket: closeSocket
  }
})
