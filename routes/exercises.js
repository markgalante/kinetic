const   express     = require('express'), 
        router      = express.Router(), 
        multer      = require('multer'),
        cloudinary  = require('cloudinary'),
        cloudinaryStorage = require('multer-storage-cloudinary'),  
        Exercise    = require('../models/exercise'),
        Comment     = require('../models/comment'),
        muscles     = require ('../public/muscles.json'),
        middleware  = require('../middleware/index');  

//CONFIGURE MULTER: 
const storage = multer.diskStorage({
    filename: (req, file, callback)=>{
        callback(null, file.originalname + '-' + Date.now()); 
    }
});
const filter = (req, file, callback) => {
    if(!file.originalname.match(/\.(jpg|jpeg|mp4|webm|3gp|mov|png|gif)$/i)){ //If the file name is NOT the following.
        return callback(new Error('Only image or video files are allowed.'), false); 
    }  
    callback(null, true); 
};
const upload = multer({storage: storage, fileFilter:filter}); //fileFilter - function to control which files are uploaded

//setting up cloudinary
cloudinary.config({ 
    cloud_name: 'dbpkz1rnm', 
    api_key: 479674634572721 /*process.env.CLOUDINARY_API_KEY*/, 
    api_secret: 'zyBsxCMOAqCEZ-BCVr3Rc2GjBZw' /*process.env.CLOUDINARY_API_SECRET*/ 
});

// EXERCISE INDEX ROUTE 
router.get('/', (req, res)=>{
    Exercise.find({}, (err, exercises)=>{
        if(err){
            console.log(err); 
        }
        res.render('./exercises/index', {exercises:exercises, muscles:muscles}); 
    }); 
}); 

// NEW EXERCISE ROUTE
router.get('/new', middleware.isLoggedIn, (req, res)=>{
    res.render('./exercises/new', {muscles: muscles}); 
}); 

// NEW EXERCISE POST ROUTE 
router.post('/', upload.single('video', { resource_type: "video" }), (req, res)=>{
    console.log(req.file.path); 
    cloudinary.v2.uploader.upload(req.file.path, { resource_type: "video" },  (err, result)=>{
        if(err){
            console.log("ERROR UPLOADING VIDEO: " + err.message); 
            return res.redirect('back'); 
        }
        req.body.video = result.secure_url; 
        req.body.videoId = result.public_id;  

        const exercise = new Exercise({
            name: req.body.name,
            description: req.body.description,
            muscle: req.body.muscle, 
            video: req.body.video, 
            videoId: req.body.videoId, 
            author: {
                id: req.user._id, 
                username: req.user.username
            }
        }); 
        Exercise.create(exercise, (err, newlyCreate)=>{
            if(err){
               console.log("ERROR ADDING EXERCISE: " + err); 
                return res.redirect("back");  
            }
            console.log(newlyCreate); 
            res.redirect("/exercises"); 
        }); 
    }); 
}); 

//EXERCISE SHOW ROUTE
router.get('/:slug', (req, res)=>{
    Exercise.findOne({slug:req.params.slug}).populate('comments reference').exec((err, foundExercise) =>{
        if(err || !foundExercise){
            console.log(err.message)
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
        }); 
        return res.redirect('back'); 
    }); 
});

router.get('/:slug/edit', (req, res)=>{
    Exercise.findOne({slug:req.params.slug}, (err, foundExercise)=>{
        if(err){
            console.log('ERROR FINDING EXERCISE: ' + err); 
            return res.redirect('back'); 
        } 
        res.render('./exercises/edit', {exercise: foundExercise, muscles:muscles}); 
    }); 
}); 

module.exports = router; 