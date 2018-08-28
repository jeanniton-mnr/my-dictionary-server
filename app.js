
var os= require('os');
var express = require('express');
var bodyParser = require('body-parser');
var ua = require('universal-analytics');

var my_dictionary = require('./my-dictionary.js');

var app = express();
var port = Number(process.env.PORT || 8080);

var visitor = ua('UA-84721385-2');




app.use(bodyParser.urlencoded({
    extended: false
}));

/*
 * bodyParser.json(options)
 * Parses the text as JSON and exposes the resulting object on req.body.
 */

app.use(bodyParser.json());

app.use(function (req, res, next) {
	// Allow cross-site origin
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	// Log request for google analytics
	visitor.event(req.method, req.path, "Date : " + Date.now(), function (error) {
		console.log(error);
	}).send()
	// Get to the next router
	next();
});

// @route `/`
// Render root page log
app.all("/", function (req, res) {
	let parameters = (req.method === "GET") ? req.query : req.body;
	// The commented code is left as to see what the algorithm is doing
	// In the previous version, we will only redirect the route for action
	// egual `define`. Now the code, is more heterogeneous.
	if (parameters.action) {						// if(parameters.action ==="define" )
		let redirect_url = '/' + parameters.action;
		res.redirect(307, redirect_url); // res.redirect(307, '/define')
	}else{
		res.writeHead(200, "OK", { 'Content-Type': 'text/html' });
		res.write('<html><head><title>My Dictionary!</title></head><body>');
		res.write("<h1>You are on the My Dictionary's server.</h1>");
		res.write("<p>" + ("My Dictionary's server is up and running at: " + os.hostname() + ":" + port) + "</p>");
		res.write('</body></html');
		res.end();
	}
});

app.all("/suggestions", function(req, res){
	try{
		let parameters = (req.method === "GET") ? req.query : req.body,
			lemma = req.query.lemma,
			suggestions = my_dictionary.get_suggestions(lemma);
		res.writeHead(200, { 'Content-Type': 'application/json' });
		res.end(JSON.stringify(suggestions));
	}catch(exception){
	    // HTTP status 500: Internal Server Error
	    res.status(500).send({status:500, error: 'internal error', type:'internal'});
		console.log("Error: " + exception.message);		
	}
});

app.all("/define", function (req, res) {
	try{
		let parameters = (req.method === "GET") ? req.query : req.body;
		res.writeHead(200, {"Content-Type": "application/json"});
		// Get definition from dictionary module
		my_dictionary.define(parameters.lemma, function(result){
			if(result){
				res.end(JSON.stringify(result));
			}else{
				let href = "https://www.google.ht/search?q=" + parameters.lemma.replace(/\s+/g, '+'),
					anchor = "<a style='color:black; font-weight:bold; text-decoration:none;' href=\"" + href + "\" target=\"_blanc\">" + parameters.lemma.replace(/\+/g, " ") + "</a>",
					result = {
						'error': ["No dictionary results were found.<br>", "Search the web for ", anchor, "."].join("")
					};
				res.end(JSON.stringify(result));
			}
		});
	}catch(exception){
		// Return HTTP status 500: INternal Server Error
		let error = "Internal Server Error",
			type = "Internal";
		res.send(500, {status:500, error: error, type:type});
		console.log("Error: " + exception.message);
	}
});

var onInitialized = function(){
	app.listen(port);
	console.log("My Dictionary's server is up and running at: " + os.hostname() + ":" + port);
};

my_dictionary.init(onInitialized);
