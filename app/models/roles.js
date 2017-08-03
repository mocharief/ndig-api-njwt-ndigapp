var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

// var privilege = Boolean(Array[
//     viewDashboard, viewintel, viewkategori, viewusermanagement, CRUD
// ])

var RoleSchema  = new Schema ({
    rolename: {
        type: String,
        required: true
    },
    viewDashboard: Boolean,
    vewCategory: Boolean,
    viewThreat: Boolean,
    viewIntel: Boolean,
    viewNews: Boolean,
    viewUserManage: Boolean,
    viewCRUD: Boolean
})

module.exports = mongoose.model('Roles', RoleSchema);