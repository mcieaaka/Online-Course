var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var passport = require("passport");

var userSchema= new mongoose.Schema({
    email: {type:String,
        required:true
    },
    insta: String,
    bio: String,
    created:{type:Date , default:Date.now}
});
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("user",userSchema);