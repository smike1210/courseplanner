/*
MongoDB schema that is used for each user
*/

var mongoose = require("mongoose");

var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
	username: String,
	password: String,
	email : String,
	coursesTaken: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: "Courses"
	}],
	favoritesPlanned: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: "Courses"
	}],
	address: String
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
