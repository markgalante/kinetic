const   express     = require('express'), 
        router      = express.Router(), 
        Exercise    = require('../models/exercise'),
        Comment     = require('../models/comment');

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
    res.render('./exercises/new'); 
}); 

// NEW EXERCISE POST ROUTE 
router.post('/', (req, res)=>{
    Exercise.create(req.body.exercise, (err, newlyCreate)=>{
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