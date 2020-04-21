const   express     = require('express'), 
        router      = express.Router(), 
        multer      = require('multer'),
        cloudinary  = require('cloudinary'), 
        Exercise    = require('../models/exercise'),
        Comment     = require('../models/comment'),
        muscles     = require ('../public/muscles.json'); 

//CONFIGURE MULTER: 
const storage = multer.diskStorage({
    filename: (req, file, callback)=>{
        callback(null, Date.now() + file.originalname); 
    }
});
const imageFilter = (req, file, callback) => {
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)){ //If the file name is NOT the following.
        return callback(new Error('Only image files are allowed.'), false); 
    }  
    callback(null, true); 
};
const upload = multer({storage: storage, fileFilter: imageFilter});

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
router.get('/new', (req, res)=>{
    res.render('./exercises/new', {muscles: muscles}); 
}); 

// NEW EXERCISE POST ROUTE 
router.post('/', upload.single('image'), (req, res)=>{

    const exercise = new Exercise({
        name: req.body.name,
        description: req.body.description,
        muscle: req.body.muscle
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

module.exports = router; 