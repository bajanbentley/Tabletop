var app = angular.module('views');
app.controller('sneksndladderGameController', function($scope, userInfo, $location, loginAuth) {
  var ANIMATION_SPEED = 5;                                //FACTOR OF 200!!!
  var scene, camera, renderer, render;
  var currentPlayer;
  var table, playerOne;
  var currentAnimation = function(){};
  var ACTION_TILES = {
    2:38, 7:14, 8:31, 15:26, 16:6, 21:42, 28:84, 36:44, 46:25, 49:11, 51:67, 62:19, 64:60, 71:91, 74:53, 78:98, 87:94, 89:68,
    92:88, 95:75, 99:80
  };

  var GRID_COORDS = {
    900:1, 700:1, 500:1, 300:1, 100:1
  };

  var GRID_DIR_UP = {
    10:1, 20:1, 30:1, 40:1, 50:1, 60:1, 70:1, 80:1, 90:1
  };

  var GRID_DIR_LEFT = {
    11:1, 31:1, 51:1, 71:1, 91:1
  };

  var GRID_DIR_RIGHT = {
    21:1, 41:1, 61:1, 81:1
  };
  /************************************************************************************************
  *                                   Main
  *************************************************************************************************/
  window.onLoad = initScene(LoadGame);
  function main(){
    currentPlayer;
    currentPlayer = playerOne;
    moveForward(1, CheckTile);
  }

  //check win in here
  function DoneMoving(){
    //console.log("done moving");
    //moveForward(currentPlayer, 1, CheckTile);
    console.log("Done Moving, CurrentGrid: "+currentPlayer.currentGrid + " Dir: "+currentPlayer.direction);
    //moveForward(6, CheckTile);
  }

  function CheckTile(){
    currentAnimation = function(){};
    //check ladder or snake
    if(ACTION_TILES.hasOwnProperty(currentPlayer.currentGrid)){
      //console.log("Ladder or Snake");
      FollowPath(DoneMoving);
    }
    else DoneMoving();
  }

  function FollowPath(Callback){
    var targetGrid = ACTION_TILES[""+currentPlayer.currentGrid];

    var newPos = GetNewPos(targetGrid);
    currentPlayer.position.x = newPos.x;
    currentPlayer.position.z = newPos.z;
    currentPlayer.justMovedUp = newPos.justMovedUp;
    currentPlayer.currentGrid = targetGrid;
    currentPlayer.nextGrid = targetGrid;
    currentPlayer.direction = newPos.direction;
    console.log("Followed Path, CurrentGrid: "+currentPlayer.currentGrid);
    Callback();
  }

  function GetNewPos(target){
    var newPos = {};
    newPos.x = currentPlayer.position.x;
    newPos.z = currentPlayer.position.z;
    newPos.direction = currentPlayer.direction;
    newPos.justMovedUp = false;

    if(target == 38) {newPos.x = -500; newPos.z = 300; newPos.direction="Left";}
    else if(target == 14) {newPos.x = 300; newPos.z = 700; newPos.direction="Left";}
    else if(target == 31) {newPos.x = 900; newPos.z = 300; newPos.direction="Left"; newPos.justMovedUp = true;}
    else if(target == 26) {newPos.x = 100; newPos.z = 500; newPos.direction="Right";}
    else if(target == 6) {newPos.x = 100; newPos.z = 900; newPos.direction="Right";}
    else if(target == 42) {newPos.x = -700; newPos.z = 100; newPos.direction="Right";}
    else if(target == 84) {newPos.x = -300; newPos.z = -700; newPos.direction="Right";}
    else if(target == 44) {newPos.x = -300; newPos.z = 100; newPos.direction="Right";}
    else if(target == 25) {newPos.x = -100; newPos.z = 500; newPos.direction="Right";}
    else if(target == 11) {newPos.x = 900; newPos.z = 700; newPos.direction="Left"; newPos.justMovedUp = true;}
    else if(target == 67) {newPos.x = 300; newPos.z = -300; newPos.direction="Right";}
    else if(target == 19) {newPos.x = -700; newPos.z = 700; newPos.direction="Up";}
    else if(target == 60) {newPos.x = -900; newPos.z = -100; newPos.direction="Up";}

    return newPos;
  }


  /************************************************************************************************
  *                                   Main END
  *************************************************************************************************/

  function initScene(Callback){
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 10000 );

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.getElementById("snl").appendChild( renderer.domElement );

    window.addEventListener( 'resize', onWindowResize, false );
    function onWindowResize(){
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize( window.innerWidth, window.innerHeight );
    }

    render = function () {
			requestAnimationFrame( render );
      currentAnimation();
			renderer.render(scene, camera);
		};

			render();
      Callback();
  }

  function LoadGame(Callback){
    camera.position.y = 2000;
    camera.position.z = 0;
    camera.lookAt(new THREE.Vector3(0,0,0));
    var loadingManager = new THREE.LoadingManager();
    var tableLoader = new THREE.TextureLoader(loadingManager);
    tableLoader.load('images/snlBoard.jpg', LoadTable);
    playerOne = LoadPiece();
    scene.add(playerOne);

    function LoadTable(texture){
      var geometry = new THREE.BoxGeometry( 2000, 50, 2000 );
      var material = new THREE.MeshBasicMaterial( { map: texture } );

      table = new THREE.Mesh( geometry, material );
      table.position.y = 0;
      table.position.x = 0;
      table.position.z = 0;
      table.name = "table";
      scene.add( table );
    }

    function LoadPiece(){
      var geometry = new THREE.BoxGeometry( 1, 1, 1 );
			var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
			var cube = new THREE.Mesh( geometry, material );
      cube.position.x = -900;
      cube.position.y = 20;
      cube.position.z = 900;
      cube.currentGrid = 1;
      cube.nextGrid = 1;
      cube.direction = "Right";
      cube.justMovedUp = false;
      cube.scale.set(75,75,75);
      return cube;
    }

    loadingManager.onLoad = main();
  }

  function moveForward(steps, Callback){
    var nextGrid = currentPlayer.currentGrid + steps;
    currentPlayer.nextGrid = nextGrid;

    currentAnimation = function(){
      if(currentPlayer.direction == "Right"){
        var nextPos = currentPlayer.position.x + ANIMATION_SPEED;
        if(GRID_COORDS.hasOwnProperty(""+Math.abs(nextPos))){
          currentPlayer.currentGrid++;
          if(GRID_DIR_UP.hasOwnProperty(""+currentPlayer.currentGrid) && !currentPlayer.justMovedUp){
            currentPlayer.direction = "Up";
            console.log("CurrentGrid: "+currentPlayer.currentGrid+", redirecting Up");
          }
          if(currentPlayer.currentGrid == currentPlayer.nextGrid){
            currentAnimation = function(){};
            Callback();
            return;
          }
          //console.log("reset justMovedUp");
          if(currentPlayer.justMovedUp) currentPlayer.justMovedUp = false;
        }
        moveAlong(ANIMATION_SPEED,0,0);
      }
      else if(currentPlayer.direction == "Left"){
        var nextPos = currentPlayer.position.x - ANIMATION_SPEED;
        if(GRID_COORDS.hasOwnProperty(""+Math.abs(nextPos))){
          currentPlayer.currentGrid++;
          if(GRID_DIR_UP.hasOwnProperty(""+currentPlayer.currentGrid) && !currentPlayer.justMovedUp){
            currentPlayer.direction = "Up";
            console.log("redirecting Up");
          }
          if(currentPlayer.currentGrid == currentPlayer.nextGrid){
            currentAnimation = function(){};
            Callback();
            return;
          }
          //console.log("reset justMovedUp");
          if(currentPlayer.justMovedUp) currentPlayer.justMovedUp = false;
        }
        moveAlong(-ANIMATION_SPEED,0,0);
      }
      else if(currentPlayer.direction == "Up"){
        var nextPos = currentPlayer.position.z - ANIMATION_SPEED;
        if(GRID_COORDS.hasOwnProperty(""+Math.abs(nextPos))){
          currentPlayer.currentGrid++;
          //console.log("Up: "+currentPlayer.currentGrid);
          if(GRID_DIR_LEFT.hasOwnProperty(""+currentPlayer.currentGrid)){
            console.log("redirecting left");
            currentPlayer.direction = "Left";
            currentPlayer.justMovedUp = true;
          }
          else if(GRID_DIR_RIGHT.hasOwnProperty(""+currentPlayer.currentGrid)){
            console.log("redirecting right");
            currentPlayer.direction = "Right";
            currentPlayer.justMovedUp = true;
          }
          if(currentPlayer.currentGrid == currentPlayer.nextGrid){
            currentAnimation = function(){};
            Callback();
            return;
          }
        }
        moveAlong(0,0,-ANIMATION_SPEED);
      }


      function moveAlong(x,y,z){
        currentPlayer.position.x += x;
        currentPlayer.position.y += y;
        currentPlayer.position.z += z;
      }
    }
  }
});
