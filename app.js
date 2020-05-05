const   express         = require('express'),
        app             = express(), 
        mongoose        = require('mongoose'),
        flash           = require('connect-flash'), 
        bodyParser      = require('body-parser'),
        passport        = require('passport'),  
        LocalStrategy   = require('passport-local'), 
        methodOverride  = require('method-override'), 
        FraolaEditor    = require('./node_modules/wysiwyg-editor-node-sdk/lib/froalaEditor');   
        User            = require('./models/user'), 
        dotenv          = require('dotenv'), 
        seedDB          = require('./seeds');

//REQUIRE ROUTE FILES:
const   exerciseRoutes  = require('./routes/exercises'), 
        commentRoutes   = require('./routes/comments'),
        indexRoutes     = require('./routes/index'), 
        referenceRoutes = require('./routes/references'); 

        dotenv.config({path: __dirname + '/.env'});

//CONFIGURATION OF mongoose, bodyParser, ejs and setting the use of public folders for CSS; 
mongoose.connect(process.env.DATABASEURL, {useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true, useFindAndModify:false }); 
app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine', 'ejs'); 
app.use(express.static(__dirname + '/public'));  
app.use(methodOverride('_method'));
// seedDB();  
app.use(flash());

// MOMENT JS = needs to go above passport config
app.locals.moment = require('moment'); 
 
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

//Allows passing of these objects into all routes. 
app.use((req, res, next)=>{
    res.locals.currentUser = req.user; 
    res.locals.error = req.flash('error'); 
    res.locals.success = req.flash('success'); 
    next();
});

//MUST BE BELOW PASSPORT CONFIGURATION! 
app.use('/', indexRoutes); 
app.use('/exercises', exerciseRoutes); 
app.use('/exercises/:slug/comments', commentRoutes);
app.use('/exercises/:slug/references', referenceRoutes); 

//SET UP PORT: 
app.listen(3000, ()=>{
    console.log("Connected to kinetic!")
});