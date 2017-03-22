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

app.controller('register', function($scope, $http, $timeout, $location, $timeout) {
  $scope.onRegisterSubmit = function() {
    if(this.password != this.confirmPass) { alert("Passwords do not match"); return false; }
    const user = {
      name: this.name,
      email: this.email,
      username: this.username,
      password: this.password,
      wins: 3,
      loses: 3
    }

    $http.post('http://localhost:3000/users/register', user, {'Content-type': 'application/json'})
    .then(
      function successCallback() {
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

app.controller('login', function($scope, $http, $location, loginAuth) {
  $scope.onLoginSubmit = function() {
      const user = {
        username: this.username,
        password: this.password,
      }

      $http.post('http://localhost:3000/users/auth', user, {'Content-type': 'application/json'})
      .then(
      function successCallback(data) {
        if(data.data.success) {
          loginAuth.test();
          $scope.storeUserData(data.data.token, data.data.user);
          $location.path('/home');
        }
        else document.getElementById("message").innerHTML = "Username or password is incorrect";
      },
      function errorCallback(err) {
        document.getElementById("message").innerHTML = "An error occurred while trying to login. Please try again later."
      });

      $scope.storeUserData = function(token, user) {
        localStorage.setItem('id_token', token);
        localStorage.setItem('user', JSON.stringify(user));
        this.authToken = token;
        this.user = user;
      }

  };


});

app.service('loginAuth', function() {
  this.test = function() {
    console.log("test");
  }
});
