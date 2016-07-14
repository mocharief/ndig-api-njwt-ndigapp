// app/models/bear.js

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var PesanSchema  = new Schema({
    dari: String,
    type: String,
    penerima: String,
    date: Date,
    pesan: String
});

module.exports = mongoose.model('Pesan', PesanSchema);