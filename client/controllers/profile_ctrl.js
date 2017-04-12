var app = angular.module('views');

app.controller('profileController', function($scope, userInfo, $http) {

  userInfo.clearUser();
  $http.get('users/profile', {headers: {'Authorization': userInfo.loadToken()}})
  .then(
  function successCallback(data) {
      userInfo.setUserProfile(data.data.user);
  },
  function errorCallback(err) {
      console.log("Unable to get user information.")
  });

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
