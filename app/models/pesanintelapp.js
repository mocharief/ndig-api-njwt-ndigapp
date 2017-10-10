var mongoose    = require('mongoose');
var Schema      = mongoose.Schema;

var PesanIntelAppSchema  = new Schema ({
    laporan: String,
    category: String,
    date: Date,
    type: String,
    dari: String,
    lokasi: Object,
    attachmentInfo: Object
});

module.exports = mongoose.model('PesanIntelApp', PesanIntelAppSchema);