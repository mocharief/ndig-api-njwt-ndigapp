// app/models/bear.js

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var AnalysedSchema  = new Schema({
	_id: String,
    queryTitle: String,
    eventLocation: {
    	namaTempat: String,
    	latitude: Number,
    	longitude: Number
    }
}, 
{ collection : 'news_analysed' });

module.exports = mongoose.model('Analysed', AnalysedSchema);