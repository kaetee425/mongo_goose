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
	axios.get("")
});

app.get("/articles", function(req, res){

});

app.get("/articles/:id", function(req, res){

});

app.post("/articles/:id", function(req, res){

});

app.listen(PORT, function(){
	console.log("App is listening on port ", PORT);
})