// app/models/bear.js

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var NewsSchema  = new Schema({
	_id: String,
    baseUrl: String,
    title: String,
    content: String,
    newsDate: {
    	date: Date,
    	string: String
    }
}, 
{ collection : 'filtered_news' });

module.exports = mongoose.model('News', NewsSchema);