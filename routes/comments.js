const   express     = require('express'), 
        router      = express.Router({mergeParams: true}), 
        Exercise    = require('../models/exercise'),
        Comment     = require('../models/comment'), 
        User        = require('../models/user'), 
        middleware  = require('../middleware/index'); 

router.post('/', middleware.isLoggedIn, (req, res)=>{
    Exercise.findOne({slug: req.params.slug}, (err, foundExercise)=>{
        if(err){
            console.log('CANNOT FIND EXERCISE TO COMMENT ON: ' + err.message);
            res.redirect('back');  
        }
        Comment.create(req.body.comment, (err, comment)=>{
            if(err){
                console.log('UNABLE TO CREATE COMMENT: ' + err.message); 
                return res.redirect('back')
            }
            //add username and id to comments. 
            comment.author.id = req.user._id; 
            comment.author.username = req.user.username;

            //save comment: 
            comment.save(); 

            //push comments to found exercise. 
            foundExercise.comments.push(comment); 
            foundExercise.save(); 

            //redirect back; 
            console.log('SAVED COMMENT: ' + comment); 
            res.redirect('back'); 
        }); 
    }); 
}); 

//GET COMMENT EDIT PAGE
router.get('/:comment_id/edit', (req, res) =>{
    Exercise.findOne({slug:req.params.slug}, (err, exercise)=>{
        if(err){
            console.log("ERROR FINDING EXERCISE FOR COMMENT EDIT: " + err); 
            return res.redirect('back'); 
        } else{
            Comment.findById(req.params.comment_id, (err, comment)=>{
                if(err){
                    console.log("ERROR FINDING COMMENT ON " + exercise.name); 
                    return res.redirect('back'); 
                } else{
                    res.render('./comments/edit', {exercise:exercise, comment:comment}); 
                }
            }); 
        }
    });
}); 



module.exports = router; 