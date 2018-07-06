var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var request = require("request");

// Initialize Express
var app = express();


// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

//set hbs

var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));

app.set("view engine", "handlebars");

var cheerio = require("cheerio");
// Require all models
var db = require("./models.1");

var PORT = process.env.PORT || 8080;


// Connect to the Mongo DB
// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/mongoHeadlines";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);



// Routes
// Scrape reddit
app.get("/scrape", function (req, res) {
  request("https://old.reddit.com/r/programminghorror/", function (error, response, body) {
    console.log('error:', error);
    console.log('statusCode:', response && response.statusCode);
    //console.log('body:', body);

    var $ = cheerio.load(body);
    $(".title").each(function (i, ele) {
      // console.log("I",i);
      // console.log("ELE",ele);

      var title = $(ele).children("a").text();
      var link = $(ele).children("a").attr("href");
    
      // If this found element had both a title and a link
      if (title && link) {
        // Insert the data in the scrapedData db
        db.Article.create({
          title: title,
          link: link
        },
        function(err, inserted) {
          if (err) {
            // Log the error if one is encountered during the query
            console.log(err);
          }
          else {
            // Otherwise, log the inserted data
            console.log("Added", inserted);
          }
        });
      }
      //var result = {};
      //db.Article.create(result){}
    })
  })
  // Send a "Scrape Complete" message to the browser
  res.send("Scrape Complete");

})
// Retrieve data from the db
app.get("/articles", function(req, res) {
  db.Article.find({}, function(error, data) {
    // Throw any errors to the console
    if (error) {
      console.log(error);
    }
    // If there are no errors, send the data to the browser as json
    else {
      res.json(data);
    }
  });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    // .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
   // Create a new note and pass the req.body to the entry
   db.Note.create(req.body)
   .then(function(dbNote) {
     // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
     // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
     // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
     return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
   })
   .then(function(dbArticle) {
     // If we were able to successfully update an Article, send it back to the client
     res.json(dbArticle);
   })
   .catch(function(err) {
     // If an error occurred, send it to the client
     res.json(err);
   });
});


// A GET route
app.get("/", function (req, res) {
  //Home Page
  res.render("index");
  //db.Article.find({})
    // .then(article => {
    //   res.json(article)
    // })
    // .catch(err => {
    //   res.json(err)
    // })
})

app.get("/notes", function (req, res) {
  //Home Page
  // res.render("index");
  db.Note.find({})
    .then(article => {
      res.json(article)
    })
    .catch(err => {
      res.json(err)
    })
})

// Start the server
app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});
