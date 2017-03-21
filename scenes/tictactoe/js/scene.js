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
* adding gameobjects to the scene
************************************************************/
var x1 = xPiece();
scene.add(x1);
x1.position.set(-1,0,0);

var o1 = oPiece();
scene.add(o1);
o1.position.set(1,0,0);


/************************************************************
* Main render function followed by animations
************************************************************/
function render() {
	requestAnimationFrame( render );
  animate();
	renderer.render( scene, camera );
}
render();

function animate(){
  x1.rotation.y += 0.05;
  o1.rotation.y += 0.05;
}

/************************************************************
* GameObject constructors
************************************************************/

//returns a new x game object
function xPiece(){
  group = new THREE.Group();
  var geometry = new THREE.BoxGeometry( 0.25, 1, 0.1 );
  var material = new THREE.MeshBasicMaterial( { color: 0xffffff } );

  var xproto1 = new THREE.Mesh( geometry, material );
  group.add( xproto1 );
  var xproto2 = new THREE.Mesh( geometry, material );
  group.add( xproto2 );
  xproto1.rotation.z = 180;
  xproto2.rotation.z = -180;
  return group;
}

//returns a new o game object
function oPiece(){
  var geometry = new THREE.RingGeometry( 0.25, 0.5, 32 );
  var material = new THREE.MeshBasicMaterial( { color: 0xffffff, side: THREE.DoubleSide } );
  var mesh = new THREE.Mesh( geometry, material );
  return mesh;
}
