angular.module('chatapp')
.controller('appNewChatCtrl', function ($scope, $state, login, user, chat) {

  $scope.users = []
  $scope.groupName = ''

  $scope.addUser = function () {
    user.searchUser($scope.partner, function (user) {
      $scope.partner = ''
      if (user && user.name !== login.getUsername())
        $scope.users.push(user)
    })
  }

  $scope.createChat = function () {
    if ($scope.users.length === 0)
      return
    chat.createChat(
      $scope.users.map(function(user) {
        return user._id
      }),
      $scope.groupName.length > 0 ? $scope.groupName : null,
      function (chat) {
        if (chat)
          $state.go('app.chat', {chatid: chat._id})
      }
    )
  }
})
