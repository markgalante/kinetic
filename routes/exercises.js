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

module.exports = router; 