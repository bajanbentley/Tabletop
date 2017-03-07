const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const mongoose = require('mongoose');

mongoose.connect('mongodb://cps630project:dankmemes1@ds123050.mlab.com:23050/tabletop'); //connect to database

mongoose.connection.on('connected', function() {
  console.log('connected');
});

mongoose.connection.on('error', function(err) {
  console.log('error');
});

const app = express(); //initialize app with express

const users = require('./routes/users'); //gets users.js

const port = 3000;

//lets you communicate with any domain
app.use(cors());

//set static folder
app.use(express.static(path.join(__dirname, "client")));

//gets info from form and such
app.use(bodyParser.json());

app.use('/users', users); //any domain that is ./users/x goes to x

app.get('/', function(req, res) { //index route
  res.send("invalid");
});

app.listen(port, function() { //listens on port/start server
  console.log("Server on port: " + port);
});
