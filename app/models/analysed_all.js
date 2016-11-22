// app/models/bear.js

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var AnalysedAllSchema  = new Schema({
	_id: String,
    queryTitle: String,
    queryMongoServer: {
	    host: String,
	    port: String,
	    dbName: String,
	    queryDocCollection: String 		//ini yg ngebedain dapet dr mana (news / twitter / intel)
	},
	queryCategory: {
	    main: String,
	    sub1: String,
	    sub2: String
	},
	queryDate: {				//disini ngilangin news / twitter / intel
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


{
  "_id": "57e8dfacbfba74578f333edd",
  "queryTweetMongoServer": {
    "host": "127.0.0.1",
    "port": 27017,
    "dbName": "dias",
    "queryTweetCollection": "filtered_tweet"
  },
  "queryTweetCategory": {
    "main": "Bencana",
    "sub1": "Bencana ulah Manusia",
    "sub2": "Banjir"
  },
  "queryTweetObjectId": "57e8df15bfba745728e4e23e",
  "queryTweetContent": "Banjir Capai 70 Cm, Warga Kota Padang Mengungsi  #thisnewsid #indonesia #berita #beritaind…",
  "queryTweetDate": {
    "date": "2016-08-24T07:38:13.000Z",
    "string": "24/08/2016"
  },
  "eventDate": {
    "date": "2016-08-24T07:38:13.000Z",
    "string": "24/08/2016"
  },
  "queryTweetUsername": "ThisNewsID",
  "eventLocation": {
    "latitude": -1,
    "longitude": 100.33333333333331,
    "daerahTingkat2": "Padang",
    "daerahTingkat1": "unknown"
  },
  "threatWarning": "low",
  "timestamp": "2016-09-26T08:43:24.152Z"
}


// { collection : 'news_analysed' });
{ collection : 'analysed_all' });

module.exports = mongoose.model('AnalysedAll', AnalysedAllSchema);