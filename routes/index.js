const   express     = require('express'), 
        router      = express.Router(), 
        async       = require('async'), 
        cloudinary  = require('cloudinary'), 
        multer      = require('multer'), 
        passport    = require('passport'); 

//SCHEMAS         
const   Exercise    = require('../models/exercise'),
        Comment     = require('../models/comment'), 
        User        = require('../models/user'); 
        
//CONFIGURE MULTER: 
const storage = multer.diskStorage({
    filename: (req, file, callback)=>{
        callback(null, Date.now()+file.originalname); 
    }
}); 

const imageFilter = (req, file, callback)=>{
    //accept images only 
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)){
        return callback(new Error ('Only image files are allowed'), false); 
    }; 
    callback(null, true); 
};

const upload = multer({ storage:storage, fileFilter: imageFilter }); 

cloudinary.config({
    cloud_name: 'dbpkz1rnm', 
	api_key: 479674634572721, 
	api_secret: 'zyBsxCMOAqCEZ-BCVr3Rc2GjBZw'
});

//GET: REGISTER PAGE
router.get('/register', (req, res)=>{
    res.render('users/register', {page:'register'}); 
}); 

//POST: REGISTER USER 
router.post('/register', upload.single('image'), (req, res)=>{
    cloudinary.v2.uploader.upload(req.file.path, (err, result)=>{
        if(err){
            console.log(err.message); 
            res.redirect('back'); 
        } 
        req.body.register.image = result.secure_url; 
        req.body.register.imageId = result.public_id; 

        User.register(req.body.register, req.body.register.password, (err, user)=>{
            if(err){
                console.log(err.message); 
                return res.redirect('back');
            }
            passport.authenticate('local')(req, res, ()=>{
                res.redirect('/'); 
            });
            console.log(user);  
        });
    });     
}); 

router.get('/profile/:username', (req, res)=>{
    User.findOne({username: req.params.username}, (err, foundUser)=>{
        if(err){
            console.log(err.message); 
            res.render('/register'); 
        } else{ 
            res.render('./users/show', {user:foundUser}); 
        }
    })
}); 

router.get('/login', (req, res)=>{
    res.render('./users/login', {page: 'login'}); 
});  

router.post("/login", passport.authenticate("local", { //uses middleware from passport.authenticate
	successRedirect: "/campgrounds",
	failureRedirect: "/register"
	}), (req, res)=>{ 	

});

router.get('/logout', (req, res)=>{
    req.logout(); 
    res.redirect('/')
}); 

module.exports = router; 