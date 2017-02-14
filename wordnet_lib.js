var _reader;
var _phoneme;

var STACK_SIZE = 4;
var _pointer_symbol = {
	'!': 'antonym',
	'&': 'similar',
	'@': 'hypernym',
	'@i': 'instanceHypernym',
	'#m': 'memberHolonym',
	'#s': 'substanceHolonym',
	'#p': 'partHolonym',
	'%m': 'memberMeronym',
	'%s': 'substanceMeronym',
	'%p': 'partMeronym',
	'=': 'attribute',
	'+':  'relatedForm',
	';c': 'domainOfSynset',
	'-c': 'memberOfDomain',
	';r': 'domainOfSynset',
	'-r':  'memberOfDomain',
	';u': 'domainOfSynset',
	'-u': 'memberOfDomain',
	'*': 'entailment',
	'>': 'cause',
	'^': 'alsoSee',
	'$': 'verbGroup',
	'<': 'participle'
};
var _pos = {
	'n': 'noun',
	'v': 'verb',
	'a': 'adjective',
	's': 'adjective satellite',
	'r': 'adverb',
	'?': '?'
};
var _data_files = {
	'n': 'data.noun',
	'v': 'data.verb',
	'a': 'data.adj',
	'r': 'data.adv'
};
var _index_files = {
	'n': 'index.noun',
	'v': 'index.verb',
	'a': 'index.adj',
	'r': 'index.adv'
};
var _exc_files = {
	'n': 'noun.exc',
	'v': 'verb.exc',
	'a': 'adj.exc',
	'r': 'adv.exc'
};
var _db_dir = "db/";
var _word_index = {};

/*
* Parsing word indeces
* @param {String} db_dir The root directory of the index files.
* @param {Function} callback The callback to invoke when all index files are are parsed.
*/
var _parseIndex = function (db_dir, callback) {
	var pos;
	var stack_size = STACK_SIZE;
	var objectify = function(line){
		var metadata = line.split(' ');

		var meta = {};
		meta.lemma = metadata.shift();
		meta.pos = metadata.shift();
		meta.synsetCount = parseInt(metadata.shift(), 10);
		meta.pointerCount = parseInt(metadata.shift(), 10);
		meta.pointers = [];

		for(var i=0; i < meta.pointerCount; i++){
			meta.pointers.push(metadata.shift() ); //can be mapped with _pointer_symbol
		}

		meta.senseCount = parseInt(metadata.shift(), 10);
		meta.tagSenseCount = parseInt(metadata.shift(), 10);
		meta.offsets = [];

		for(var i=0; i < meta.senseCount; i++){
			meta.offsets.push( parseInt(metadata.shift(), 10) );
		}
		return meta;
	};
	var onLine = function(line){
		if(line.indexOf("  ") === 0){
			return;
		}
		var meta= objectify(line);
		if(!_word_index[meta.lemma]){
			_word_index[meta.lemma] = {};
		}
		_word_index[meta.lemma][meta.pos] = meta;
	};
	var onClose = function(){
		stack_size--;
		if(stack_size === 0){
			if(callback){
				callback(_word_index);			
			}
		}
	};

	for( pos in _index_files){
		console.log("Parsing " + _index_files[pos] + "...");
		_reader.readLines(db_dir + _index_files[pos], onLine, onClose);
	}
};

/*
* Parsing any word alteration in _word_index
* @param {String} db_dir The root directory of the exc files.
* @param {Function} callback The callback to invoke when all exc files are parsed.
*/

var _parseAlteration = function(db_dir, callback){
	var pos;
	var stack_size = STACK_SIZE;

	var onLine = function(line){
		var parts = line.split(" ");
		var org = parts[1];
		var alt = parts[0];
		if(_word_index[org]){
			_word_index[alt] = _word_index[org];
		}
	};
	var onClose = function(){
		stack_size--;
		if(stack_size === 0){
			if(callback){
				callback(_word_index);
			}
		}
	};

	for(var word in _word_index){
		
	}

	for(pos in _exc_files){
		console.log("Parsing " + _exc_files[pos] + "...");
		_reader.readLines(db_dir + _exc_files[pos], onLine, onClose);
	}
};

