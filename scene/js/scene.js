//function init(){
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
  camera.position.z = 5;

  var renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight, false);
  document.body.appendChild( renderer.domElement );
//}
//init();

//game objects
var cardGeometry = new THREE.BoxGeometry( 0.75, 1, 0 );
var cardmaterial = new THREE.MeshBasicMaterial( { color: 0xffffff } );
var card = new THREE.Mesh( cardGeometry, cardmaterial );
scene.add( card );

var textGeometry = new THREE.TextGeometry("water",12);
var textmaterial = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
var text = new THREE.Mesh( textGeometry,textmaterial );
scene.add(text);



//main render function
function render() {
	requestAnimationFrame( render );
  animateCube();
	renderer.render( scene, camera );
}
render();

function animateCube(){
  card.rotation.x += 0.01;
  card.rotation.y += 0.01;
}
