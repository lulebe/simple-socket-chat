angular.module('chatapp')
.controller('indexCtrl', function ($scope, $rootScope, login) {
  $scope.signin = function () {
    login.signin($scope.username, $scope.password)
  }
  $scope.signup = function () {
    login.signup($scope.username, $scope.password)
  }
})
