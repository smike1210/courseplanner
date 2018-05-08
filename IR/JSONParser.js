/*
code to seed the database with course info. Before running, XMLParser.js has
to be run first to get desried data.
*/


var fs = require('fs')
var mongoose = require("mongoose");
var course = require("../models/courseSchema");
var section   = require("../models/sectionSchema");

// seeding the database for course info. Currently, a lot of this is hardocrded.
// This will all be dynamic in the future
function seedDB(){
  var requiredCourses = ["CS 100", "CS 125", "CS 126", "CS 173", "CS 210", "CS 225", "CS 233", "CS 241", "CS 357", "CS 361", "CS 374", "CS 421"]
  var averageGPA = {
    CS100: 3.78,
    CS101: 3.17,
    CS105: 3.51,
    CS125:  3.40,
    CS126:  3.76,
    CS173:  3.09,
    CS196:  3.78,
    CS199:  3.84,
    CS210:  3.55,
    CS225:  3.17,
    CS233:  2.88,
    CS241:  2.79,
    CS242:  3.36,
    CS296:  3.69,
    CS357:  2.96,
    CS361:  3.37,
    CS374:  2.50,
    CS410:  3.86,
    CS411:  3.27,
    CS412:  3.06,
    CS419:  3.50,
    CS420:  3.24,
    CS423:  3.64,
    CS424:  3.54,
    CS426:  3.39,
    CS428:  3.67,
    CS429:  3.44,
    CS431:  2.87,
    CS438:  2.84,
    CS440:  3.14,
    CS445:  3.40,
    CS446:  3.35,
    CS447:  3.50,
    CS450:  3.15,
    CS460:  3.62,
    CS461:  2.92,
    CS463:  3.41,
    CS465:  3.15,
    CS466:  3.42,
    CS467:  3.69,
    CS473:  2.46,
    CS484:  3.10,
    CS493:  3.59,
    CS494:  3.61,
    CS498:  3.17
  }
  var courseMap = {}
  courseData = []
  sectionData = []
  // course class that stores class info. Pass in json objects that is ontained
  // from course explorer api
  class Course{
    constructor(x,obj){
      this.college = obj["ns2:subject"]["label"][0]
      this.abrCollege = obj["ns2:subject"]["$"]["id"]
      var listOfCourses = obj["ns2:subject"]["cascadingCourses"][0]["cascadingCourse"]
      this.courseName = listOfCourses[x]["label"][0]
      this.courseDescription = listOfCourses[x]["description"][0]
      this.scheduling = ""
      try{
          this.scheduling = listOfCourses[x]["classScheduleInformation"][0] // I think this is different for 2017
      }
      catch(error){}
      this.number = listOfCourses[x]["detailedSections"][0]["detailedSection"][0]["parents"][0]["course"][0]["$"]["id"]
      this.creditHours = listOfCourses[x]["creditHours"][0]
      this.avgGPA = -1 //default if it does not exist
      var shortAbr = this.abrCollege + this.number
      if(averageGPA.hasOwnProperty(shortAbr)){
        this.avgGPA = averageGPA[shortAbr]
      }
      var tempLocations = listOfCourses[x]["detailedSections"][0]["detailedSection"][0]["meetings"][0]["meeting"][0]["buildingName"]
      this.generalLocations = []
      if(tempLocations != undefined){
        this.generalLocations =tempLocations
      }
      this.courseInfo = listOfCourses[x]["courseSectionInformation"][0];
      this.infoCourses = [] // to be completed later
      this.required = false //default
      var fullAbr = this.abrCollege + " "+ this.number
      if(requiredCourses.indexOf(fullAbr) > -1){
        this.required = true
      }
      var tempTags = []
      if(listOfCourses[x]["genEdCategories"]!=undefined){
          listOfCourses[x]["genEdCategories"].forEach(function(ele){
            var temp = ele["category"][0]["description"][0]
            if(temp != undefined){
              tempTags.push(temp)
            }
          })
      }
      this.requirementTags = tempTags
    }
  }

  // section class that stores section info for a class info. Pass in json objects that is ontained
  // from course explorer api
  class Section{
    constructor(x,i,obj){
      this.term = obj["ns2:subject"]["parents"][0]["term"][0]["_"]
      var course = obj["ns2:subject"]["cascadingCourses"][0]["cascadingCourse"][x];
      var section = course["detailedSections"][0]["detailedSection"][i]
      this.parent = obj["ns2:subject"]["$"]["id"] + " " + course["detailedSections"][0]["detailedSection"][0]["parents"][0]["course"][0]["$"]["id"]
      var tempProfessors =section["meetings"][0]["meeting"][0]["instructors"][0]["instructor"]
      this.professors = []
      try{
        var tprofessors = []
        tempProfessors.forEach(function(ele){
          tprofessors.push(ele["_"])
        })
        this.professors = tprofessors
      }
      catch(error){}
      this.location = ""
      try{
        this.location = section["meetings"][0]["meeting"][0]["buildingName"][0] + " "+section["meetings"][0]["meeting"][0]["roomNumber"][0]
      }
      catch(error){}
      this.GPA = -1 //hardcoded for now
      this.open = section["enrollmentStatus"][0]
      this.timeStart = ""
      try{
          this.timeStart = section["meetings"][0]["meeting"][0]["start"][0]
      }
      catch(error){}
      this.timeEnd = ""
      try{
          this.timeEnd = section["meetings"][0]["meeting"][0]["end"][0]
      }
      catch(error){}
      this.days = ""
      try{
          this.days = section["meetings"][0]["meeting"][0]["daysOfTheWeek"][0].trim()
      }
      catch(error){}
      this.type = section["meetings"][0]["meeting"][0]["type"][0]["_"]
      this.section = ""
      try{
        this.section = section["sectionNumber"][0]
      }
      catch(error){}
    }
  }


  // when seeding, first remove all the couse and section data, then call the
  // course explorer api to get updated information
  course.remove({},function(err){
    if(err){
        console.log(err);
    } else {
      section.remove({},function(err){
        if(err){
          console.log(err);
        } else {
          fs.readFile('./IR/Files/2018Data.json', 'utf8', function (err, data) {
              if (err) throw err; // we'll not consider error handling for now
              var obj = JSON.parse(data)
              var courseLength = obj["ns2:subject"]["cascadingCourses"][0]["cascadingCourse"].length
              for(x = 0; x < courseLength; x++){
                  courseData.push(new Course(x,obj))
                  var sectionLength = obj["ns2:subject"]["cascadingCourses"][0]["cascadingCourse"][x]["detailedSections"][0]["detailedSection"].length
                  for(i = 0; i < sectionLength; i++){
                    sectionData.push(new Section(x,i,obj))
                  }
              }
              var count = 0
              courseData.forEach(function(seed){
                course.create(seed,function(err,course){
                  if(err){
                    console.log(err)
                  } else{
                    console.log("course added "+count.toString())
                    count = count + 1
                    var name = course.abrCollege + " " + course.number
                    courseMap[name] = course.id
                    var ready = true
                    {
                      var templength = sectionData.length
                      var tempcount = 0
                      sectionData.forEach(function(seeds){
                        if(seeds.parent == name){
                          seeds.parentCourse = course.id
                          section.create(seeds,function(err,section){
                            if(err){
                              console.log(err)
                            } else{
                              var actual = ""
                            }
                          })
                        }
                      })
                    }
                  }
                })
              })
          })
        }
      })
    }
  })
}

module.exports = seedDB;
