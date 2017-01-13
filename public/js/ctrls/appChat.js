angular.module('chatapp')
.controller('appChatCtrl', function ($scope, $rootScope, $stateParams, $state, $timeout, chat) {

  $scope.sendMessage = function () {
    chat.sendMessage($stateParams.username, $scope.messageInput, function (msg) {
      if (msg == null) return
      $scope.chat.messages.push(msg)
    })
  }

  $scope.partner = $stateParams.username

  chat.getChat($stateParams.username, function (chat) {
    if (chat == null) {
      $state.go('app.newChat')
      return
    }
    $scope.chat = chat
    $rootScope.$on('newMessage', function (e, data) {
      console.log(data)
      if (data.chatWith == $stateParams.username) {
        console.log("match")
        $timeout(function () {
          $scope.chat.messages.push(data.message)
        })
      }
    })
  })

})
