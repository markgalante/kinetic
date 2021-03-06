const   middlewareObj   = {}, 
        Exercise        = require('../models/exercise'), 
        Comment         = require('../models/comment'), 
        Reference       = require('../models/reference'),
        User            = require('../models/user'); 

notLoggedIn = (req, res) => {
    req.flash('error', 'You need to be logged in to do that.'); 
    res.redirect('/login'); 
}        

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
        notLoggedIn(req, res);
    }
}

// Check comment ownership: 
middlewareObj.commentOwnership = (req, res, next) => {
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, (err, foundComment)=>{
            if(err){
                req.flash('error', 'Error finding comment. Please try again later'); 
                return res.redirect('/exercises'); 
            } else {
                if(foundComment && foundComment.author.id.equals(req.user._id)){
                    next(); 
                } else{
                    req.flash('error', "You don't have permission to do that"); 
                    res.redirect('/exercises/'+ req.params.slug); 
                }
            }
        }); 
    } else{
        notLoggedIn(req, res); 
    }
}

middlewareObj.referenceOwnership = (req, res, next) => {
    if(req.isAuthenticated()){
        Reference.findById(req.params.ref_id, (err, foundReference) => {
            if(foundReference.author.id.equals(req.user._id)){
                next(); 
            } else{
                req.flash('error', "You don't have permission to do that"); 
                res.redirect('/exercises/'+ req.params.slug); 
            }
        }); 
    } else { 
        notLoggedIn(req, res); 
    }
}

middlewareObj.profileOwnership = (req, res, next) => {
    if(req.isAuthenticated()){
        User.findOne({username: req.params.username}, (err, foundUser)=>{
            if(err){
                req.flash('error', 'Error finding user profile. Please try again later'); 
                return res.redirect('back'); 
            }  
            if(foundUser._id.equals(req.user._id)){
                next(); 
            } else{
                req.flash('error', 'You do not have permission to do that.'); 
                return res.redirect('/exercises'); 
            }
        })
    } else{
        notLoggedIn(req, res); 
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