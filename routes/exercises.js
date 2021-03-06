let   express     = require('express'), 
        router      = express.Router(), 
        multer      = require('multer'),
        cloudinary  = require('cloudinary'),
        cloudinaryStorage = require('multer-storage-cloudinary'),  
        Exercise    = require('../models/exercise'),
        Comment     = require('../models/comment'),
        Reference   = require('../models/reference'), 
        muscles     = require ('../public/muscles.json'),
        middleware  = require('../middleware/index');  

//CONFIGURE MULTER: 
let storage = multer.diskStorage({
    filename: (req, file, callback)=>{
        callback(null, file.originalname + '-' + Date.now()); 
    }
});
let filter = (req, file, callback) => {
    if(!file.originalname.match(/\.(jpg|jpeg|mp4|webm|3gp|mov|png|gif)$/i)){ //If the file name is NOT the following.
        return callback(new Error('Only image or video files are allowed.'), false); 
    }  
    callback(null, true); 
};
let upload = multer({storage: storage, fileFilter:filter}); //fileFilter - function to control which files are uploaded

//setting up cloudinary
cloudinary.config({ 
    cloud_name: process.env.CLOUDNAME, 
    api_key: process.env.API_KEY, /*process.env.CLOUDINARY_API_KEY*/
    api_secret: process.env.API_SECRET /*process.env.CLOUDINARY_API_SECRET*/ 
});

