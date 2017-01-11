// app/models/bear.js

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var AnalysedInfoSchema  = new Schema({
	_id: String,
    dataSource: String,
    sourceMongoHost: String,
    sourceMongoPort: String,
    sourceDbName: String,
    sourceCollection: String,
    categoryMain: String,
    categorySub1: String,
    categorySub2: String,
    sourceObjectId: String,
    contentSubject: String,
    eventDateDate: Date,
    eventDateString: String,
    contentLocator: String,
    threatWarning: String,
    timeStamp: Date
}, 
// { collection : 'news_analysed' });
{ collection : 'analysed_info' });

module.exports = mongoose.model('AnalysedInfo', AnalysedInfoSchema);