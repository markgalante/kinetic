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

//EDIT/UPDATE COMMENT: 
router.put('/:comment_id', (req, res)=>{
    Exercise.findOne({slug:req.params.slug}, (err, exercise)=>{
        if(err){
            console.log("ERROR FINDING EXERCISE FOR PUT REQUEST: " + err); 
            return res.redirect('back'); 
        } else{
            Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment,  (err, comment)=>{
                if(err){
                    console.log("ERROR EDITING COMMENT ON PUT REQUEST:" + err); 
                    res.redirect('back'); 
                }
                res.redirect('/exercises/' + exercise.slug);
            }); 
        }
    });
});

//DELETE OR DESTROY COMMENT: 
router.delete('/:comment_id', (req, res)=>{
    Comment.findByIdAndRemove(req.params.comment_id, (err, foundComment)=>{
        if(err || !foundComment){
            console.log('ERROR FINDING AND DELETING COMMENT: ' + err); 
            return res.redirect('back'); 
        } else{
            console.log('Comment successfully deleted: ' + foundComment); 
            res.redirect('/exercises/'+req.params.slug); 
        }
    }); 
});

module.exports = router; 