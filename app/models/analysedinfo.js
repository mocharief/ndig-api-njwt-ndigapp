// app/models/bear.js

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var AnalysedInfoSchema  = new Schema({
	_id: String,
    queryTitle: String,
    queryUrl: String,
    queryCategory: {
    	main: String,
    	sub1: String,
    	sub2: String
    },
    eventDate: {
    	date: Date,
    	string: String
    },
    eventLocation: {
    	daerahTingkat2: String,
    	daerahTingkat1: String,
    	latitude: Number,
    	longitude: Number
    },
    threatWarning: String,
    timestamp: Date,
    eventLoc_dt1: String
}, 
// { collection : 'news_analysed' });
{ collection : 'analysed_news' });

module.exports = mongoose.model('AnalysedInfo', AnalysedInfoSchema);