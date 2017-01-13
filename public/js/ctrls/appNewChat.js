angular.module('chatapp')
.controller('appNewChatCtrl', function ($scope, $state) {
  $scope.createChat = function () {
    $state.go('app.chat', {username: $scope.partner})
  }
})
