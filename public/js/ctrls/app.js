angular.module('chatapp')
.controller('appCtrl', function ($scope, $rootScope, $timeout, $state, login, chats) {

  $scope.signout = function () {
    login.signout()
  }

  $scope.chats = []
  chats.getChatList(function (list) {
    $scope.chats = list.map(chat => addMemberNamesToChat(chat))
    $rootScope.$on('createdChat', function (e, newChat) {
      $timeout(function () {
        console.log(newChat)
        $scope.chats.push(addMemberNamesToChat(newChat))
      })
    })
  })

  function addMemberNamesToChat(chat) {
    var names = chat.members.map(mem => mem.name)
    if (names.length === 2)
      names = names.filter(name => name !== login.getUsername())
    return Object.assign({}, chat, {memberNames: names.join(', ')})
  }

})
