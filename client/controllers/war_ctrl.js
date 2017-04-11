var app = angular.module('views');
app.controller('warCardGameController', function($scope, userInfo, $location, loginAuth) {
  /********************************************************************
  *                          Global Variables
  ********************************************************************/
  var scene, camera, renderer, render;
  var loadingManager, myDeckLoader, tableLoader;
  var table, card, topCard;
  var cards = [], AIcards = [], humanCards = [], drawArray = [];
  var x, o;
  var loadedResources = false;
  var playerScore = 0, AIscore = 0, turns = 26, counter =0;
  var score = document.getElementById("score");
  var poppedAICard = null, poppedPlayerCard = null;
  var checkMovedCard = true, continueAnimate = true;
  var loadingScreen = {
    scene: new THREE.Scene(),
    camera: new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000),
  };
  var gameWon = false;

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
  *      This keeps the text on the page from being selected
  ********************************************************************/
  if (typeof document.onselectstart!="undefined") {
    document.onselectstart=new Function ("return false");
  }
  else{
    document.onmousedown=new Function ("return false");
    document.onmouseup=new Function ("return true");
  }
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

  var Animations = function(){};
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
    Animations();
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
      if(gameWon) return;
      // update the picking ray with the camera and mouse position
      raycaster.setFromCamera( mouse, camera );
      // calculate objects intersecting the picking ray
      var intersects = raycaster.intersectObjects( cards );
      if ( intersects.length > 0 && intersects[0].object.player=="Drawable" && checkMovedCard) {
          poppedPlayerCard = humanCards.pop();
          //console.log("Intersected: "+intersects[0].object.name+" Popped:"+ poppedPlayerCard.name);
          poppedAICard = AIcards.pop();
          poppedPlayerCard.player="Drawn";
          continueAnimate = true;
          counter++;
          Animations = function(){
            //if game is a draw
            if(poppedPlayerCard.position.x == 0 || continueAnimate == false){
              console.log("nomorethough");
              Animations = function(){};
            }
            else if (counter==1 && continueAnimate==true){
              console.log(counter);
              poppedPlayerCard.position.x  -= 5;
              if(poppedPlayerCard.position.x <= 200){
                poppedPlayerCard.position.x = 200;
              }

              if (poppedPlayerCard.position.y > 0){
                poppedPlayerCard.position.y -= 1;
              }
              if (poppedPlayerCard.rotation.x < Math.PI ){
                poppedPlayerCard.rotation.x += 0.15;
              }
              if (poppedPlayerCard.rotation.x >= Math.PI){
                poppedPlayerCard.rotation.x = Math.PI + 0.15;
              }
              poppedAICard.position.x  += 5;
              if(poppedAICard.position.x >= -200){
                poppedAICard.position.x = -200;
              }

              if (poppedAICard.position.y > 0){
                poppedAICard.position.y -= 1;
              }
              if (poppedAICard.rotation.x < Math.PI){
                poppedAICard.rotation.x += 0.15;
              }
              if (poppedAICard.rotation.x >= Math.PI ){
                poppedAICard.rotation.x = Math.PI + 0.15;
              }


              poppedAICard.position.z += 5;
              if(poppedAICard.position.z >= 150){
                poppedAICard.position.z = 150;
              }

              poppedPlayerCard.position.z -= 5;
              if(poppedPlayerCard.position.z <= 150){
                poppedPlayerCard.position.z = 150;
              }
              //console.log(poppedPlayerCard.value);
              //console.log(poppedAICard.value);
            }
            else{
              poppedPlayerCard.position.x  -= 10;

              if (poppedPlayerCard.position.y > 0){
                poppedPlayerCard.position.y -= 1;
              }
              if (poppedPlayerCard.rotation.x < Math.PI && poppedPlayerCard.position.x < 300){
                poppedPlayerCard.rotation.x += 0.15;
              }
              if (poppedPlayerCard.rotation.x >= Math.PI){
                poppedPlayerCard.rotation.x = Math.PI;
              }

              poppedAICard.position.x  += 10;
              if(poppedAICard.position.x >= 0){
                poppedAICard.position.x = 0;
              }

              if (poppedAICard.position.y > 0){
                poppedAICard.position.y -= 1;
              }
              if (poppedAICard.rotation.x < Math.PI && poppedAICard.position.x > -300){
                poppedAICard.rotation.x += 0.15;
              }
              if (poppedAICard.rotation.x >= Math.PI){
                poppedAICard.rotation.x = Math.PI + 0.15;
              }
            }
            //if check animations done

          }
          console.log(drawArray.length);

          checkMovedCard = false;
          if (counter == 1){
            score.innerHTML = "Draw! Play again to win the stash!";
            checkIfGameWon();
            setTimeout(whenGameDraw, 4000);

          }
          else if(poppedAICard.value > poppedPlayerCard.value) { //Check for AI win    WORKING
            score.innerHTML = "AI wins the round!";
            //setTimeout(moveCardToAIStack, 4000);
            setTimeout(moveCardToAIStack, 3000);
            if(drawArray.length > 0){
              checkIfGameWon();
              setTimeout(whenGameDraw, 4000);
            }
            //sleep(1000);
          }
          else if (poppedPlayerCard.value >= poppedAICard.value) //Check human win NOT WORKING
          {
            /**********************
            Need to do
            player win so add both cards to the bottom of player pile
            ******************************/
            score.innerHTML = "Player wins the round!";
            setTimeout(moveCardToPlayerStack, 3000);
            if(drawArray.length > 0){
              checkIfGameWon();
              setTimeout(whenGameDraw, 4000);
            }
          }
          else { //Draw
            score.innerHTML = "Draw! Play again to win the stash!";
            //setTimeout(moveCardToPlayerStack, 100);
            //convertThisinto a function:
            //pushes first set:
            checkIfGameWon();
            setTimeout(whenGameDraw, 4000);
          }
      }
      else
      {
        console.log( intersects[0].object.position.x);
      } //end intersect check
    } // end checkForObject
  } //end checking for mouse click

  /*******************
  * Game draw function
  *********************/
  function whenGameDraw() {
    if(gameWon==false){
      counter++;
      continueAnimate = false;
      drawArray.push(poppedPlayerCard);
      drawArray.push(poppedAICard);
      var j = 0;
      for(j = 0; j <= 1; j++ ){
        checkIfGameWon();
        if(gameWon==true){
          break;
        }
        function pushingtoDraw(){
          newlypoppedPlayerCard = humanCards.pop();
          newlypoppedAICard = AIcards.pop();
          newlypoppedPlayerCard.position.x = -500;
          newlypoppedAICard.position.x = 500;
          drawArray.push(newlypoppedPlayerCard);
          drawArray.push(newlypoppedAICard);
        }
        pushingtoDraw();
      }
      checkMovedCard = true;
      checkIfGameWon();
    }

  } //end whenGameDraw

  /*******************
  * return the cards to the deck
  *********************/
  function ifDrawWon() {
    score.innerHTML = "Player wins the round!";
    console.log("Initial size: "+drawArray.length);
    var runTimes = drawArray.length;
    for(j = 0; j < runTimes; j++ ){
      moveCardToPlayerStackFromDraw(drawArray.pop());

    }

    console.log("Cards AI left: "+AIcards.length);
    console.log("Cards player left: "+humanCards.length);
    var z = AIcards.length+humanCards.length;
    console.log("Total: "+z);

  } //end shuffle
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
        cards[i].player = "Drawable";
        humanCards.push(cards[i]);
        scene.add(cards[i]);
        heights += 2;
      }
      else {
        cards[i].position.y = heightsOtherPlayer;
        cards[i].position.x = -600;
        cards[i].position.z = -400;
        cards[i].player = "AIDrawable";
        AIcards.push(cards[i]);
        scene.add(cards[i]);
        heightsOtherPlayer += 2;
      }
    }
  } //end add cards to scene

  function sleep(miliseconds) {
   var currentTime = new Date().getTime();
   while (currentTime + miliseconds >= new Date().getTime()) {
   }
 }

 function claimToAIStack(){

 }

 function moveCardToAIStack() {
   //claimToAIStack();
   AIcards.unshift(poppedAICard);
   AIcards.unshift(poppedPlayerCard);
   poppedAICard.position.x = -600;
   poppedAICard.position.z = -400;
   poppedAICard.player = "AIDrawable";
   poppedPlayerCard.position.y = 0;
   poppedPlayerCard.position.x = -600;
   poppedPlayerCard.position.z = -400;
   poppedPlayerCard.player = "AIDrawable";
   poppedAICard.position.y = 2;

   var newHeight = 0;
   function restack(){
     for(var i = 0; i<AIcards.length; i++){
       AIcards[i].position.y = newHeight;
       newHeight+=2;
     }
   }
   restack();

   poppedAICard.rotation.x = 0;
   poppedPlayerCard.rotation.x = 0;
   console.log("Cards AI left: "+AIcards.length);
   console.log("Cards player left: "+humanCards.length);
   var z = AIcards.length+humanCards.length;
   console.log("Total: "+z);
   checkMovedCard = true;
   resetText();
   checkIfGameWon();
 }

 function claimToPlayerStack(){

 }

