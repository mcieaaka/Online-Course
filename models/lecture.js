const mongoose = require('mongoose');

var LectureSchema = mongoose.Schema({
    name:String,
    description:String,
    inst:String,
    link:String,
});

module.exports = mongoose.model('Lecture',LectureSchema);