// app/models/bear.js

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var BearSchema   = new Schema({
    name: String
});

// var IntelSchema   = new Schema({
//     dari: String,
//     type: String,
//     penerima: String,
//     date: Date,
//     pesan: String
// });

module.exports = mongoose.model('Bear', BearSchema);
// module.exports = mongoose.model('Intel', IntelSchema);