function init(){
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
  camera.position.z = 5;

  renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight, false);
  document.body.appendChild( renderer.domElement );
}
init();

/************************************************************
* adding game to the scene
************************************************************/
function newGame(){
  board = game();
  scene.add(board);
  board.scale.set(0.25,0.25,0.25);
}
newGame();

/************************************************************
* Main render function followed by animations
************************************************************/
function render() {
	requestAnimationFrame( render );
  animate();
  gameAnimations();
	renderer.render( scene, camera );
}
render();


/************************************************************
* Ends the current Game
************************************************************/
function endGame(){
  gameCleanUP();
  scene.remove(game);
}

function animate(){
  board.rotation.z += 0.01;
}
