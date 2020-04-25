const       express     = require('express'), 
            router      = express.Router({mergeParams: true}),
            Reference   = require('../models/reference');  
            Exercise    = require('../models/exercise'); 

// GET NEW REFERENCE PAGE: 
router.get('/new', (req, res)=>{
    Exercise.findOne({slug:req.params.slug}, (err, foundExercise)=>{
        if(err || !foundExercise){
            console.log("ERROR FINDING EXERCISE: " + err);
            return res.redirect('back');  
        } else {
            res.render('./references/new', {exercise: foundExercise}); 
        }
    }); 
}); 

//POST NEW REFERENCE: 
router.post('/', (req, res)=>{
    Exercise.findOne({slug: req.params.slug}, (err, foundExercise)=>{
        if(err || !foundExercise){
            console.log("ERROR FIND EXERCISE: " + err); 
            return res.redirect('back'); 
        }
        Reference.create(req.body.reference, (err, createdRef)=>{
            if(err){
                console.log('ERROR CREATING REFERENCE: ' + err); 
                return res.redirect('back'); 
            }
            createdRef.author.id = req.user._id; 
            createdRef.author.username = req.user.username; 
            createdRef.save(); 

            foundExercise.reference.push(createdRef); 
            foundExercise.save(); 

            console.log('SUCCESSFULLY SAVED REFERENCE' + createdRef); 
            res.redirect('/exercises/' + foundExercise.slug); 
        }); 
    }); 
}); 

module.exports=router; 