escapeRegex = (text) => {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

// EXERCISE INDEX ROUTE 
router.get('/', (req, res)=>{
    let     perPage   = 8, 
            pageQuery = parseInt(req.query.page), 
            pageNumber= pageQuery ? pageQuery : 1; 

    let noMatch = null; // Default = no "can't find" message present. 
    if(req.query.search){ //req.query /exercises?search = (req.body.search); 
        let regex = new RegExp(escapeRegex(req.query.search), "gi"); 
        Exercise.find({$or: [ {name: regex}, {description: regex}, {muscle: regex}, {'author.username': regex} ]})
        .skip((perPage * pageNumber)-perPage)
        .limit(perPage)
        .sort({"createdAt": -1})
        .exec((err, exercises)=>{
            if(err){
                req.flash('error', 'Error performing this query'); 
                console.log(err.message); 
                return res.redirect('back'); 
            } else{
                Exercise.countDocuments().exec((err, count)=>{
                    if(err){
                        console.log(err); 
                        return res.redirect('back'); 
                    } else{
                        if(exercises.length < 1){
                            noMatch = "No exercises found..."
                        }
                        Exercise.aggregate([
                            {$match:{
                              $or: [
                                  {name: regex}, {description: regex}, {muscle: regex}, {'author.username': regex}
                              ]  
                            }}, {
                                "$project":{
                                    "name": 1, 
                                    "video": 1, 
                                    "videoId": 1,
                                    "muscle": 1, 
                                    "author": 1,
                                    "recommends": 1, 
                                    "slug": 1, 
                                    "createdAt": 1, 
                                    "length": {"$size": "$recommends"}
                                }
                            }, 
                            {"$sort": {"length": -1}}
                        ])
                        .skip((perPage * pageNumber)-perPage)
                        .limit(perPage)
                        .exec((err, popular)=>{
                            if(err){
                                console.log(err); 
                            } else{
                                res.render('./exercises/index', 
                                {
                                    exercises:exercises, 
                                    popular: popular, 
                                    muscles:muscles, 
                                    noMatch: noMatch, 
                                    search: req.query.search, 
                                    pages: Math.ceil(count/perPage), 
                                    page: 'exercises' ,
                                    current: pageNumber
                                });
                            }
                        });
                    }
                });
            }
        }); 
    } else{
        Exercise.find({})
        .skip((perPage * pageNumber) - perPage)
        .limit(perPage)
        .sort({"createdAt": -1})
        .exec((err, exercises)=>{
            if(err){
                console.log(err); 
            } else{
                Exercise.countDocuments().exec((err, count)=>{
                    Exercise.aggregate([
                        {
                            "$project":{
                                "name": 1, 
                                "video": 1, 
                                "videoId": 1,
                                "muscle": 1, 
                                "author": 1,
                                "recommends": 1,
                                "createdAt": 1, 
                                "slug": 1, 
                                "length": {"$size": "$recommends"}
                            }
                        }, 
                        {"$sort": {"length": -1}}
                    ])
                    .skip((perPage * pageNumber)-perPage)
                    .limit(perPage)
                    .exec((err, popular)=>{
                        if(err){
                            console.log("ERROR FINDING EXERCISES: " + err);
                        } 
                        res.render('./exercises/index', 
                        {
                            exercises:exercises,
                            popular: popular, 
                            muscles:muscles, 
                            noMatch: noMatch, 
                            search: false,
                            pages: Math.ceil(count/perPage), 
                            page: 'exercises' ,
                            current: pageNumber
                        });
                    }); 
                }); 
            }
        });
    } 
}); 

// NEW EXERCISE ROUTE
router.get('/new', middleware.isLoggedIn, (req, res)=>{
    res.render('./exercises/new', {muscles: muscles}); 
}); 

// NEW EXERCISE POST ROUTE 
// router.post('/', upload.single('video', { resource_type: "video" }), (req, res)=>{
//     console.log(req.file.path); 
//     cloudinary.v2.uploader.upload(req.file.path, { resource_type: "video" },  (err, result)=>{
//         if(err){
//             console.log("ERROR UPLOADING VIDEO: " + err.message); 
//             return res.redirect('back'); 
//         }
//         req.body.video = result.secure_url; 
//         req.body.videoId = result.public_id;  

//         const exercise = new Exercise({
//             name: req.body.name,
//             description: req.body.description,
//             muscle: req.body.muscle, 
//             video: req.body.video, 
//             videoId: req.body.videoId, 
//             author: {
//                 id: req.user._id, 
//                 username: req.user.username
//             }
//         }); 
//         Exercise.create(exercise, (err, newlyCreated)=>{
//             if(err){
//                 req.flash('error', 'Unable to add exercise now. Try again later')
//                console.log("ERROR ADDING EXERCISE: " + err); 
//                 return res.redirect("back");  
//             }
//             req.flash('success', 'Success: exercise added!')
//             res.redirect("/exercises/" + newlyCreated.slug); 
//         }); 
//     }); 
// }); 

embedVideo = (vid) => {
    console.log(vid); 
    let vidId = vid.slice(-11);
    let mainURL = 'https://www.youtube.com/embed/'; 
    return (mainURL + vidId);
}
createExercise = (req, res, exercise) =>{
    Exercise.create(exercise, (err, newlyCreated)=>{
        if(err){
            req.flash('error', 'Unable to add exercise now. Try again later')
           console.log("ERROR ADDING EXERCISE: " + err); 
            return res.redirect("back");  
        }
        req.flash('success', 'Success: exercise added!')
        res.redirect("/exercises/" + newlyCreated.slug); 
    });
}
 

router.post('/', upload.single('video', { resource_type: "video" }), (req, res)=>{
    if(req.file){
        cloudinary.v2.uploader.upload(req.file.path, { resource_type: "video",  q: 70 },  (err, result)=>{
            if(err){
                console.log("ERROR UPLOADING VIDEO: " + err.message); 
                return res.redirect('back'); 
            }
            req.body.video = result.secure_url; 
            req.body.videoId = result.public_id;  
    
            let exercise = new Exercise({
                name: req.sanitize(req.body.name),
                description: req.body.description,
                muscle: req.body.muscle, 
                video: req.body.video, 
                videoId: req.body.videoId, 
                author: {
                    id: req.user._id, 
                    username: req.user.username
                }
            }); 
            createExercise(req, res, exercise); 
        }); 
    } else{
        console.log("req.body.video: " + req.body.video); 
        let exercise = new Exercise({
            name: req.sanitize(req.body.name),
                description: req.body.description,
                muscle: req.body.muscle, 
                video: embedVideo(req.body.video[1]), 
                author: {
                    id: req.user._id, 
                    username: req.user.username
                }
        });
        createExercise(req, res, exercise); 
    }
}); 

//EXERCISE SHOW ROUTE
router.get('/:slug', (req, res)=>{
    Exercise.findOne({slug:req.params.slug}).populate('comments reference').exec((err, foundExercise) =>{
        if(err || !foundExercise){
            console.log(err)
            return res.redirect('back');
        } else{
            res.render('./exercises/show', {exercise:foundExercise}); 
            console.log(foundExercise); 
        }
    });
}); 

//EXERCISES RECOMMEND/UNRECOMMEND PAGE 
router.post('/:slug/recommend', middleware.isLoggedIn, (req, res) => {
    Exercise.findOne({slug:req.params.slug}, (err, exercise)=>{
        if(err){
            console.log("UNABLE TO FIND EXERCISE TO LIKE: " + err.message)
        }

        //See if the user has liked the page and return "true" or "false" 
        const recommended = exercise.recommends.some( recommend => {
            return recommend.equals(req.user._id); 
        }); 

        // From above function, either recommend or unrecommend function. 
        recommended ? exercise.recommends.pull(req.user._id) : exercise.recommends.push(req.user._id);
        
        exercise.save(err =>{
            if(err){
                console.log("UNABLE TO RECOMMEND/UNRECOMMEND : " + err); 
                return res.redirect('back'); 
            }
            if(req.xhr){
                res.json(exercise);
            } else{
                return res.redirect('back'); 
            }
        }); 
    }); 
});

//GET EDIT PAGE
router.get('/:slug/edit', middleware.exerciseOwnership, (req, res)=>{
    Exercise.findOne({slug:req.params.slug}, (err, foundExercise)=>{
        if(err){
            console.log('ERROR FINDING EXERCISE: ' + err); 
            return res.redirect('back'); 
        } 
        res.render('./exercises/edit', {exercise: foundExercise, muscles:muscles}); 
    }); 
}); 

//EDIT EXERCISE: 
router.put('/:slug', middleware.exerciseOwnership, upload.single('video', { resource_type: "video" }), (req, res)=>{
    Exercise.findOne({slug: req.params.slug}, async (err, exercise)=>{
        if(err){
            console.log("ERROR FINDING EXERCISE: " + err); 
            req.flash('error', 'Unable to update exercise now. Please try again later.'); 
            return res.redirect('back'); 
        }
        exercise.name           = req.sanitize(req.body.name);
        exercise.description    = req.body.description
        exercise.muscle         = req.body.muscle; 
        if(req.file){
            try{
                if(exercise.vidId){
                    await cloudinary.v2.uploader.destroy(exercise.videoId); 
                }
                let result = await cloudinary.v2.uploader.upload(req.file.path, { resource_type: "video", q:70 }); 
                exercise.videoId = result.public_id; 
                exercise.video = result.secure_url; 
            } catch(err){
                console.log('ERROR EDITING VIDEO: ' + err.message); 
                return res.redirect('back'); 
            }
        } else{
            if(exercise.vidId){
                await cloudinary.v2.uploader.destroy(exercise.videoId); 
            }
            exercise.videoId = ''; 
            exercise.video = embedVideo(req.body.video[1]); 
            console.log(req.body.video + ". TypeOf: " + typeof req.body.video); 
        }
        exercise.save(); 
        console.log(exercise); 
        req.flash('success', 'Exercise successfully updated.'); 
        res.redirect('/exercises/' + exercise.slug); 
    }); 
}); 

//DELETE EXERCISE: 
router.delete('/:slug', middleware.exerciseOwnership, (req, res)=>{
    Exercise.findOneAndRemove({slug: req.params.slug}, async (err, foundExercise)=>{
        if(err){
            console.log('ERROR FINDING CAMPGROUND TO DELETE: ' + err); 
            req.flash('error', 'Unable to delete exercise now. Please try again later.'); 
            return res.redirect('back'); 
        }
        Comment.deleteMany({'_id': {$in: foundExercise.comments}}, (err)=>{
            if(err){
                console.log('ERROR FINDING COMMENTS TO DELETE IN EXERCISE: ' + err);
                return res.redirect('back'); 
            }
        });
        Reference.deleteMany({'_id': {$in: foundExercise.reference}}, (err)=>{
            if(err){
                console.log('ERROR FINDING REFERENCES TO DELETE' + err); 
                return res.redirect('back'); 
            }
        });
        try{
            if(foundExercise.videoId){
                await cloudinary.v2.uploader.destroy(foundExercise.videoId);
            }
            foundExercise.remove(); 
            console.log('Successfully deleted exercise!'); 
            req.flash('success', 'Successfully deleted exercise.'); 
            res.redirect('/exercises'); 
        } catch(err){
            if(err){
                console.log('UNABALE TO DELETE EXERCISES: ' + err.message); 
                return res.redirect('back'); 
            }
        }
    }); 
}); 

module.exports = router; 