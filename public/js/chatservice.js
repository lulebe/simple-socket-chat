angular.module('chatapp')
.factory('chat', function ($http, $window) {

  function getChat (partnername, cb) {
    $http.get($window.location.origin + '/chat/' + partnername)
    .then(function (res) {
      cb(res.data)
    }, function () {
      cb(null)
    })
  }

  function sendMessage (partnername, message, cb) {
    $http.post($window.location.origin + '/chat/' + partnername + '/message', {message: message})
    .then(function (res) {
      cb(res.data)
    }, function () {
      cb(null)
    })
  }

  return {
    getChat: getChat,
    sendMessage: sendMessage
  }
})
