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
        req.body.image = result.secure_url; 
        req.body.imageId = result.public_id; 

        const newUser = new User({
            username: req.body.username, 
            firstName: req.body.firstName, 
            lastName: req.body.lastName, 
            image: req.body.image, 
            imageId: req.body.imageId, 
            bio: req.body.bio, 
            profession: req.body.profession, 
            graduated: req.body.graduated,
            email: req.body.email,  
        }); 

        User.register(newUser, req.body.password, (err, user)=>{
            if(err){
                console.log(err.message); 
                return res.redirect('back');
            }
            passport.authenticate('local')(req, res, (err, auth)=>{
                console.log("TaKE NOTE WITH PASSPORT AUTHENTICATE:" + err, auth)
                res.redirect('/')
            });
            console.log(user); 
        });
    });     
}); 

router.get('/login', (req, res)=>{
    res.render('./users/login', {page: 'login'}); 
});  

router.post('/login',
passport.authenticate('local', { successRedirect: '/success',
                                 failureRedirect: '/fail' }));

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

router.get('/fail', (req, res)=>{
    res.send("Login fails"); 
});
router.get('/success', (req, res)=>{
    res.send("Login success"); 
});

//LOGOUT
router.get('/logout', (req, res)=>{
    req.logout(); 
    res.redirect('/')
    console.log("logged out")
}); 

module.exports = router; 