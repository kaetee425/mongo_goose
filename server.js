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

app.get("/scape", function(req, res){
	axios.get("http://www.cracked.com/humor-movies-tv.html").then(function(response){
		var $ = cheerio.load(response.data);

		$("div.content-card").each(function(i, element){
			var result = {};

			result.title = $(this).children("div.content-card-content a").text();
			result.link = $(this).children("div.content-card-content a").attr('href');

			db.Article.create(result).then(function(dbArticle){
				res.send("Scrape Complete");
			}).catch(function(err){
				res.json(err);
			})
		});
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