function moveCardToPlayerStackFromDraw(drawncard){
  humanCards.unshift(drawncard);
  drawncard.position.x = 600;
  drawncard.position.y = 2;
  drawncard.position.z = 700;
  drawncard.player = "Drawable";
  var newHeight = 0;
  function restack(){
    for(var i = 0; i<humanCards.length; i++){
      humanCards[i].position.y = newHeight;
      newHeight+=2;
    }
  }
  restack();
  drawncard.rotation.x = 0;
  checkMovedCard = true;
  resetText();
  checkIfGameWon();
}

 function moveCardToPlayerStack() {
   //claimToPlayerStack();
  humanCards.unshift(poppedAICard);
  humanCards.unshift(poppedPlayerCard);
   poppedPlayerCard.position.x = 600;
   poppedPlayerCard.position.y = 2;
   poppedPlayerCard.position.z = 700;
   poppedPlayerCard.player = "Drawable";
   poppedAICard.position.x = 600;
   poppedAICard.position.y = 0;
   poppedAICard.position.z = 700;
   poppedAICard.player = "Drawable";

   var newHeight = 0;
   function restack(){
     for(var i = 0; i<humanCards.length; i++){
       humanCards[i].position.y = newHeight;
       newHeight+=2;
       humanCards[i].player = "Drawable";
     }
   }
   restack();
   poppedAICard.rotation.x = 0;
   poppedPlayerCard.rotation.x = 0;
   checkMovedCard = true;
   resetText();
   checkIfGameWon();
 }

 function resetText(){
   score.innerHTML = "";
 }

 function checkIfGameWon(){
   if(AIcards.length == 0){
     console.log("AI LOST");
     score.innerHTML = "YOU WON THE GAME!";
     gameWon = true;
   }
   else if(humanCards.length == 0){
     console.log("Player Lost");
     score.innerHTML = "YOU LOST THE GAME!";
     gameWon = true;
   }
 }
});
