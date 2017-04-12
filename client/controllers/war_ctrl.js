var app = angular.module('views');
app.controller('warCardGameController', function($scope, userInfo, $location, loginAuth, $http) {
  /********************************************************************
  *                          Global Variables
  ********************************************************************/
  var scene, camera, renderer, render;
  var loadingManager, myDeckLoader, tableLoader;
  var table, card, topCard;
  var cards = [], AIcards = [], humanCards = [], drawArray = [];
  var x, o;
  var loadedResources = false;
  var playerScore = 0, AIscore = 0, turnLimit = 26, counter =0, isDrawConsecutive = 0,  turns = 0;
  var score = document.getElementById("score");
  var poppedAICard = null, poppedPlayerCard = null;
  var checkMovedCard = true, continueAnimate = true;
  var loadingScreen = {
    scene: new THREE.Scene(),
    camera: new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000),
  };
  var gameWon = false;
  var gameLost = false;
  var GAMESPEED = 3000;
  var bobbing = 1;
  var gameFinished = false;
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
  tableLoader.load('images/retard.png', loadDerp);
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

  //Create an AudioListener and add it to the camera
  var listener = new THREE.AudioListener();
  camera.add( listener );

  // create a global audio source
  var sound = new THREE.Audio( listener );

  var audioLoader = new THREE.AudioLoader();

  //Load a sound and set it as the Audio object's buffer
  audioLoader.load( 'sounds/cardPlace3.wav', function( buffer ) {
    sound.setBuffer( buffer );
    sound.setVolume(0.5);

  });



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




  var Animations = function(){
    if (derp.position.y > 210){
      bobbing = -1;
    }
    else if (derp.position.y < 190){
      bobbing = 1;
    }
  };
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

  function loadDerp(texture){
    var geometry = new THREE.BoxGeometry( 2000, 50, 2000 );
    var material = new THREE.MeshBasicMaterial( { map: texture } );

    derp = new THREE.Mesh( geometry, material );
    derp.position.y = 200;
    derp.position.z = -1800;
    derp.rotation.x = Math.PI/4;
    derp.name = "AI retard";
    scene.add( derp );
  }

  function createDeck(){
    console.log("Version 0.11Derp");
    var i = 0;
    var nextCard = 0;
    var heightIncrements = 0;
    var x = 2;
    var y = 0;
    var z = 2;
    var suite = ["diamond","club","heart","spade"];

    myDeckLoader.load('images/cardback.png', function ( cardBack ) {
      cardback = new THREE.MeshBasicMaterial( { map: cardBack } );
      for (i = 5; i < 57; i++) {
        //this var x is weird...

        nextCard = i;
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
            //console.log(x);
            newCard.name = suite[y] +" of " + z;
            newCard.value = z; // has to be 4.05, dont change
            y+=1;
            x+=1;
            if(y == 4){
              y = 0;
              z += 1;
            }
            //console.log(newCard.name + " : " + newCard.value);
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

  function callSound(){
    sound.play();
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
      //make sure it the card selected is drawable
      if(gameLost==false && gameWon==false){
        gameFinished=false;
      }
      else {
        gameFinished=true;
      }

      if ( intersects.length > 0 && intersects[0].object.player=="Drawable" && checkMovedCard && gameLost==false && gameWon == false) {
          //console.log("Intersected: "+intersects[0].object.name+" Popped:"+ poppedPlayerCard.name);
          setTimeout(callSound,100);
          //PlayerCard
          poppedPlayerCard = humanCards.pop();
          //console.log(poppedPlayerCard.value + "name: " + poppedPlayerCard.name);
          //AIPlayerCard
          poppedAICard = AIcards.pop();
          //console.log(poppedAICard.value + "name: " + poppedAICard.name);
          //makes sure the card is no longer drawable
          poppedPlayerCard.player="Drawn";

          //need this or shit happens, bad shit
          continueAnimate = true;

          Animations = function(){
            //This thing is here to make sure shit doesn't happen, basically kills the animation
            if(poppedPlayerCard.position.x == 0 || continueAnimate == false){
              Animations = function(){
                derp.position.y += bobbing;
                if (derp.position.y > 210){
                  bobbing = -1;
                }
                else if (derp.position.y < 190){
                  bobbing = 1;
                }
              };
            }
            //if game is a draw and we continue to animate
            else if ( poppedPlayerCard.value == poppedAICard.value && continueAnimate==true){
              if (derp.position.y > 210){
                bobbing = -2;
              }
              else if (derp.position.y < 190){
                bobbing = 2;
              }
              //player Positions and rotations:
              //X positions
              poppedPlayerCard.position.x  -= 5;
              if(poppedPlayerCard.position.x <= 200){
                poppedPlayerCard.position.x = 200;
              }
              //X rotations
              if (poppedPlayerCard.rotation.x < Math.PI ){
                poppedPlayerCard.rotation.x += 0.15;
              }
              if (poppedPlayerCard.rotation.x >= Math.PI){
                poppedPlayerCard.rotation.x = Math.PI + 0.15;
              }
              //Y positions
              //This makes sure the y values are okay, (such as Overlappings)
              if (poppedPlayerCard.position.y > isDrawConsecutive*2){
                poppedPlayerCard.position.y -= 1;
              }
              //Z positions
              poppedPlayerCard.position.z -= 5;
              if(poppedPlayerCard.position.z <= 150){
                poppedPlayerCard.position.z = 150;
              }

              //AI positions and rotations
              //X positions
              poppedAICard.position.x  += 5;
              if(poppedAICard.position.x >= -200){
                poppedAICard.position.x = -200;
              }
              //Y positions
              //This makes sure the y values are okay, (such as Overlappings)
              if (poppedAICard.position.y > isDrawConsecutive*2){
                poppedAICard.position.y -= 1;
              }
              //X rotations
              if (poppedAICard.rotation.x < Math.PI){
                poppedAICard.rotation.x += 0.15;
              }
              if (poppedAICard.rotation.x >= Math.PI ){
                poppedAICard.rotation.x = Math.PI + 0.15;
              }
              //Z positions
              poppedAICard.position.z += 5;
              if(poppedAICard.position.z >= 150){
                poppedAICard.position.z = 150;
              }


              //console.log(poppedPlayerCard.value);
              //console.log(poppedAICard.value);
            }
            //This part is for regular animations where draws are not involved.
            else{
              if (derp.position.y > 210){
                bobbing = -1;
              }
              else if (derp.position.y < 190){
                bobbing = 1;
              }
              //player Positions and rotations:
              //X positions
              poppedPlayerCard.position.x  -= 10;
              if(poppedPlayerCard.position.x <= 0){
                poppedPlayerCard.position.x = 0;
              }

              //X rotations
              if (poppedPlayerCard.rotation.x < Math.PI && poppedPlayerCard.position.x < 300){
                poppedPlayerCard.rotation.x += 0.15;
              }
              if (poppedPlayerCard.rotation.x >= Math.PI){
                poppedPlayerCard.rotation.x = Math.PI;
              }

              //Y positions
              if (poppedPlayerCard.position.y > 0){
                poppedPlayerCard.position.y -= 1;
              }

              //AI positions and rotations
              //X positions
              poppedAICard.position.x  += 10;
              if(poppedAICard.position.x >= 0){
                poppedAICard.position.x = 0;
              }

              //X rotations
              if (poppedAICard.rotation.x < Math.PI && poppedAICard.position.x > -300){
                poppedAICard.rotation.x += 0.15;
              }
              if (poppedAICard.rotation.x >= Math.PI){
                poppedAICard.rotation.x = Math.PI + 0.15;
              }

              //Y positions
              if (poppedAICard.position.y > 0){
                poppedAICard.position.y -= 1;
              }
            }
            //if check animations done

          }

          checkMovedCard = false;
          //This was used to make sure drawing kinda works
          /*
          if (counter < 2){
            score.innerHTML = "Draw! Play again to win the stash!";
            checkIfGameWon();
            setTimeout(whenGameDraw, 4000);
            isDrawConsecutive++;

          }
          */
          //else

          if(poppedAICard.value > poppedPlayerCard.value) { //Check for AI win  is  WORKING
            //The draw is no longer consecutive
            isDrawConsecutive = 0;
            score.innerHTML = "AI wins the round!";
            //setTimeout(moveCardToAIStack, 4000);
            setTimeout(moveCardToAIStack, GAMESPEED);

            //Makes sure draw array is not empty
            //Then proceeds to deal with the cards all over the table
            if(drawArray.length > 0){
              checkIfGameWon();
              setTimeout(ifDrawLost, 3200);
            }

            //increment turns
            turns++;
            //sleep(1000);
          }
          else if (poppedPlayerCard.value > poppedAICard.value) //Check human win is also WORKING
          {
            /**********************
            Need to do
            player win so add both cards to the bottom of player pile
            ******************************/
            //The draw is no longer consecutive
            isDrawConsecutive = 0;
            score.innerHTML = "Player wins the round!";
            setTimeout(moveCardToPlayerStack, GAMESPEED);

            //Makes sure draw array is not empty
            //Then proceeds to deal with the cards all over the table
            if(drawArray.length > 0){
              checkIfGameWon();
              setTimeout(ifDrawWon, 3200);
            }

            //increment turns
            turns++;

          }
          else { //Draw
            score.innerHTML = "Draw! Play again to win the stash!";
            checkIfGameWon();
            setTimeout(whenGameDraw, 3000);
          }
      }
      else
      {
        console.log("There is nothing here, go away. Shoo!");
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
      for(j = 0; j <= 3; j++ ){
        checkIfGameWon();
        if(gameWon==true){
          break;
        }
        function pushingtoDraw(){
          newlypoppedPlayerCard = humanCards.pop();
          newlypoppedAICard = AIcards.pop();
          newlypoppedPlayerCard.position.x = -500;
          newlypoppedAICard.position.x = 500;
          newlypoppedPlayerCard.player ="inDrawDeck";
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
  * return the cards to the PLAYER deck
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

  } //end ifDrawWon

  /*******************
  * return the cards to the AI deck
  *********************/
  function ifDrawLost() {
    score.innerHTML = "AI wins the round!";
    //console.log("Initial size: "+drawArray.length);
    var runTimes = drawArray.length;
    for(j = 0; j < runTimes; j++ ){
      moveCardToAIStackFromDraw(drawArray.pop());

    }

    console.log("Cards AI left: "+AIcards.length);
    console.log("Cards player left: "+humanCards.length);
    var z = AIcards.length+humanCards.length;
    console.log("Total: "+z);

  } //end ifDrawWon
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

  /*******************
  * addCardsToScene
  *********************/
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

  /*******************
  * sleep
  *********************/
  function sleep(miliseconds) {
   var currentTime = new Date().getTime();
   while (currentTime + miliseconds >= new Date().getTime()) {
   }
 }

 /*******************
 * Why is this here?
 *********************/
 function claimToAIStack(){

 }

 /*******************
 * Moves regular AI win to AI's stack
 *********************/
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
   /*
   console.log("Cards AI left: "+AIcards.length);
   console.log("Cards player left: "+humanCards.length);
   var z = AIcards.length+humanCards.length;
   console.log("Total: "+z);
   */
   checkMovedCard = true;
   //resetText();
   checkIfGameWon();
   checkIfturnLimitReached();
 }

 function claimToPlayerStack(){

 }

 /*******************
 * Moves player draw win to player's stack
 *********************/
function moveCardToPlayerStackFromDraw(drawncard){
  humanCards.unshift(drawncard);
  drawncard.position.x = 600;
  drawncard.position.y = 2;
  drawncard.position.z = 700;
  drawncard.player = "Drawable";

  //restacks
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
  //resetText();
  checkIfGameWon();
  checkIfturnLimitReached();
}//ends moveCardToPlayerStackFromDraw function

/*******************
* Moves AI draw win to AI's stack
*********************/
function moveCardToAIStackFromDraw(drawncard){
 AIcards.unshift(drawncard);
 drawncard.position.x = -600;
 drawncard.position.y = 2;
 drawncard.position.z = -400;;
 drawncard.player = "AIDrawable";

 //restacks
 var newHeight = 0;
 function restack(){
   for(var i = 0; i<AIcards.length; i++){
     AIcards[i].position.y = newHeight;
     newHeight+=2;
   }
 }
 restack();

 drawncard.rotation.x = 0;
 checkMovedCard = true;
 //resetText();
 checkIfGameWon();
 checkIfturnLimitReached();
}//ends moveCardToAIStackFromDraw function

  /*******************
  * Moves regular player win to player's stack
  *********************/
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
   console.log("Cards AI left: "+AIcards.length);
   console.log("Cards player left: "+humanCards.length);
   var z = AIcards.length+humanCards.length;
   console.log("Total: "+z);
   checkMovedCard = true;
   //resetText();
   checkIfGameWon();
   checkIfturnLimitReached();
 }

 function resetText(){
   score.innerHTML = "";
 }

 function checkIfGameWon(){
   if(AIcards.length == 0){
     console.log("AI LOST");
     score.innerHTML = "YOU WON THE GAME!";
     gameWon = true;
     updateDatabaseWin();
   }
   else if(humanCards.length == 0){
     console.log("Player Lost");
     score.innerHTML = "YOU LOST THE GAME!";
     gameLost = true;
     updateDatabaseLose();
   }
 }

 function checkIfturnLimitReached(){
   console.log("Turns: "+turns);
   if(turns >= turnLimit){

       var aiCardsTotal = AIcards.length;
       var playerCardsTotal = humanCards.length;
       console.log("turnsOver" + aiCardsTotal + playerCardsTotal);
       if(playerCardsTotal > aiCardsTotal){
         console.log("AI LOST");
         score.innerHTML = "Turns Limit has been reached <br> YOU WON THE GAME!<br>You have "+playerCardsTotal+" remaining<br>AI has " + aiCardsTotal + " cards remaining";
         gameWon = true;
         updateDatabaseWin();
       }
       else if(aiCardsTotal > playerCardsTotal ){
         console.log("Player Lost");
         score.innerHTML = "Turns Limit has been reached <br>YOU LOST THE GAME!<br>You have "+playerCardsTotal+" remaining<br>AI has " + aiCardsTotal + " cards remaining";
         gameLost = true;
         updateDatabaseLose();
       }
       else if(playerCardsTotal == aiCardsTotal){
         console.log("Draw");
         score.innerHTML = "Turns Limit has been reached <br>This game is a draw!<br>You have "+playerCardsTotal+" remaining<br>AI has " + aiCardsTotal + " cards remaining";
         gameWon = true;
       }

       console.log("turnsOver" + gameWon + gameLost);
     }

 }

 function updateDatabaseLose() {
   const user = {
     username: userInfo.getUsername()
   }

   $http.post('users/updateLoses', user, {headers: {'Content-type': 'application/json'}})
   .then(
     function successCallback(data) {
       console.log("Lose");
     },
     function errorCallback(err) {
       document.getElementById("message").innerHTML = "An error occurred while trying to create the account. Please try again later."
     }
   );
 }

 function updateDatabaseWin() {
   const user = {
     username: userInfo.getUsername()
   }

   $http.post('users/updateWins', user, {headers: {'Content-type': 'application/json'}})
   .then(
     function successCallback(data) {
       console.log("Win");
     },
     function errorCallback(err) {
       document.getElementById("message").innerHTML = "An error occurred while trying to create the account. Please try again later."
     }
   );
 }
});
