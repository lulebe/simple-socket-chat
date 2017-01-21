angular.module('chatapp')
.factory('chat', function ($http, $window, $rootScope) {

  function createChat(partnerids, groupName, cb) {
    $http.post($window.location.origin + '/chat', {partners: partnerids, groupName: groupName})
    .then(function (res) {
      cb(res.data)
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

  function sendMessage (chatid, message, cb) {
    $http.post($window.location.origin + '/chat/' + chatid + '/message', {message: message})
    .then(function (res) {
      cb(res.data)
    }, function () {
      cb(null)
    })
  }

  function sendImage (chatid, image, cb) {
    console.log(image)
    var fd = new FormData()
    fd.append('image', image)
    $http.post($window.location.origin + '/chat/' + chatid + '/message', fd, {
      headers: {'Content-Type': undefined },
      transformRequest: angular.identity
    })
    .then(function (res) {
      cb(res.data)
    }, function () {
      cb(null)
    })
  }

  return {
    createChat, createChat,
    getChat: getChat,
    sendMessage: sendMessage,
    sendImage: sendImage
  }
})
