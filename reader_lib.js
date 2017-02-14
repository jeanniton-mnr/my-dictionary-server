
var fs = require('fs');
var readline =  require('readline');
var Stream = require('stream');
 
var BUFFER_SIZE = 512;

module.exports = {
	/*
	* Read a text file line by line asynchronously.
	*
	* @param {String} file Name of the file to read
	* @param {Function} onLine Callback per line.
	* @param {Function} on Close On file closed callback.
	*/
	readLines: function(file, onLine, onClose){
		var inputStream = fs.createReadStream(file);
		var outputStream = new Stream();
		outputStream.readable = true;
		outputStream.writeable = true;

		var rl = readline.createInterface({
			input: inputStream,
			output: outputStream,
			terminal: false
		});

		rl.on('line', onLine);
		rl.on('close', function(){
			rl.close();
			onClose();
		});
	},

	/*
	* Read a text file's line by starting at a specif byte offset synchronously.
	* @param {String} filepath Name of the file to read.
	* @param {Number} offset The number of byte(s) after which to start reading.
	* @param {Function} onLine Callback to invoke when the line is read.
	*/
  	readLine: function(filepath, offset, onLine){
  		var offset = offset;
		var file = fs.openSync(filepath, 'r');
		var line = "";

		do{
			var buffer = new Buffer(BUFFER_SIZE);
			offset += fs.readSync(file, buffer, 0, BUFFER_SIZE, offset);
			line += buffer.toString();
		}while(line.indexOf('\n') === -1);

		fs.closeSync(file);
		onLine(line.split('\n')[0]);
  	},
};