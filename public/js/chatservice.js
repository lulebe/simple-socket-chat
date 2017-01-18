angular.module('chatapp')
.factory('chat', function ($http, $window, $rootScope) {

  function createChat(partnername, cb) {
    $http.get($window.location.origin + '/user/search?q=' + partnername)
    .then(function (res) {
      if (!res.data)
        return cb(null)
      $http.post($window.location.origin + '/chat', {partners: [res.data._id]})
      .then(function (res) {
        cb(res.data)
        $rootScope.$emit('createdChat', res.data)
      }, function () {
        cb(null)
      })
    }, function () {
      cb(null)
    })
  }

  function getChat (chatid, cb) {
    $http.get($window.location.origin + '/chat/' + chatid)
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
    createChat, createChat,
    getChat: getChat,
    sendMessage: sendMessage
  }
})
