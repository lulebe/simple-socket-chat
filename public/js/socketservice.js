angular.module('chatapp')
.factory('socket', function ($window, $rootScope) {

  function openSocket () {
    var token = $window.sessionStorage.authToken
    if (!token)
      return false
    var socket = io.connect($window.location.origin)
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

  return {
    openSocket: openSocket
  }
})
