var app = angular.module('views');

app.controller('warCardGameController', function($scope) {
  var initScene = function() {
    var scene, camera, renderer;
    var geometry, material, mesh, table, cards = [], card;

    init();
    animate();

    function init() {

    	scene = new THREE.Scene();
      var loader = new THREE.TextureLoader();

    	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
      camera.position.y = 400;
      //camera.rotation.x = Math.PI/4;
    	camera.position.z = 1500;

      loader.load('images/wood4.png', function ( texture ) {
        geometry = new THREE.BoxGeometry( 2000, 50, 2000 );
        material = new THREE.MeshBasicMaterial( { map: texture } );

        table = new THREE.Mesh( geometry, material );
        table.position.y = -200;
        scene.add( table );
      });

      geometry = new THREE.BoxGeometry( 200, 200, 200 );
    	material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );

    	mesh = new THREE.Mesh( geometry, material );
    	scene.add( mesh );

      createCards();

    	renderer = new THREE.WebGLRenderer();
    	renderer.setSize( window.innerWidth, window.innerHeight );

    	document.getElementById("war").appendChild( renderer.domElement );

    }

    function createCards() {
      geometry = new THREE.BoxGeometry( 300, 10, 400 );
      material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );

      card = new THREE.Mesh( geometry, material );
      card.rotation.x = Math.PI/2;
      card.position.y = 200;
      cards.push(card);
      scene.add( card );
    }

    function animate() {

    	requestAnimationFrame( animate );

    	mesh.rotation.x += 0.01;
    	mesh.rotation.y += 0.02;

    	renderer.render( scene, camera );

    }
  }

  window.onload = initScene();
});
