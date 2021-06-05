var express        = require("express"),
    bodyParser     = require("body-parser"),
    mongoose       = require("mongoose"),
    app            = express(),
    passport       = require("passport"),
    LocalStrategy  = require("passport-local"),
    user           = require("./models/user"),
    course         = require("./models/course"),
    lecture        = require("./models/lecture"),
    methodOverride = require("method-override"),
    message        = require("./models/message");

app.use('/uploads', express.static('uploads'));
const multer = require("multer");
const storage = multer.diskStorage({
    destination:function(req, file,cb){
        cb(null,'./uploads');
    },
    filename: function(req, file,cb){
        const fileName = file.originalname.toLowerCase().split(' ').join('-');
        cb(null, fileName)
    }
})

const fileFilter=(req,file,cb)=>{
    if(file.mimetype==='image/jpeg'|| file.mimetype == "image/jpg" ||file.mimetype==='image/png'){
        cb(null,true);
    }else{
        cb(null,false);
    }
}

const upload = multer({
    storage:storage,
    limits:{
        fileSize:1024*1024
    },
    fileFilter:fileFilter
});

mongoose.connect("mongodb://localhost/iwpproj",{ useNewUrlParser: true, useUnifiedTopology: true });
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));

app.use(methodOverride("_method"));



app.use(express.static(__dirname + '/public'));

//PASSPORT CONFIG
app.use(require("express-session")({
    secret:"Burn in Hell",
    resave:false,
    saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

app.use(function(req,res,next){
    res.locals.currUser = req.user;
    next();
});
//===================
//ROUTES
//===================
app.get('/',(req,res)=>{
    res.render("home");
});
//MESSAGES
app.post("/mesg",(req,res)=>{
    const m = req.body;
    message.create(m,(err,nm)=>{
        if(err){
            console.log(err);
        }else{
            res.redirect("/");
        }
    })
})
//profile
app.get("/user/:id",isLoggedIn,async(req,res)=>{
    const u = await user.findById(req.params.id);
    res.render("profile",{u});
})

//===================
//ADMIN
//===================
app.get("/admin",isLoggedIn,async(req,res)=>{
    if(req.user.username=="ADMIN"){
        res.render("adminctrl");
    }else{
        res.send("<h1>PLEASE LOGIN AS ADMIN</h1>")
    }
})
//View Messages
app.get("/admin/messages",isLoggedIn,async(req,res)=>{
    if(req.user.username=="ADMIN"){
        const m = await message.find({});
        res.render("admesg",{m});
    }else{
        res.send("<h1>PLEASE LOGIN AS ADMIN</h1>")
    }
})
//View Users
app.get("/admin/allusers",isLoggedIn,async(req,res)=>{
    if(req.user.username=="ADMIN"){
        const u = await user.find({});
        res.render("adalluser",{u});
    }else{
        res.send("<h1>PLEASE LOGIN AS ADMIN</h1>")
    }
})
//Add Course
app.get("/admin/newcourse",isLoggedIn,async(req,res)=>{
    if(req.user.username=="ADMIN"){
        res.render("adcourse");
    }else{
        res.send("<h1>PLEASE LOGIN AS ADMIN</h1>")
    }
})
app.post("/admin/newcourse",isLoggedIn,async(req,res)=>{
    if(req.user.username=="ADMIN"){
        var c = req.body;
        course.create(c,(err,nc)=>{
            if(err){
                console.log(err);
            }else{
                res.redirect("/admin");
            }
        })
    }else{
        res.send("<h1>PLEASE LOGIN AS ADMIN</h1>")
    }
})
app.get("/admin/addlectures",isLoggedIn,async(req,res)=>{
    if(req.user.username=="ADMIN"){
        const c = await course.find({});
        res.render("adaddlec",{c});
    }else{
        res.send("<h1>PLEASE LOGIN AS ADMIN</h1>")
    }
})
app.get("/admin/addlectures/:id",isLoggedIn,async(req,res)=>{
    if(req.user.username=="ADMIN"){
        const cid = req.params.id;
        res.render("adlecture",{cid});
    }else{
        res.send("<h1>PLEASE LOGIN AS ADMIN</h1>")
    }
})
app.post("/admin/addlectures/:id",isLoggedIn,function(req,res){
    course.findById(req.params.id,function(err,cou){
        if(err){
            console.log(err);
        }else{
            lecture.create(req.body,function(err,resp){
                if(err){
                    console.log(err);
                }else{
                    cou.lectures.push(resp);
                    cou.save();
                    res.redirect("/admin/addlectures");
                }
            })
        }
    })
})


//===================
//VIEW ROUTES
//===================

//ALL COURSES
app.get("/viewall",isLoggedIn,async(req,res)=>{
    const c = await course.find({});
    res.render("viewcourses",{c});
})

//COURSE CONTENT
app.get("/view/:cid",isLoggedIn,(req,res)=>{
    course.findById(req.params.cid).populate("lectures").exec((err,co)=>{
        if(err){
            console.log(err);
        }else{
            res.render("viewc",{co});
        }
    })
})
//VIDEO VIEW

//===================
//AUTH
//===================

//SIGNUP
app.get("/signup",function(req,res){
    res.render("signup");
});
app.post("/signup",upload.single('userimage'),(req,res)=>{
    try{
        console.log(req.file);
        var {username,password,email,insta,bio}= req.body;
        var userimage = req.file.path;
        const usep = new user({username,email,insta,bio,userimage});
        const reguser = user.register(usep,password,(err,u)=>{
            if(err){
                console.log(err);
            }else{
                passport.authenticate("local")(req,res,function(){
                res.redirect("/");
            })
            }
        });
    }catch(e){
        console.log("Error:",e.message);
        res.redirect("/signup");
    }
    
});

//Login
app.get("/login",function(req,res){
    res.render("login");
});
app.post("/login",passport.authenticate("local",
    {
        successRedirect:"/",
        failureRedirect:"/login",
    }),function(req,res){
});
//Logout
app.get("/logout",function(req,res){
    req.logout();
    res.redirect("/");
});
//middleware
function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

var port =process.env.PORT || 8000;
app.listen(port, ()=>{
    console.log("Started");
})