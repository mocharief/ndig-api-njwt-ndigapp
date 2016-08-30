// app/models/bear.js

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var WebpageSchema  = new Schema({
	_id: String,
    baseUrl: String,
    text: String,
    title: String
}, 
{ collection : 'notwitter_webpage' });

module.exports = mongoose.model('Webpage', WebpageSchema);