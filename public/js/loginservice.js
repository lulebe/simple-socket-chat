angular.module('chatapp')
.factory('login', function ($window, $injector, socket) {

  var currentUsername = null
  var currentToken = null

  function signin (username, password) {
    $injector.get('$http').post($window.location.origin + '/user/login', {
      username: username,
      password: password
    }).then(function (res) {
      currentToken = res.data
      currentUsername = username
      socket.openSocket(currentToken)
      $injector.get('$state').go('app.newChat')
    }, function (res) {
      //TODO handle signin error
    })
  }

  function signout () {
    currentToken = null
    currentUsername = null
    socket.closeSocket()
    $injector.get('$state').go('index')
  }

  function signup (username, password) {
    $injector.get('$http').post($window.location.origin + '/user', {
      username: username,
      password: password
    }).then(function (res) {
      currentToken = res.data
      currentUsername = username
      socket.openSocket(currentToken)
      $injector.get('$state').go('app.newChat')
    }, function (res) {
      //TODO handle signup error
    })
  }

  function getToken () {
    return currentToken
  }

  function getUsername () {
    return currentUsername
  }

  return {
    signin: signin,
    signout: signout,
    signup: signup,
    getToken: getToken,
    getUsername: getUsername
  }
})
