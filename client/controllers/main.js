var app = angular.module("views", ["ngRoute"]);

app.config(function($routeProvider) {
    $routeProvider
    .when("/", {
      templateUrl : "templates/main.htm"
    })
    .when("/home", {
      templateUrl : "templates/main.htm"
    })
    .when("/login", {
      templateUrl : "templates/login.htm"
    })
    .when("/register", {
      templateUrl : "templates/register.htm"
    });
});

app.controller('register', function($scope) {
  $scope.onRegisterSubmit = function() {
    if(this.password != this.confirmPass) { alert("Passwords do not match"); return false; }
    const user = {
      name: this.name,
      email: this.email,
      username: this.username,
      password: this.password
    }
  };
});
