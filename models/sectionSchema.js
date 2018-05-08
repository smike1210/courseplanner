/*
MongoDB schema that is used for each section of a course
*/

var mongoose = require("mongoose");

var sectionSchema = new mongoose.Schema({
	parentCourse: { //loop through courses to create this
		type: mongoose.Schema.Types.ObjectId,
		ref: "Course"
	},
	parent: String, //for debugging purposes
	term: String,
	//using connected course ID, create a string like "CS 225" to search
	//through cascading courses to find matching one,
	//then loop through DetailedSections

 //meetings - meeting - instructors - loop instructor
	professors: [{
		type: String
	}],
	location: String, 	//meetings - meeting  -buildingName
	GPA: Number, //hardcoded for now? not sure on this one
	open: String, // need to find where to get this info
	timeStart: String,  //meetings - meetings  - start and end
	timeEnd: String,
	days: String,
	type: String,
	section: String,
});

module.exports = mongoose.model("Section", sectionSchema);
