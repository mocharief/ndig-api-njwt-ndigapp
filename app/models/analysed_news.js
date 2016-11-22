// app/models/bear.js

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var AnalysedSchema  = new Schema({
	_id: String,
    queryTitle: String,
    queryMongoServer: {
	    host: String,
	    port: String,
	    dbName: String,
	    queryDocCollection: String //ini yg ngebedain dapet dr mana (news / twitter / intel)
	},
	queryCategory: {
	    main: String,
	    sub1: String,
	    sub2: String
	},
	queryNewsDate: {
	    date: Date,
	    string: String
	},
	eventDate: {
	    date: Date,
	    string: String
	},
	queryUrl: String,
	threatWarning: String,
	timestamp: Date,
    eventLocation: {
    	latitude: Number,
    	longitude: Number,
    	daerahTingkat2: String,
    	daerahTingkat1: String
    }
}, 
// { collection : 'news_analysed' });
{ collection : 'analysed_news' });

module.exports = mongoose.model('Analysed', AnalysedSchema);