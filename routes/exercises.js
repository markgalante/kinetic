const   express     = require('express'), 
        router      = express.Router(), 
        multer      = require('multer'),
        Exercise    = require('../models/exercise'),
        Comment     = require('../models/comment');

const muscles = require ('../public/muscles.json'); 

// EXERCISE INDEX ROUTE 
router.get('/', (req, res)=>{
    Exercise.find({}, (err, exercise)=>{
        if(err){
            console.log(err); 
        }
        res.render('./exercises/index', {exercise:exercise}); 
    }); 
}); 

// NEW EXERCISE ROUTE
router.get('/new', (req, res)=>{
    res.render('./exercises/new', {muscles: muscles}); 
}); 

// NEW EXERCISE POST ROUTE 
router.post('/', (req, res)=>{
    const exercise = new Exercise({
        name: req.body.name, 
    }); 
    console.log("REQ BODY NAME BEFORE CREATE" + req.body.name)
    Exercise.create(exercise, (err, newlyCreate)=>{
        if(err){
            console.log("EXERCISE CREATE ERROR MESSAGE: " + err);
            console.log("REQ.BODY.EXERCISE: " + req.body.exercise); 
            return res.redirect("back");  
        }
        console.log(newlyCreate); 
        res.redirect("/exercises"); 
    }); 
}); 

module.exports = router; 