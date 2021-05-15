const mongoose = require('mongoose');

var CourseSchema = mongoose.Schema({
    name:String,
    description:String,
    lectures:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Lecture"
        }
    ]
});

module.exports = mongoose.model('Course',CourseSchema);