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
    .when("/games", {
      templateUrl : "templates/games.htm"
    })
    .when("/stacks", {
      templateUrl : "templates/stacks.htm"
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

app.controller('stacks', function($scope, $route, $location) { //


  var initScene, initEventHandling, render, renderer, scene, camera, box, table, table_material, block_material, light, blocks = [];

  initScene = function() {

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize( window.innerWidth, window.innerHeight );
      document.getElementById( 'viewport' ).appendChild( renderer.domElement );

      scene = new Physijs.Scene;
      renderer.shadowMap.enabled = true;
      renderer.shadowMapSoft = true;

      camera = new THREE.PerspectiveCamera(
          35,
          window.innerWidth / window.innerHeight,
          1,
          1000
      );
      camera.position.set( 30, 35, 30 );
      camera.lookAt( scene.position );
      scene.add( camera );

      light = new THREE.DirectionalLight( 0xFFFFFF );
  		light.position.set( 20, 30, -5 );
  		light.castShadow = true;
  		light.shadowCameraLeft = -30;
  		light.shadowCameraTop = -30;
  		light.shadowCameraRight = 30;
  		light.shadowCameraBottom = 30;
  		light.shadowCameraNear = 1;
  		light.shadowCameraFar = 200;
  		//light.shadowMapWidth = light.shadowMapHeight = 2048;
  		light.shadowDarkness = .5;
  		scene.add( light );


      // Loader
  		loader = new THREE.TextureLoader();

      table_material = Physijs.createMaterial(
          new THREE.MeshBasicMaterial({ map: loader.load( 'images/wood4.png' ) }),
          0.9,
          0.1
      );
      table_material.map.wrapS = table_material.map.wrapT = THREE.RepeatWrapping;
      table_material.map.repeat.set( 5, 5 );

      block_material = Physijs.createMaterial(
        new THREE.MeshBasicMaterial({ map: loader.load( 'images/wood3.png' ) }),
        .4, // medium friction
        .4 // medium restitution
      );
      block_material.map.wrapS = block_material.map.wrapT = THREE.RepeatWrapping;
      block_material.map.repeat.set( 1, .5 );

      // Table
      table = new Physijs.BoxMesh(
        new THREE.BoxGeometry(100, 1, 100),
        table_material,
        0, // mass
        { restitution: .2, friction: .8 }
      );
      table.position.y = -5;
      table.receiveShadow = true;
      scene.add( table );

      // Box
      /*box = new Physijs.BoxMesh(
          new THREE.CubeGeometry( 5, 5, 5 ),
          block_material
      );
      box.castShadow = true;
      scene.add( box );*/

      createBlocks();

      initEventHandling();

      requestAnimationFrame( render );
  };

  render = function() {
      scene.simulate(); // run physics
      renderer.render( scene, camera); // render the scene
      requestAnimationFrame( render );
  };

  initEventHandling = function() {
    var mouseDown, vect, raycaster;
    raycaster = new THREE.Raycaster();
    vect = new THREE.Vector3;

    mouseDown = function(event) {
      vect.x = (event.clientX / window.innerWidth) * 2 - 1;
      vect.y = -(event.clientY / window.innerHeight) * 2 + 1;
      vect.z = 1;

      /*raycaster.setFromCamera(vect, camera);
      var intersects = raycaster.intersectObjects(scene.children);
      var box2 = new Physijs.BoxMesh(
          new THREE.CubeGeometry( 5, 5, 5 ),
          block_material
      );
      box2.position.y = 7;
      box2.castShadow = true;
      box2.receiveShadow = true;
      scene.add( box2 );*/
      //for ( var i = 0; i < intersects.length; i++ ) {
        //intersects[ 0 ].object.material.color.set( 0xff0000 );

      //}

    }

    window.addEventListener('mousedown', mouseDown);
  }

  createBlocks = function() {
    var cube_geometry = new THREE.CubeGeometry(7, 1, 2);
    var newBlock;
    var height = 0;

    var i, j;
    for( i=0; i < 2; i++) {
      for( j=0; j < 3; j++) {
        newBlock = new Physijs.BoxMesh(
          cube_geometry,
          block_material
        );
        newBlock.position.y = height;
        if(i%2 == 1) {
          newBlock.rotation.y = Math.PI/2; //90 degrees since threejs uses radians
          if(j == 0) newBlock.position.x = 2.5;
          else if(j == 1) newBlock.position.x = 0;
          else {newBlock.position.x = -2.5; newBlock.position.z = 2.5; }
        }
        if(j == 0) newBlock.position.z = -2.5;
        else if(j == 1) newBlock.position.z = 0;
        else newBlock.position.z = 2.5;
        newBlock.castShadow = true;
        newBlock.receiveShadow = true;
        scene.add(newBlock);
        blocks.push(newBlock);
      }
      height += 1;
    }
  }

  window.onload = initScene();

});

app.controller('games', function($scope, $location) {
  $scope.changeToJenga = function() {
    $location.path('/stacks');
  }
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
