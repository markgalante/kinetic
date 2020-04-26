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
passport.authenticate('local', { successRedirect: '/exercises',
                                 failureRedirect: '/login' }));

//SHOW PROFILE                                 
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

// EDIT ROUTE FOR PROFILE: 
router.get('/profile/:username/edit', (req, res)=>{
    User.findOne({username: req.params.username}, (err, foundUser)=>{
        if(err || !foundUser){
            console.log('ERROR FINDING PROFILE: ' + err);
            return res.redirect('back'); 
        } else{
            res.render('./users/edit', {user: foundUser}); 
        }
    });
});

//UPDATE ROUTE FOR PROFILE: 
router.put('/profile/:username', upload.single('image'), (req, res)=>{
    User.findOne({username: req.params.username}, async (err, updateUser)=>{
        if(err || !updateUser){
            console.log('UNABLE TO FIND USER TO UPDATE: ' + err);
            return res.redirect('back'); 
        } else {
            updateUser.username = req.body.username;
            updateUser.firstName = req.body.firstName;
            updateUser.lastName = req.body.lastName;
            updateUser.email = req.body.email;
            updateUser.profession = req.body.profession;
            updateUser.graduated = req.body.graduated;
            updateUser.bio = req.body.bio; 
            if(req.file){
                try{
                    cloudinary.v2.uploader.destroy(updateUser.imageId); 
                    let result = await cloudinary.v2.uploader.upload(req.file.path); 
                    updateUser.imageId    = result.public_id; 
                    updateUser.image      = result.secure_url; 
                } catch(err){
                    console.log('UNABLE TO UPDATE PROFILE PICTURE BECAUSE: ' + err); 
                    return res.redirect('back'); 
                }
            }
            updateUser.save(); 
            console.log(updateUser); 
            res.redirect('/profile/' + updateUser.username); 
        }
    }); 
});

//LOGOUT
router.get('/logout', (req, res)=>{
    req.logout(); 
    res.redirect('/exercises')
    console.log("logged out")
}); 

module.exports = router; 