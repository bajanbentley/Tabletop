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
      templateUrl : "templates/login.htm"
    })
    .when("/register", {
      templateUrl : "templates/register.htm"
    })
    .when("/profile", {
      templateUrl : "templates/profile.htm"
    })
    .when("/four", {
      templateUrl : "templates/four.htm"
    })
    .when("/games", {
      templateUrl : "templates/games.htm"
    });
});

/*************************************************
Controllers
*************************************************/
app.controller('register', function($scope, $http, $timeout, $location, $timeout) {
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

app.controller('login', function($scope, $http, $location, loginAuth, userInfo) {
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

app.controller('profile', function($scope, userInfo) {

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

app.controller('games', function($scope, $location) {
  $scope.changeTo = function() {
    //$location.path("/four");
  }
});

app.controller('four', function($scope) {
  var initScene = function() {
    var scene, camera, renderer;
    var geometry, material, mesh, table;

    init();
    animate();

    function init() {

    	scene = new THREE.Scene();
      var loader = new THREE.TextureLoader();

    	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
    	camera.position.z = 1000;

      loader.load('images/wood4.png', function ( texture ) {
        geometry = new THREE.BoxGeometry( 1000, 50, 1000 );
        material = new THREE.MeshBasicMaterial( { map: texture } );

        table = new THREE.Mesh( geometry, material );
        scene.add( table );
      });

      geometry = new THREE.BoxGeometry( 200, 200, 200 );
    	material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );

    	mesh = new THREE.Mesh( geometry, material );
    	scene.add( mesh );

    	renderer = new THREE.WebGLRenderer();
    	renderer.setSize( window.innerWidth, window.innerHeight );

    	document.getElementById("four").appendChild( renderer.domElement );

    }

    function animate() {

    	requestAnimationFrame( animate );

      table.position.y = 0;
      mesh.position.y = 5;
    	mesh.rotation.x += 0.01;
    	mesh.rotation.y += 0.02;

    	renderer.render( scene, camera );

    }
  }

  window.onload = initScene();
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
