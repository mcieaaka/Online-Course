const mongoose = require('mongoose');

var MessageSchema = mongoose.Schema({
    name:String,
    email:String,
    mesg:String,
    created:{type:Date, default:Date.now}
});

module.exports = mongoose.model('Message',MessageSchema);