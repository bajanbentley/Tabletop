var app = angular.module('views');

app.controller('loginController', function($scope, $http, $location, loginAuth, userInfo) {
  $scope.navbarTemplate = './templates/navbar_nologged.htm';

  $scope.$on('$locationChangeSuccess', function() {
    $scope.navbarTemplate = (loginAuth.getLogged() || localStorage.getItem('id_token') != null) ? './templates/navbar_logged.htm' : './templates/navbar_nologged.htm' ;
  });

  $scope.onLoginSubmit = function() {
      const user = {
        username: this.username,
        password: this.password,
      }

      $http.post('users/auth', user, {headers: {'Content-type': 'application/json'}})
      .then(
      function successCallback(data) {
        if(data.data.success) {
          $scope.storeUserData(data.data.token, data.data.user);
          $scope.getProfile();
          loginAuth.setLogged(true);
          $location.path('/games');
        }
        else document.getElementById("message").innerHTML = "Username or password is incorrect";
      },
      function errorCallback(err) {
        document.getElementById("message").innerHTML = "An error occurred while trying to login. Please try again later."
      });

      $scope.storeUserData = function(token, user) {
        localStorage.setItem('id_token', token);
        localStorage.setItem('user', JSON.stringify(user));
        userInfo.setUserWithToken(token, user);
      }

  };

  $scope.logout = function() {
    userInfo.clearUser();
    localStorage.clear();
    loginAuth.setLogged(false);
    $location.path('/login');
  }

  $scope.getProfile = function() {
    //console.log(userInfo.loadToken());
    $http.get('users/profile', {headers: {'Authorization': userInfo.loadToken()}})
    .then(
    function successCallback(data) {
        userInfo.setUserProfile(data.data.user);
    },
    function errorCallback(err) {
        console.log("Unable to get user information.")
    });
  }

});
