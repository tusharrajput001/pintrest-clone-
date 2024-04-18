var express = require("express");
var router = express.Router();
const userModel = require("./users");
const postModel = require("./post");
const passport = require("passport");
const upload = require("./multer");

const localStrategy = require('passport-local');
passport.use(new localStrategy(userModel.authenticate()));

//HOME ROUTE

router.get("/", function (req, res, next) {
  res.render('index',{title:"Express"});
});

// PROFILE ROUTES

router.get("/profile",isLoggedIn, async function (req, res, next) {
    const user = await userModel.findOne({
    username : req.session.passport.user,
  })
  res.render("profile",{user});
});


// LOGIN ROUTES

router.get("/login", function (req, res, next) {
  res.render("login",{error: req.flash('error')});
});

router.post("/login",passport.authenticate("local",{
  successRedirect:"/profile",
  failureRedirect:"/login",
  failureFlash:true,
}), function (req, res, next) {
});


// REGISTER ROUTES
router.post("/register", function(req,res){
  const { username, email, fullname } = req.body;
  const userData = new userModel({ username, email, fullname });
  
  userModel.register(userData, req.body.password)
  .then(function(){
    passport.authenticate("local")(req,res,function(){
      res.redirect("/profile");
    })
  })
})


// LOGOUT ROUTES

router.get("/logout", function (req,res) {
  req.logout(function(err){
    if(err){
      return next(err);
    }
    res.redirect("/");
  });
});


// FEED ROUTE

router.get("/feed",function (req,res) {
  res.render("feed");
})

// UPLOAD ROUTE

router.post("/upload",upload.single("file"),function (req,res) {
  if(!req.file){
    res.status(404).send("no file were given")
  }
  res.send("File uploaded successfully");
})





function isLoggedIn(req,res,next) {  
  if(req.isAuthenticated()) return next();
  res.redirect("/login");
}

module.exports = router;
