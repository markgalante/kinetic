const   express         = require('express'),
        app             = express(), 
        mongoose        = require('mongoose'),
        bodyParser      = require('body-parser');  

//REQUIRE ROUTE FILES:
const   exerciseRoutes  = require('./routes/exercises'), 
        commentRoutes   = require('./routes/comments'),
        indexRoutes     = require('./routes/index'); 

app.use('/', indexRoutes); 
app.use('/exercises', exerciseRoutes); 
app.use('/exercises/:slug/comments', commentRoutes);

//CONFIGURATION OF mongoose, bodyParser, ejs and setting the use of public folders for CSS; 
mongoose.connect("mongodb://localhost/kinetic", {useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true }); 
app.use(bodyParser.urlencoded( {extended:true} )); 
app.set('view engine', 'ejs'); 
app.use(express.static(__dirname + '/public')); 

//CONFIGURE PASSPORT: 
 

//SET UP PORT: 
app.listen(3000, ()=>{
    console.log("Connected to kinetic!")
})