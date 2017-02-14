
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

/**bodyParser.json(options)
 * Parses the text as JSON and exposes the resulting object on req.body.
 */

app.use(bodyParser.json());

app.post('/', function(req, res){
	if((req.body.action) && (req.body.action === "define") ){
		res.redirect(307, '/define');
	}else{
		res.writeHead(200, "OK", {'Content-Type': 'text/html'});
		res.write('<html><head><title>My Dictionary!</title></head><body>');
			res.write("<h1>You are on the My Dictionary's server.</h1>");
			res.write("<p>" + ("My Dictionary's server is up and running at: " + os.hostname() + ":" + port) + "</p>");
		res.write('</body></html');
		res.end();		
	}
});

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  visitor.event(req.method, req.path, "Date : " + Date.now(), function(error){
  	console.log(error);
  } ).send()
  next();
});

app.get("/", function(req, res){
	res.writeHead(200, "OK", {'Content-Type': 'text/html'});
	res.write('<html><head><title>My Dictionary!</title></head><body>');
		res.write("<h1>You are on the My Dictionary's server.</h1>");
		res.write("<p>" + ("My Dictionary's server is up and running at: " + os.hostname() + ":" + port) + "</p>");
	res.write('</body></html');
	res.end();
});
app.get("/suggestions", function(req, res){
	try{	
		var lemma = req.query.lemma;
		var suggestions = my_dictionary.get_suggestions(lemma);
		res.writeHead(200, { 'Content-Type': 'application/json' });
		res.end(JSON.stringify(suggestions));
	}catch(exception){
	    // HTTP status 500: Internal Server Error
	    res.status(500).send({status:500, error: 'internal error', type:'internal'});
		console.log("Error: " + exception.message);		
	}
});

app.post("/define", function (req, res) {
	try{
		var post_data = req.body;
		var condition = (post_data.app === "myDictionary") && post_data.lemma;
		res.writeHead(200, { 'Content-Type': 'application/json' });

		if(condition){
			my_dictionary.define(post_data.lemma, function(result){
				if(result){
					res.end(JSON.stringify(result));
				}else{
					var href = "https://www.google.ht/search?q=" + post_data.lemma.replace(/\s+/g, '+'),
						anchor = "<a style='color:black; font-weight:bold; text-decoration:none;' href=\"" + href + "\" target=\"_blanc\">" + post_data.lemma.replace(/\+/g, " ") + "</a>",
						result = {'error': ["<p>No dictionary results were found.<br>", "Search the web for ", anchor, ".</p>"].join("")};
					res.end(JSON.stringify(result));
				}
			});
		}else{
			console.log("Condition is not meet for: " + JSON.stringify(req));
			res.end({'error':
				"Oops! I am having trouble understanding your request!<br> Check to see if you have the lastest version of MyDictionary."
			});
		}

	}catch(exception){
	    // HTTP status 500: Internal Server Error
		res.send(500, {status:500, error: 'internal error', type:'internal'});
		console.log("Error: " + exception.message);
	}
});

var onInitialized = function(){
	app.listen(port);
	console.log("My Dictionary's server is up and running at: " + os.hostname() + ":" + port);
};

my_dictionary.init(onInitialized);
