var app = angular.module('views');

app.controller('profileController', function($scope, userInfo) {

  $scope.getUsername = function() {
    return userInfo.getUsername();
  }

  $scope.getEmail = function() {
    return userInfo.getEmail();
  }

  $scope.getWins = function() {
    return userInfo.getWins();
  }

  $scope.getLoses = function() {
    return userInfo.getLoses();
  }

  $scope.getName = function() {
    return userInfo.getName();
  }

});
