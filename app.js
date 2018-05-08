var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    passport    = require("passport"),
    LocalStrategy = require("passport-local"),
    Course  = require("./models/courseSchema"),
    Section     = require("./models/sectionSchema"),
    User        = require("./models/userSchema"),
    seedDB      = require("./IR/JSONParser"),
    flash       = require("connect-flash"),
    path = require('path'),
    methodOverride = require("method-override")

mongoose.Promise = global.Promise;
//uncomment if using local host
//mongoose.connect("mongodb://localhost/courseRun");
//online host for the mongoDB that is being used
mongoose.connect("mongodb://Mike:courserun@ds155288.mlab.com:55288/course-run")
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, 'public')));
//app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());


app.use(require("express-session")({
    secret: "Mike Shea is a pretty cool person", // ha
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   next();
});

// uncomment if you want to seed the database with new data.
// See the IR folder for more info
//seedDB();


// main landing page
app.get("/", function(req, res){
    res.render("index.ejs");
});

// search page
app.get("/search", function(req, res){
  Section.find({},function(err, Sections){
    if(err){
      console.log(err.message)
    } else {
      res.render("search.ejs", {sections: Sections});
    }
  })
});

// register page
app.get("/register", function(req, res){
    res.render("register.ejs");
});

// results page. Use query that user entered to find data in database to return
// and then pass that info the rendered page
app.get("/results", function(req, res){
    var query = req.url
    var lg = 0
    if(query.indexOf("zero")!==-1) {
      lg = 0
    } else if(query.indexOf("one")!==-1) {
      lg = 1
    } else if(query.indexOf("two")!==-1){
      lg = 2
    } else if(query.indexOf("three")!==-1){
      lg = 3
    }
    var cs = query.indexOf("college=")+8;
    var ce = query.indexOf("professor=")-1;
    var colleges = query.substring(cs,ce)
    var ns = query.indexOf("num=")+4;
    var ne = query.indexOf("college=")-1;
    var numbert =  query.substring(ns,ne)
    var ps = query.indexOf("professor=")+10;
    var pe = query.length
    var professors = query.substring(ps,pe)
    professors = professors.replace("%2C", ",")
    professors = professors.replace("+", " ")
    if(colleges == "Choose..."){
      colleges = ""
    }
    if(professors == "Choose..."){
      professors = ""
    }
    if(numbert != ""){
      Course.find({avgGPA: { $gt : lg}, abrCollege: "CS" , number:numbert}, function(err,Courses){
        if(err){
          console.log(err.message)
        } else {
          res.render("results.ejs" , {courses : Courses});
        }
      })
    } else {
      Course.find({avgGPA: { $gt : lg}, abrCollege:"CS"}, function(err,Courses){
        if(err){
          console.log(err.message)
        } else {
          //console.log(Courses)
          res.render("results.ejs" , {courses : Courses});
        }
    })
  }

});

// login page
app.get("/login", function(req, res){
    res.render("login.ejs");
});

// setup aaccount once initial acount created. Pass in info of courses so user
// can say what courses they have taken and plan to take
app.get("/accountsetup/:id", function(req, res){
  Course.find({},function(err, Courses){
    if(err){
      console.log(err.message)
    } else {
      res.render("accountsetup.ejs", {user_id: req.params.id, courses: Courses});
    }
  })

});

// posting user data to be registered
app.post("/register", function(req, res){
    var newUser = new User({email: req.body.username, username:req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err.message);
            // if error, send back to register page
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function(){
           res.redirect("/accountsetup/"+user.id);
        });
    });
});

// update user info in DB once they have finished their account setup and send
// user to search page
app.put("/accountsetup/:id", function(req, res){
   User.findByIdAndUpdate(req.params.id, {address: req.body.street+" "+req.body.town+" "+req.body.state+" "+req.body.zip}, function(err, user){
      if(err){
          res.redirect("index");
      } else {
        if(req.body.taken){
          if(typeof(req.body.taken)=="string"){
              var splitName = req.body.taken.split(" ")
              Course.find({abrCollege:splitName[0], number:splitName[1]}, function(err,result){
                if(err){
                  console.log(err.message)
                } else {
                  if(result.length>0){
                    user.coursesTaken.push(result[0])
                    user.save()
                  }
                }
              })
          } else{
            req.body.taken.forEach(function(ele){
              var splitName = ele.split(" ")
              Course.find({abrCollege:splitName[0], number:splitName[1]}, function(err,result){
                if(err){
                  console.log(err.message)
                } else {
                  if(result.length>0){
                    user.coursesTaken.push(result[0])
                    user.save()
                  }
                }
              })
            })
          }
        }

        if(req.body.favorited){
          if(typeof(req.body.favorited)=="string"){
              var splitName = req.body.favorited.split(" ")
              Course.find({abrCollege:splitName[0], number:splitName[1]}, function(err,result){
                if(err){
                  console.log(err.message)
                } else {
                  if(result.length>0){
                    user.favoritesPlanned.push(result[0])
                    user.save()
                  }
                }
              })
          } else{
            req.body.favorited.forEach(function(ele){
              var splitName = ele.split(" ")
              Course.find({abrCollege:splitName[0], number:splitName[1]}, function(err,result){
                if(err){
                  console.log(err.message)
                } else {
                  if(result.length>0){
                    user.favoritesPlanned.push(result[0])
                    user.save()
                  }
                }
              })
            })
          }
        }
          res.redirect("/search");
      }
   });
});

// check credentials and redirect where necesary
app.post("/login", passport.authenticate("local",
    {
        successRedirect: "/search",
        failureRedirect: "/login"
    }), function(req, res){
});

//logout page
app.get("/logout", function(req, res){
   req.logout();
   res.redirect("/")
});

// specific course page when user selects course
app.get("/course/:id", function(req, res){
    Course.findById(req.params.id, function(err,course){
      if(err){
        console.log(err)
      } else {
        Section.find({parentCourse:course}, function(err,result){
          if(err){
            console.log(err.message)
          } else {
            res.render("course", {mainCourse:course, sections: result});
        }
      })
    }
  })
});

// main landing page
app.get("/", function(req, res){
    res.render("home");
});

//go to about page
app.get("/about", function(req, res){
    res.render("about");
});

// for local host
app.listen(3000, function(){
   console.log("The Server Has Started!");
});

// for web hosting
// app.listen(process.env.PORT, process.env.IP);
