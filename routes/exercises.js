const   express     = require('express'), 
        router      = express.Router(), 
        Exercise    = require('../models/exercise'),
        Comment     = require('../models/comment');

router.get('/', (req, res)=>{
    Exercise.find({}, (err, exercise)=>{
        if(err){
            console.log(err); 
        }
        res.render('./exercises/index', {exercise:exercise}); 
    }); 
}); 

module.exports = router; 