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
  scene.add(game());
}
newGame();

/************************************************************
* Main render function followed by animations
************************************************************/
function render() {
	requestAnimationFrame( render );
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
