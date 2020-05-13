const       express     = require('express'), 
            router      = express.Router({mergeParams: true}),
            middleware  = require('../middleware/index'),
            Reference   = require('../models/reference'),  
            Exercise    = require('../models/exercise'); 

// GET NEW REFERENCE PAGE: 
router.get('/new', middleware.isLoggedIn, (req, res)=>{
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
router.post('/', middleware.isLoggedIn, (req, res)=>{
    Exercise.findOne({slug: req.params.slug}, (err, foundExercise)=>{
        if(err || !foundExercise){
            console.log("ERROR FIND EXERCISE: " + err); 
            req.flash('error', 'Unable to add reference to ' + foundExercise.name + '.'); 
            return res.redirect('back'); 
        }

        //express-sanitizer 
        req.body.reference.authors  = req.sanitize(req.body.reference.authors);
        req.body.reference.title    = req.sanitize(req.body.reference.title);
        req.body.reference.journal  = req.sanitize(req.body.reference.journal); 
        req.body.reference.year     = req.sanitize(req.body.reference.year); 

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
            req.flash('success', 'Reference added!')
            res.redirect('/exercises/' + foundExercise.slug); 
        }); 
    }); 
}); 

//GET REQUEST FOR EDIT FILE
router.get('/:ref_id/edit', middleware.referenceOwnership, (req, res)=>{
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

// UPDATE REFERENCES ROUTES
router.put('/:ref_id', middleware.referenceOwnership, (req, res)=>{
    Exercise.findOne({slug:req.params.slug}, (err, exercise)=>{
        if(err){
            console.log('ERROR FINDING EXERCISE FOR REFERENCE TO EDIT: ' + err);
            req.flash('erorr', 'Unable to update reference now. Please try again later.') 
            return res.redirect('back'); 
        } else {
            //express-sanitizer 
            req.body.reference.authors  = req.sanitize(req.body.reference.authors);
            req.body.reference.title    = req.sanitize(req.body.reference.title);
            req.body.reference.journal  = req.sanitize(req.body.reference.journal); 
            req.body.reference.year     = req.sanitize(req.body.reference.year); 
            Reference.findByIdAndUpdate(req.params.ref_id, req.body.reference, (err, reference)=>{
                if(err){
                    console.log('ERROR UPDATING REFERENCE: ' + ref);
                }
                req.flash('success', 'Successfully updated reference.'); 
                res.redirect('/exercises/' + exercise.slug); 
            });
        }
    }); 
});

//DELETE DESTROY ROUTE 
router.delete('/:ref_id', middleware.referenceOwnership, (req, res)=>{
    Reference.findByIdAndRemove(req.params.ref_id, (err, ref)=>{
        if(err){
            console.log('ERROR FINDING REFERENCE TO DELETE'); 
            req.flash('error', 'Unable to delete reference now.'); 
            return res.redirect('back'); 
        } else{
            console.log('Reference deleted'); 
            req.flash('success', 'Reference successfully deleted.'); 
            res.redirect('/exercises/' + req.params.slug); 
        }
    }); 
})

module.exports=router; 