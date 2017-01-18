angular.module('chatapp')
.controller('appChatCtrl', function ($scope, $rootScope, $stateParams, $state, $timeout, login, chat) {

  $scope.sendMessage = function () {
    chat.sendMessage($stateParams.chatid, $scope.messageInput, function (msg) {
      if (msg == null) return
      $scope.messageInput = ""
    })
  }

  chat.getChat($stateParams.chatid, function (chat) {
    if (chat == null) {
      $state.go('app.newChat')
      return
    }
    chat.messages = chat.messages.map(message => addUsernameToMsg(message, chat.members))
    if (!chat.groupName && chat.members.length === 2)
      chat.groupName = 'Chat with ' + chat.members.map(mem => mem.name).filter(name => name !== login.getUsername())[0]
    $scope.chat = chat
    $rootScope.$on('newMessage', function (e, data) {
      if (data.chatid == $stateParams.chatid) {
        $timeout(function () {
          $scope.chat.messages.push(addUsernameToMsg(data.message, chat.members))
        })
      }
    })
  })

  function addUsernameToMsg(msg, members) {
    matches = members.filter(member => member._id === msg.by)
    if (matches.length !== 1)
      return msg
    return Object.assign({}, msg, {username: matches[0].name})
  }

})
