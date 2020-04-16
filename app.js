const   express         = require('express'),
        app             = express(), 
        mongoose        = require('mongoose'),
        bodyParser      = require('body-parser'),
        passport        = require('passport'), 
        passportLocalMongoose = require('passport-local-mongoose'), 
        LocalStrategy   = require('passport-local'),    
        User            = require('./models/user');

//REQUIRE ROUTE FILES:
const   exerciseRoutes  = require('./routes/exercises'), 
        commentRoutes   = require('./routes/comments'),
        indexRoutes     = require('./routes/index'); 

//CONFIGURATION OF mongoose, bodyParser, ejs and setting the use of public folders for CSS; 
mongoose.connect("mongodb://localhost/kinetic", {useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true }); 
app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine', 'ejs'); 
app.use(express.static(__dirname + '/public')); 

//PASSPORT CONFIG 
app.use(require("express-session")({ 
    secret: "Any message can go here apparently",   
    resave: false, 
    saveUninitialized: false
})); 
app.use(passport.initialize()); 
app.use(passport.session()); 
passport.use(new LocalStrategy(User.authenticate())); //comes from passport-local-mongoose
passport.use(User.createStrategy()); 
passport.serializeUser(User.serializeUser()); 
passport.deserializeUser(User.deserializeUser());

app.get('/', (req, res)=>{
    res.send("HOME PAGE!")
}); 

app.use((req, res, next)=>{
    res.locals.currentUser = req.user; 
    next()
});

app.use('/', indexRoutes); 
app.use('/exercises', exerciseRoutes); 
app.use('/exercises/:slug/comments', commentRoutes);

//SET UP PORT: 
app.listen(3000, ()=>{
    console.log("Connected to kinetic!")
})