/*
* Return the first base form found in _o=word_index of an inflected lemma. Otherwise, return the same inflection.
* @param {String} lemma The inflected lemma
*/
var _getInflectedBaseForm = function (lemma){
	var inflections = [
		{'suf':"s", 'end': "", 'pos':"n"},
		{'suf':"ses", 'end':"s", 'pos':"n"},
		{'suf':"xes", 'end':"x", 'pos':"n"},
		{'suf':"zes", 'end':"z", 'pos':"n"},
		{'suf':"ches", 'end':"ch", 'pos':"n"},
		{'suf':"shes", 'end':"sh", 'pos':"n"},
		{'suf':"men", 'end':"man", 'pos':"n"},
		{'suf':"ies", 'end':"y", 'pos':"n"},
		{'suf':"s", 'end':"", 'pos':"v"},
		{'suf':"ies", 'end':"y", 'pos':"v"},
		{'suf':"es", 'end':"e", 'pos':"v"},
		{'suf':"es", 'end':"", 'pos':"v"},
		{'suf':"ed", 'end':"e", 'pos':"v"},
		{'suf':"ed", 'end':"", 'pos':"v"},
		{'suf':"ing", 'end':"e", 'pos':"v"},
		{'suf':"ing", 'end':"", 'pos':"v"},
		{'suf':"er", 'end':"", 'pos':"a"},
		{'suf':"est", 'end':"", 'pos':"a"},
		{'suf':"er", 'end':"e", 'pos':"a"},
		{'suf':"est", 'end':"e", 'pos':"a"}
	];
	var endWith = function(word, pattern, replacement){
		var word_length = word.length;
		var pattern_length = pattern.length;
		var pattern_offset = word.lastIndexOf(pattern);
		
		if((word_length > pattern_length) && (word_length-pattern_length) === pattern_offset){
			//return true;
			return (word.substr(0, pattern_offset) + replacement);
		}else{
			//return false;
			return null;
		}
	};

	var baseForms = [];
	var new_lemma;
	for(var i=0, len= inflections.length; i<len; i++){
		new_lemma = endWith(lemma, inflections[i].suf, inflections[i].end);
		if(new_lemma && _word_index[new_lemma] && _word_index[new_lemma][inflections[i].pos]){
			baseForms.push(new_lemma);
		}
	}
	if(_word_index[lemma]){
		baseForms.push(lemma);
	}
	return baseForms;
};

