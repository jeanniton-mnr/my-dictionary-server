var _https = require("https");
var _phoneme;

var _api_link = "https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&titles=";

var _getExtract = function(word, callback){
	var enclosedCallback =  function(response){
		var buffer = "";
		var w = word;
		var cb = callback;

		response.on('data', function(chunk){
			buffer += chunk;
		});
		response.on('end', function(){
			console.log("wiki_lib->successful _https.get");
			if(cb){
				cb(_formatResult(buffer, w), w);
			}
		});
		response.on('error', function(e){
			console.error("wiki_lib-> " + e);
			if(cb){
				cb(null, w);
			}
		});
	};
	var onError = function(e){
		var cb = callback;
		var w = word;
		console.error("wiki_lib-> " + e);
		if(cb){
			cb(null, w);
		}
	};

	_https.get(_api_link + encodeURIComponent(word), enclosedCallback).on('error', onError);
};
var _formatResult = function(result, word){
	var f_result = null;
	var link = "https://en.wikipedia.org/wiki/" + encodeURIComponent(word);
	var anchor = ["<div>",
		"<a style=\"color:rgba(0, 0, 255, 1);\" href=", "\"" + link + "\"",  "target=\"_blanc\" >", link, "</a>",
		"</div>"].join(" ");

	if((typeof result) === "string"){
		result = JSON.parse(result);
	}
	var condition = (result.query != null) && ( result.query.pages != null);
	if(condition){
		var pages = result.query.pages;
		var page_id;
		for(page_id in pages){
			var page = pages[page_id];
			if( (page.title != null) && page.title.length > 0 && (page.extract != null) && page.extract.length > 0){
				var f_result = {
					"lemma": page.title,
					"phoneme": _phoneme.get(page.title),

					"classes": {
						"?":[
							{
								"definition": page.extract + anchor
							}
						]
					}
				};
				break;
			}
		}
	}
	return f_result;
};
var _define = function(word, callback){
	_getExtract(word, callback);
};

var _init = function(phoneme, callback){
	_phoneme = phoneme;
	if(callback){
		callback();
	}
}

module.exports = {
	init: function(phoneme, callback){
		_init(phoneme, callback);
	},

	define: function(word, callback){
		_define(word, callback);
	}
}
