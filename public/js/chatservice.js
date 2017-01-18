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
