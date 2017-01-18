angular.module('chatapp')
.controller('appCtrl', function ($scope, $rootScope, $timeout, $state, login, chats) {

  $scope.signout = function () {
    login.signout()
  }

  $scope.chats = []
  chats.getChatList(function (list) {
    $scope.chats = list.map(function (chat) {
      return addMemberNamesToChat(chat)
    })
    $rootScope.$on('createdChat', function (e, newChat) {
      $timeout(function () {
        $scope.chats.push(addMemberNamesToChat(newChat))
      })
    })
  })

  function addMemberNamesToChat(chat) {
    var names = chat.members.map(function(mem) {
      return mem.name
    })
    if (names.length === 2)
      names = names.filter(function(name) {
        return name !== login.getUsername()
      })
    chat.memberNames = names.join(', ')
    return chat
  }

})
