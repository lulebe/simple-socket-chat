angular.module('chatapp')
.controller('appCtrl', function ($scope, $rootScope, $timeout, $state, login, chats) {

  $scope.signout = function () {
    login.signout()
  }

  $scope.chats = []
  chats.getChatList(function (list) {
    $scope.chats = list.map(function (chat) {
      chat.partner = chat.userA == login.getUsername() ? chat.userB : chat.userA
      return chat
    })
    $rootScope.$on('createdChat', function (e, newChat) {
      var existing = $scope.chats.filter(function(chat) {
        return chat.userA == newChat.userA && chat.userB == newChat.userB
      }).length
      if (existing) return
      newChat.partner = newChat.userA == login.getUsername() ? newChat.userB : newChat.userA
      $timeout(function () {
        $scope.chats.push(newChat)
      })
    })
  })
})
