angular.module('chatapp')
.controller('appCtrl', function ($scope, $rootScope, $timeout, $state, login, chats) {

  $scope.signout = function () {
    login.signout()
  }

  $scope.chats = []
  chats.getChatList(function (list) {
    $scope.chats = list
    $rootScope.$on('createdChat', function (e, newChat) {
      $timeout(function () {
        $scope.chats.push(newChat)
      })
    })
  })
})
