const   middlewareObj   = {}, 
        Exercise        = require('../models/exercise'), 
        Comment         = require('../models/comment'), 
        User            = require('../models/user'); 

//Checking ownership of an exercise. 
middlewareObj.exerciseOwnership = (req, res, next) => {
    if(req.isAuthenticated()){
        Exercise.findOne({slug:req.params.slug}) 
        .then(foundExercise =>{
            if(foundExercise.author.id.equals(req.user._id)){
                next(); 
            } else{
                req.flash('error', "You don't have permission to do that"); 
                res.redirect('/exercises/'+ foundExercise.slug); 
            }
        })
        .catch(() => {
            req.flash('error', 'Error finding exercise. Please try again later'); 
            res.redirect('/exercises'); 
        }); 
    } else {
        req.flash('error', 'You need to be logged in to do that.'); 
        res.redirect('/exercises'); 
    }
}


// Determining if user is logged in.
middlewareObj.isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()){
        return next(); 
    } else {
        req.flash('error', 'You need to be logged in to do that.'); 
        res.redirect('/login'); 
        console.log('You need to be logged in to do that.');
    }
}

module.exports = middlewareObj; 