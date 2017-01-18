angular.module('chatapp')
.factory('user', function ($http, $window, $rootScope) {

  function searchUser (username, cb) {
    $http.get($window.location.origin + '/user/search?q=' + username)
    .then(function (res) {
      cb(res.data)
    }, function () {
      cb(null)
    })
  }

  return {
    searchUser: searchUser
  }
})
