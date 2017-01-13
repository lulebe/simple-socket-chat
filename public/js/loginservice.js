angular.module('chatapp')
.factory('login', function ($window, $http, $state, socket) {

  function signin (username, password) {
    $http.post($window.location.origin + '/user/login', {
      username: username,
      password: password
    }).then(function (res) {
      $window.sessionStorage.authToken = res.data
      $window.sessionStorage.username = username
      socket.openSocket()
      $state.go('app.newChat')
    }, function (res) {
      //TODO handle signin error
    })
  }

  function signout () {
    $window.sessionStorage.removeItem('authToken')
    $window.sessionStorage.removeItem('username')
    socket.closeSocket()
    $state.go('index')
  }

  function signup (username, password) {
    console.log(username, password)
    $http.post($window.location.origin + '/user', {
      username: username,
      password: password
    }).then(function (res) {
      $window.sessionStorage.authToken = res.data
      $window.sessionStorage.username = username
      socket.openSocket()
      $state.go('app.newChat')
    }, function (res) {
      //TODO handle signup error
    })
  }

  function getUsername () {
    return $window.sessionStorage.username
  }

  return {
    signin: signin,
    signout: signout,
    signup: signup,
    getUsername: getUsername
  }
})
