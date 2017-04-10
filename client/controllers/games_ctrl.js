var app = angular.module('views');

app.controller('gamesController', function($scope, $location, loginAuth) {
  /************************************
  *           Check login
  **************************************/
  $scope.navbarTemplate = './templates/navbar_nologged.htm';

  var testLogged = (loginAuth.getLogged() || localStorage.getItem('id_token') != null) ? true : false ;
  if(!testLogged) { // test for logged in
    $location.path('/login');
  }
  /*$scope.switchToWar = function() {
    $location.path("/war");
  }*/
});
