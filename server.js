var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

// Initialize Express
var app = express();

//set hbs

var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));

app.set("view engine", "handlebars");

var cheerio = require("cheerio");
// Require all models
//var db = require("./models");

var PORT = 3000;

// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// Connect to the Mongo DB
// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

// Routes

// A GET route

// Start the server
app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });
  