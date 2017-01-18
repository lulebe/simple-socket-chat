angular.module('chatapp')
.controller('appChatCtrl', function ($scope, $rootScope, $stateParams, $state, $timeout, login, chat) {

  $scope.messageInput = ''
  $scope.chat = null

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
    chat.messages = chat.messages.map(function(message) {
      return addUsernameToMsg(message, chat.members)
    })
    if (!chat.groupName && chat.members.length === 2)
      chat.groupName = 'Chat with ' + chat.members.map(function(mem) {
        return mem.name
      }).filter(function(name) {
        return name !== login.getUsername()
      })[0]
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
    matches = members.filter(function (member) {
      return member._id === msg.by
    })
    if (matches.length !== 1)
      return msg
    msg.username = matches[0].name
    return msg
  }

})
