angular.module('chatapp')
.controller('appChatCtrl', function ($scope, $rootScope, $stateParams, $state, $timeout, chat) {

  $scope.sendMessage = function () {
    chat.sendMessage($stateParams.chatid, $scope.messageInput, function (msg) {
      if (msg == null) return
      $scope.chat.messages.push(msg)
      $scope.messageInput = ""
    })
  }

  chat.getChat($stateParams.chatid, function (chat) {
    if (chat == null) {
      $state.go('app.newChat')
      return
    }
    $scope.chat = chat
    $rootScope.$on('newMessage', function (e, data) {
      if (data.chatid == $stateParams.chatid) {
        $timeout(function () {
          $scope.chat.messages.push(data.message)
        })
      }
    })
  })

})
