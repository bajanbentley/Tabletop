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
