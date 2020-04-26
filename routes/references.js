const       express     = require('express'), 
            router      = express.Router({mergeParams: true}),
            Reference   = require('../models/reference'),  
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

//GET REQUEST FOR EDIT FILE
router.get('/:ref_id/edit', (req, res)=>{
    Exercise.findOne({slug: req.params.slug}, (err, exercise)=>{
        if(err){
            console.log("ERROR FINDING EXERCISE: " + err); 
            return res.redirect('back'); 
        } else{
            Reference.findById(req.params.ref_id, (err, reference)=>{
                if(err){
                    console.log('ERROR FINDING REFERENCE: ' + err); 
                    return res.redirect('back'); 
                } else {
                    res.render('./references/edit', {exercise:exercise, reference:reference}); 
                }
            }); 
        }
    });
}); 

router.put('/:ref_id', (req, res)=>{
    Exercise.findOne({slug:req.params.slug}, (err, exercise)=>{
        if(err){
            console.log('ERROR FINDING EXERCISE FOR REFERENCE TO EDIT: ' + err); 
            return res.redirect('back'); 
        } else {
            Reference.findByIdAndUpdate(req.params.ref_id, req.body.reference, (err, reference)=>{
                if(err){
                    console.log('ERROR UPDATING REFERENCE: ' + ref);
                }
                res.redirect('/exercises/' + exercise.slug); 
            });
        }
    }); 
});

module.exports=router; 