/************************************************************
* Creates a new Game Board
************************************************************/
function game(){
  var board = new THREE.Group();

  x1 = xPiece();
  board.add(x1);
  x1.position.set(-1,0,0);

  o1 = oPiece();
  board.add(o1);
  o1.position.set(1,0,0);

  return board;
}

/************************************************************
* Called when ending the game, destroy game objects here
************************************************************/
function gameCleanUP(){

}

function gameAnimations(){
  x1.rotation.y += 0.01;
  o1.rotation.x += 0.01;
}
/************************************************************
* GameObject constructors
************************************************************/

//returns a new x game object
function xPiece(){
  var group = new THREE.Group();
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
