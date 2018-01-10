var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");

var PORT = process.env.PORT || 3003;

var app = express();

app.use(logger("dev"));
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static("public"));

mongoose.Promise = Promise;
mongoose.connect("mongodb://localhost/goGoose", {
	useMongoClient: true
});

app.get("/scrape", function(req, res){
	axios.get("http://www.cracked.com/humor-movies-tv.html").then(function(response){
		var $ = cheerio.load(response.data);

		$("div.content-card").each(function(i, element){
			var result = {};

			// seems like these aren't consistently returning the values you're
			// expecting which is causing the below create call to fail when either
			// title or link is missing. So you should probably validate that both
			// are present before trying to create a new article.
			result.title = $(this).children("div.content-card-content a").text();
			result.link = $(this).children("div.content-card-content a").attr('href');

			db.Article.create(result).then(function(dbArticle){
				console.log('Created an article: ', dbArticle)
			}).catch(function(err){
				// It's good practice to log out errors so that the server logs can be used
				// when debugging issues.
				console.log('Error creating article: ', err)
				res.json(err);
			})
		});
		// You want this method call outside of the each loop so you don't get an 
		// error for trying to send multiple responses to the same request.
		res.send("Scrape Complete");
	});
});

app.get("/articles", function(req, res){
	db.Article.find({}).then(function(dbArticle){
		res.json(dbArticle);
	}).catch(function(err){
		res.json(err);
	});
});

app.get("/articles/:id", function(req, res){
	db.Article.findOne({_id: req.params.id}).populate("note").then(function(dbArticle){
		res.json(dbArticle);
	}).catch(function(err){
		res.json(err)
	})
});

app.post("/articles/:id", function(req, res){
	db.Note.create(req.body).then(function(dbNote){
		return db.Article.findOneAndUpdate({_id: req.params.id}, {note: dbNote._id}, {new: true});
	}).then(function(dbArticle){
		res.json(dbArticle);
	}).catch(function(err){
		res.json(err)
	})
});

app.listen(PORT, function(){
	console.log("App is listening on port ", PORT);
})