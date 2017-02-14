var reader = require('./reader_lib');
var distance = require('jaro-winkler');

var phoneme = require('./phoneme_lib.js');
var wordnet = require('./wordnet_lib.js');
var wiki = require("./wiki_lib.js");

var _find_closest_word = function(word){
	var rated = [];
	phoneme.get_dictionary_key().forEach(function(key) {
	  rated.push({
	    key: key,
	    distance: distance(word, key)
	  });
	});
	/* Sort the rated word in descending order base on the they distance */
	rated.sort(function(a, b) {
	  if (a.distance < b.distance) {
	    return 1;
	  } else if (a.distance > b.distance) {
	      return -1;
	  } else {
	    return 0;
	  }
	});
	/* Convert from an <Array of Object> to an <Array Of String> */
	rated.filter(function(el, ind, arr) {
		arr[ind] = el.key;
	});

	return rated;
};

var _define = function(word, callback){
	wordnet.define(word, function(result, lemma){
		if(result){
			callback(result);
		}else
		{
			wiki.define(lemma, function(result, lemma){
				if(result){
					callback(result);
				}else{
					callback(null);
				}
			});
		};
	});
};

var _get_suggestions = function(word){
    var suggestions = [];
    var result = {};
    
    // if the value is an empty string don't filter the items
    if (word && word != '') {
        var regx = new RegExp("^" + word + ".*", "gim");
        suggestions = phoneme.get_dictionary_key().filter(function(el, ind, arr){
            return ((el.match(regx)) != null);
        });
    }

    if(suggestions.length > 0){
    	result = {corrected: false, suggestions: suggestions.slice(0, 10)};
    }else{
    	result = {corrected: true, suggestions: _find_closest_word(word).slice(0, 10)};
    }

    result.suggestions.forEach(function(el, ind, arr){
        arr[ind] = el.replace(/_/g, ' ').toLowerCase();
    });

    return result;
};

var _init = function(callback){
	phoneme.init(function(){
		wordnet.init(reader, phoneme, function(){
			wiki.init(phoneme, callback);
		});
	});
}

module.exports = {
	init: function(callback){
		_init(callback);
	},

	define: function(word, callback){
		_define(word, callback);
	},

	get_suggestions: function(word){
		if(!word){
            return null;
        }
        var word = word.toLowerCase().replace(/ /g, "_");
        return _get_suggestions(word);
	},
}
