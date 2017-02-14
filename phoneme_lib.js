/**
 * Created by Hewlett-Packard on 11/19/2015.
 */
var reader = require('./reader_lib');

var _db_dir = "db/";
var phonemes_file= "phonemes.list";
var _word_phoneme = {};
var _dictionary_key = [];


/*
 * Parsing word arabet phonemes in _word_phoneme
 * @param {String} db_dir The root directory of phonetic.txt.
 * @param {Function} callback The allback to invoke when all the phonemes are parsed.
 */
var _init = function(db_dir, callback){
    var onLine = function(line){
        var parts = line.split("  ");
        var word = parts[0].toLowerCase().replace(/ /g, '_');
        _word_phoneme[word] = parts[1];
        _dictionary_key.push(word);
    };
    var onClose = function(){
        console.log("Phonemes are sucessfully parsed.")
        if(callback){
            callback();
        }
    };

    console.log("Parsing " + phonemes_file + "...");
    reader.readLines(db_dir + phonemes_file , onLine, onClose);
};

var _get = function(lemma){
    var result = _word_phoneme[lemma] || null;
    return result;
};


module.exports = {
    init: function(callback){
        _init(_db_dir, callback);
    },

    get : function(word){
        if(!word){
            return null;
        }
        var lemma = word.toLowerCase().replace(/ /g, "_");
        return _get(lemma);
    },

    get_dictionary_key : function(){
        return _dictionary_key;
    },

};