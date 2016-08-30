// app/models/bear.js

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var TwitterSchema  = new Schema({
    user: String,
    tweet: String,
    date: Date,
    location: String,
    geolocation: String
});

module.exports = mongoose.model('Twitter', TwitterSchema);