angular.module('chatapp')
.factory('socket', function ($window, $rootScope) {

  var socket = null

  function openSocket () {
    if (socket != null)
      closeSocket()
    var token = $window.sessionStorage.authToken
    if (!token)
      return false
    socket = io.connect($window.location.origin)
    socket.on('connect', function () {
      console.log("authenticate")
      socket.emit('authentication', token)
      socket.on('authenticated', function () {
        console.log("authenticated")
        socket.on('createdChat', function (data) {
          console.log(data)
          $rootScope.$emit('createdChat', data)
        })
        socket.on('newMessage', function (data) {
          console.log(data)
          $rootScope.$emit('newMessage', data)
        })
        socket.on('messageUpdate', function (data) {
          console.log(data)
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
