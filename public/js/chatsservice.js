angular.module('chatapp')
.factory('chats', function ($http, $window) {

  function getChatList (cb) {
    $http.get($window.location.origin + '/chat')
    .then(function (res) {
      cb(res.data)
    }, function () {
      cb([])
    })
  }

  return {
    getChatList: getChatList
  }
})
