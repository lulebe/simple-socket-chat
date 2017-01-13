angular.module('chatapp')
.controller('appCtrl', function ($scope, $rootScope, $state, login, chats) {

  $scope.signout = function () {
    login.signout()
  }

  $scope.chats = []
  chats.getChatList(function (list) {
    $scope.chats = list.map(function (chat) {
      chat.partner = chat.userA == login.getUsername() ? chat.userB : chat.userA
      return chat
    })
    $rootScope.$on('createdChat', function (e, chat) {
      chat.partner = chat.userA == login.getUsername() ? chat.userB : chat.userA
      console.log(chat.partner)
      $scope.chats.push(chat)
    })
  })
})
