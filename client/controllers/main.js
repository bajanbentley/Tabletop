var app = angular.module("views", ["ngRoute"]);
/**************************
Routing
***************************/

app.config(function($routeProvider) {
    $routeProvider
    .when("/", {
      templateUrl : "templates/main.htm"
    })
    .when("/home", {
      templateUrl : "templates/main.htm"
    })
    .when("/login", {
      templateUrl : "templates/login.htm",
      controller : "loginController"
    })
    .when("/register", {
      templateUrl : "templates/register.htm",
      controller : "registerController"
    })
    .when("/profile", {
      templateUrl : "templates/profile.htm",
      controller : "profileController"
    })
    .when("/war", {
      templateUrl : "templates/war.htm",
      controller:  'warCardGameController'
    })
    .when("/games", {
      templateUrl : "templates/games.htm",
      controller : "gamesController"
    });
});

/*************************************************
Services
*************************************************/

app.service('loginAuth', function() {
  this.logged = false;

  this.setLogged = function(isLogged) {
    this.logged = isLogged;
  }

  this.getLogged = function() {
    return this.logged;
  }

});

app.service('userInfo', function() {
  this.authToken = null;
  this.user = null;

  this.setUserWithToken = function(token, user) {
    this.authToken = token;
    this.user = user;
  }

  this.clearUser = function() {
    this.authToken = null;
    this.user = null;
  }

  this.loadToken = function() {
    const token = localStorage.getItem('id_token');
    this.authToken = token;
    return this.authToken;
  }

  this.setUserProfile = function(user) {
    this.user = user;
  }

  this.getUsername = function() {
    this.reloadProfile();
    //console.log(this.user);
    return this.user.username;
  }

  this.getEmail = function() {
    this.reloadProfile();
    return this.user.email;
  }

  this.getWins = function() {
    this.reloadProfile();
    return this.user.wins;
  }

  this.getLoses = function() {
    this.reloadProfile();
    return this.user.loses;
  }

  this.getName = function() {
    this.reloadProfile();
    return this.user.name;
  }

  this.reloadProfile = function() {
    if(localStorage.getItem('user') != null && this.user == null) {
      this.setUserWithToken(localStorage.getItem('id_token'), JSON.parse(localStorage.getItem('user')));
    }
  }
});