/*
* Define lemma - all spaces in lemma must be replaced with '_'
* @param {String} What to define.
* @param {String[]} lemma An array of un-inflected forms of lemma to define. i,e, for  the lemma "waiting", the baseFoms
* will contains both <waiting> (an adjectiive) & <wait> (a verb).
* @param {String} db_dir The root directory of the dictionary's data file.
* @param {Function} callback The callback to be invoked to give the result.
*/
var _define = function(word, baseForms, db_dir, callback){
	var objectify = function(line){
		var parts = line.split('|');
		var metadata = parts[0].split(' ');
		var glossary = (parts[1]) ? parts[1].trim() : '';

		var meta = {};
		meta.synsetOffset = parseInt(metadata.shift(), 10);
		meta.lexFilenum = parseInt(metadata.shift(), 10);
		meta.synsetType = metadata.shift(); //can be mapped with "_pos".
		meta.wordCount = parseInt(metadata.shift(), 16);
		meta.words = [];

		for( var wordIdx = 0; wordIdx < meta.wordCount; wordIdx++){
			meta.words.push({
				'word': metadata.shift(),
				'lexId': parseInt(metadata.shift(), 16)
			});
		}

		meta.pointerCount = parseInt(metadata.shift(), 10);
		meta.pointers = [];

		for(var pointerIdx = 0; pointerIdx < meta.pointerCount; pointerIdx++){
			meta.pointers.push({
				'pointerSymbol': metadata.shift(), //can be mapped with _pointer_symbol
				'synsetOffset' : parseInt(metadata.shift(), 10),
				'pos': metadata.shift(), //can be mapped with "_pos".
				'sourceTargetHex': metadata.shift()
			});
		}

		if (glossary.length > 0) {
			glossary = glossary.split('"');
			meta.definition = glossary.shift().trim();
			meta.examples = (glossary) ? glossary.join('').split(";") : [];
		}
		return meta;
	};
	var onLine = function(line){
		var meta = objectify(line);
		if(!result[meta.synsetType]){
			result[meta.synsetType] = [];
		}
		result[meta.synsetType].push(meta);
	};
	var getShortestString = function(array){
		if(array.length && array.length > 0){
			var shortest = array[0];
			for(var i=1, len_i=array.length; i < len_i; i++){
				if(array[i].length < shortest){
				shortest = array[i];
				}
			}
			return shortest;
		}else{
			return null;
		}
	};
	var formatResult = function(result){
		var f_result = {};
		f_result.lemma = lemma.replace(/_/g, ' ');
		f_result.phoneme = _phoneme.get(lemma);

		/*
			f_result.classes contains all the classes of lemma. A class is whether a noun, a verb, ...
		*/
		f_result.classes = {};
		/*
			c is whether: "n" "v" "a" "s" "r" for noum, verb, adjective, .... respectively
		*/
		var c;
		for(c in result){
			f_result.classes[c] = [];
			for(var i=0, len= result[c].length; i<len; i++){
				/*
					def_obj is a definition of lemma for the current class.
				*/
				var result_current = result[c][i];
				var def_obj = {};
				def_obj.definition = result_current.definition;
				def_obj.examples = result_current.examples;
				def_obj.synonyms = [];
				result_current.words.forEach(function(elem){
					if(elem.word !== lemma){
						def_obj.synonyms.push(elem.word.replace(/_/g, ' '));
					}
				});
				for(var j=0, len_= result_current.pointers.length; j<len_; j++){
					var pointer_current = result_current.pointers[j];
					if(pointer_current.pointerSymbol === "!"){
						def_obj.antonyms = [];
						_reader.readLine(db_dir + _data_files[pointer_current.pos], pointer_current.synsetOffset, function(line){
							var antonym_words = objectify(line).words;
							antonym_words.forEach(function(elem){
								def_obj.antonyms.push(elem.word.replace(/_/g, ' '));
							});
						});
						break;
					}
				}
				/*
					Add this definition to the current classes. And continue to the next loop, if any.
				*/
				f_result.classes[c].push(def_obj);
			}
		}
		return f_result;
	};

	var lemma = (baseForms.length > 0) ? getShortestString(baseForms) : word;
	var result = {};
	if(baseForms.length > 0){
		var lemma_current;
		var pos_lemma_current;
		var pos_meta_lemma_current;
		var data_file_path_lemma_current;
		var line_offset_lemma_current;

		for(var i = 0, len_i = baseForms.length; i < len_i; i++){
			lemma_current = baseForms[i];

			for(pos_lemma_current in _word_index[lemma_current] ){
				pos_meta_lemma_current = _word_index[lemma_current][pos_lemma_current];

				for(var j = 0, len_j = pos_meta_lemma_current.senseCount; j < len_j; j++){
					data_file_path_lemma_current = db_dir + _data_files[pos_lemma_current];
					line_offset_lemma_current = pos_meta_lemma_current.offsets[j];

					_reader.readLine(data_file_path_lemma_current, line_offset_lemma_current, onLine);
				}
			}
		}
		if(callback){
			var formatedResult = formatResult(result);
			callback(formatedResult, formatedResult.lemma);
		}
	}else{
		//No definition found for "lemma"  & in this case baseForms' length WOULD be 0.
		callback(null, word);
	}
};


module.exports = {
	init : function(reader, phoneme, callback){
		_reader = reader;
		_phoneme = phoneme;
		_parseIndex(_db_dir, function(word_index){
			_parseAlteration(_db_dir, function(word_index){
				console.log("Wordnet is successfully initialized.");
				if(callback){
					callback();
				}
			});
		});
	},

	define: function(word, callback){
		try{
			var lemma = word.toLowerCase();
			var baseForms = _getInflectedBaseForm(lemma.replace(/ /g, '_'));
			_define(word, baseForms, _db_dir, callback);
		}catch(exception){
			callback(null, word);
		};
	}
};