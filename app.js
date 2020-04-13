const   express         = require('express'),
        mongoose        = require('mongoose'),
        bodyParser      = require('body-parser');  

const   app = express(); 

//CONFIGURATION OF mongoose, bodyParser, ejs and setting the use of public folders for CSS; 
mongoose.connect("mongodb://localhost/kinetic", {useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true }); 
app.use(bodyParser.urlencoded( {extended:true} )); 
app.set('view engine', 'ejs'); 
app.use(express.static(__dirname + '/public')); 

//CONFIGURE PASSPORT: 

app.get("/", (req, res)=>{
    res.send("CONNECTED"); 
});

app.get("/:dog", (req, res)=>{
    res.send("My favourite dog is " + req.params.dog); 
}); 

//SET UP PORT: 
app.listen(3000, ()=>{
    console.log("Connected to kinetic!")
})