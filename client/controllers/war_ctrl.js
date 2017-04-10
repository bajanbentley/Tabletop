var app = angular.module('views');
app.controller('warCardGameController', function($scope, userInfo, $location, loginAuth) {
  /********************************************************************
  *                          Global Variables
  ********************************************************************/
  var scene, camera, renderer, render;
  var loadingManager, myDeckLoader, tableLoader;
  var table, card, topCard;
  var cards = [], AIcards = [];
  var x, o;
  var loadedResources = false;
  var cardStack = 0, AIcardstack = 0;;
  var score = document.getElementById("score");
  var loadingScreen = {
    scene: new THREE.Scene(),
    camera: new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000),
  };

  /************************************
  *           Check login
  **************************************/
  $scope.navbarTemplate = './templates/navbar_nologged.htm';

  var testLogged = (loginAuth.getLogged() || localStorage.getItem('id_token') != null) ? true : false ;
  if(!testLogged) { // test for logged in
    $location.path('/login');
  }

  score.innerHTML = "Click your pile to start!";

  /********************************************************************
  *                            Function Calls
  ********************************************************************/
  window.onload = initScene();
  //add loaders
  loadingManager = new THREE.LoadingManager();
  myDeckLoader = new THREE.TextureLoader(loadingManager);
  tableLoader = new THREE.TextureLoader(loadingManager);
  //load code
  tableLoader.load('images/wood4.png', loadTable);
  createDeck();
  //shuffleDeck();

  //Make o and x piece for loading screen
  x = xPiece();
  o = oPiece();

  //Set loading Screen
  setLoadingScreen();

  //Clicking
  userMouseClicks();

  //on load done

  loadingManager.onLoad = doneLoading;
  render = renderFunction();
  //render();
  /********************************************************************
  *                            Functions
  ********************************************************************/

  //creates scene, camera, and renderer
  function initScene(){
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.y = 1500;
    camera.position.z = 1500;
    camera.lookAt(new THREE.Vector3(0,0,0));

		renderer = new THREE.WebGLRenderer();
		renderer.setSize( window.innerWidth, window.innerHeight );
    document.getElementById("war").appendChild( renderer.domElement );

    //function that allows the screen to be resized.
    window.addEventListener( 'resize', onWindowResize, false );
    function onWindowResize(){
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize( window.innerWidth, window.innerHeight );
    }
  }

  function renderFunction(){
    if(!loadedResources) {
      requestAnimationFrame( renderFunction );

      loadingScreen.x.rotation.y += 0.05;
      loadingScreen.o.rotation.x += 0.05;
      loadingScreen.x.position.y = Math.sin(loadingScreen.x.rotation.y);
      loadingScreen.o.position.y = -Math.sin(loadingScreen.x.rotation.y);

      renderer.render( loadingScreen.scene, loadingScreen.camera );
      return;
    }
    requestAnimationFrame(renderFunction);
    renderer.render(scene, camera);
  }

  //calls once finished loading scene
  function doneLoading(){
    //console.log("done loading");
    loadedResources = true;
    //topCard = cards.pop().name;
    //console.log("top card is:"+ topCard)
    shuffleDeck();
    addCardsToScene();
  }

  //loads table
  function loadTable(texture){
    var geometry = new THREE.BoxGeometry( 2000, 50, 2000 );
    var material = new THREE.MeshBasicMaterial( { map: texture } );

    table = new THREE.Mesh( geometry, material );
    table.position.y = -200;
    table.name = "awesome";
    scene.add( table );
  }

  function createDeck(){
    var i = 0;
    var nextCard = 0;
    var heightIncrements = 0;

    myDeckLoader.load('images/cardback.png', function ( cardBack ) {
      cardback = new THREE.MeshBasicMaterial( { map: cardBack } );
      for (i = 0; i < 52; i++) {
        //this var x is weird...
        var x = 0;
        nextCard = i+1;
          myDeckLoader.load('images/' + nextCard + '.png', function ( face ) {
            material = new THREE.MeshBasicMaterial( { map: face } );
            var materials = [
              new THREE.MeshBasicMaterial( { color: 0xffffff } ), // right
              new THREE.MeshBasicMaterial( { color: 0xffffff } ), // left
              cardback, // top
              material, // bottom
              new THREE.MeshBasicMaterial( { color: 0xffffff } ), // back
              new THREE.MeshBasicMaterial( { color: 0xffffff } )  // front
            ]
            var cubeSidesMaterial = new THREE.MultiMaterial( materials );
            var cubeGeometry = new THREE.BoxBufferGeometry( 300, 1, 400, 1, 1, 1 );
            var newCard = new THREE.Mesh( cubeGeometry, cubeSidesMaterial );
            newCard.position.y = heightIncrements;
            newCard.position.x = 600;
            newCard.position.z = 700;
            heightIncrements += 2;

            x = x + 1;
            //console.log(x);
            newCard.name = "card"+x;
            newCard.value = Math.floor(x/4.05); // has to be 4.05, dont change
            cards.push(newCard);
          }); // end card loads

      }
    }); //end cardback load

  }

  /*********************************
  *     Set Loading Screen
  **********************************/
  function setLoadingScreen() {
    loadingScreen.x = x;
    loadingScreen.o = o;

    loadingScreen.camera.position.z = 5;
    loadingScreen.x.position.set(-1,0,0);
    loadingScreen.o.position.set(1,0,0);
    loadingScreen.scene.add(loadingScreen.x);
    loadingScreen.scene.add(loadingScreen.o);
  }

  /**********************
  *       X piece
  ************************/
  function xPiece() {
    var group = new THREE.Group();
    var geometry2 = new THREE.BoxGeometry( 0.25, 1, 0.1 );
    var material2 = new THREE.MeshBasicMaterial( { color: 0xffffff } );

    var xproto1 = new THREE.Mesh( geometry2, material2 );
    group.add( xproto1 );
    var xproto2 = new THREE.Mesh( geometry2, material2 );
    group.add( xproto2 );
    xproto1.rotation.z = 180;
    xproto2.rotation.z = -180;
    return group;
  }

  /****************************
  *       O piece
  ****************************/
  function oPiece() {
    var geometry2 = new THREE.RingGeometry( 0.25, 0.5, 32 );
    var material2 = new THREE.MeshBasicMaterial( { color: 0xffffff, side: THREE.DoubleSide } );
    var mesh2 = new THREE.Mesh( geometry2, material2 );
    return mesh2;
  }

  /*********************************
  *       USER MOUSE Clicking
  *********************************/
  function userMouseClicks() {
    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2(), INTERSECTED;
    document.addEventListener('mousedown', function(event) {
      // calculate mouse position in normalized device coordinates
      // (-1 to +1) for both components
      mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
      mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
      mouse.y += 0.1; //accounts for navbar height
        checkforObject();
    });

    function checkforObject() {
      var poppedAICard = null;
      // update the picking ray with the camera and mouse position
      raycaster.setFromCamera( mouse, camera );
      // calculate objects intersecting the picking ray
      var intersects = raycaster.intersectObjects( cards );
      if ( intersects.length > 0 ) {
          cards.pop();
          intersects[0].object.rotation.x += Math.PI;
          intersects[0].object.position.x = 0;
          intersects[0].object.position.y = cardStack;
          cardStack += 2;
          poppedAICard = AIcards.pop();
          poppedAICard.rotation.x += Math.PI;
          poppedAICard.position.x = 0;
          poppedAICard.position.y = AIcardstack;
          AIcardstack += 2;
          if(poppedAICard.value > intersects[0].object.value) { //Checl for AI win
            //AIcardstack += 2;
            score.innerHTML = "AI wins the round!"
          }
          else if (intersects[0].object.value > poppedAICard.value) //Check human win
            score.innerHTML = "Player wins the round!"
          else { //Draw
            score.innerHTML = "Draw!"
          }
      }
      else
      {
        console.log("Notouch");
      } //end intersect check
    } // end checkForObject
  } //end checking for mouse click

  /*******************
  * shuffleDeck
  *********************/
  function shuffleDeck() {
    var tempCard;
    var card1;
    var card2;
    var i;

    for(i = 0; i < 200; i++) {
      card1 = Math.floor(Math.random() * 52);
      card2 = Math.floor(Math.random() * 52);

      tempCard = cards[card1];
      cards[card1] = cards[card2];
      cards[card2] = tempCard;
    }

  } //end shuffle

  function addCardsToScene() {
    var i = 0;
    var heights = 0;
    var heightsOtherPlayer = 0;

    for(i = 0; i  < cards.length; i++) {
      if(i < 26) {
        cards[i].position.y = heights;
        scene.add(cards[i]);
        heights += 2;
      }
      else {
        cards[i].position.y = heightsOtherPlayer;
        cards[i].position.x = -600;
        cards[i].position.z = -400;
        AIcards[heightsOtherPlayer/2] = cards[i];
        scene.add(AIcards[heightsOtherPlayer/2]);
        heightsOtherPlayer += 2;
      }
    }
  } //end add cards to scene

});
