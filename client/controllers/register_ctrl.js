var app = angular.module('views');

app.controller('registerController', function($scope, $http, $timeout, $location, $timeout) {
  $scope.onRegisterSubmit = function() {
    if(this.password != this.confirmPass) { document.getElementById("message").innerHTML = "Passwords do not match."; return false; }
    const user = {
      name: this.name,
      email: this.email,
      username: this.username,
      password: this.password,
    }

    $http.post('users/register', user, {headers: {'Content-type': 'application/json'}})
    .then(
      function successCallback(data) {
        if(data.data.success == false) { document.getElementById("message").innerHTML = "Username/Email already in use."; return;}
        document.getElementById("message").innerHTML = "Registration successful! You will be redirected to the login page in 3 seconds."
        $timeout(function() {
          $location.path('/login');
        }, 3000);
      },
      function errorCallback(err) {
        document.getElementById("message").innerHTML = "An error occurred while trying to create the account. Please try again later."
      }
    );

  };
});
