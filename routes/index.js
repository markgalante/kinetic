const   express     = require('express'), 
        router      = express.Router(), 
        async       = require('async'), 
        nodemailer  = require('nodemailer'), 
        crypto      = require('crypto'), 
        cloudinary  = require('cloudinary'), 
        multer      = require('multer'), 
        middleware  = require('../middleware/index');
        passport    = require('passport'); 

require('dotenv').config({path: __dirname + "./env"}); 

//SCHEMAS         
const   Exercise    = require('../models/exercise'),
        Comment     = require('../models/comment'), 
        Reference   = require('../models/reference'),
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
    cloud_name: process.env.CLOUDNAME, 
    api_key: process.env.API_KEY, /*process.env.CLOUDINARY_API_KEY*/
    api_secret: process.env.API_SECRET /*process.env.CLOUDINARY_API_SECRET*/ 
});

//GET: REGISTER PAGE
router.get('/register', (req, res)=>{
    res.render('users/register', {page:'register'}); 
}); 

//POST: REGISTER USER 
router.post('/register', upload.single('image'), (req, res)=>{
    cloudinary.v2.uploader.upload(req.file.path, (err, result)=>{
        if(err){
            console.log("ERROR UPLOADING IMAGE FOR NEW PROFILE: " + err.message); 
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
                res.redirect('/');
                req.flash('success', 'Welcome to Kinetic, ' + user.firstName + ". Good to have you!");
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
                                 failureRedirect: '/login',
                                failureFlash: true, 
                            successFlash: 'Welome back!' }));

//SHOW PROFILE                                 
router.get('/profile/:username', (req, res)=>{
    User.findOne({username: req.params.username}, (err, foundUser)=>{
        if(err || !foundUser){
            console.log(err);
            req.flash('error', 'User does not exist or cannot be found. Please register to create that user'); 
            res.redirect('/register'); 
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
            req.flash('success', 'Profile successfully edited')
            res.redirect('/profile/' + updateUser.username); 
        }
    }); 
    //TO DO: TEST IF OLD PROFILE PICTURE DELETES AND NEW ONE UPLOADS
});

// DELETE/DESTROY PROFILE: 
router.delete('/profile/:username', middleware.isLoggedIn, (req, res)=>{
    User.findOneAndRemove({username: req.params.username}, async(err, user)=>{
        Exercise.deleteMany({'author.id': user.id}, (err)=>{
            if(err){
                console.log("UNABLE TO DELETE EXERCISE WHEN DELETING USER: " + err.message); 
            } else{
                console.log('SUCCESS: Exercises deleted')
            }
        });

        Exercise.find({recommends: user.id}, (err, foundExercise)=>{
            if(err){
                console.log('CANT FIND EXERCISES WITH RECOMMENDS: ' + err);
            } else if(!foundExercise){
                console.log('NO RECOMMENDS BY THIS USER!'); 
            } else{
                foundExercise.forEach(exercise => {
                    console.log(exercise._id); 
                    console.log(user._id); 
                    Exercise.findByIdAndUpdate(exercise._id, {$pull: {recommends: user._id}}, (err, updatedExercises)=>{
                        if(err){
                            console.log('UNABLE TO UPDATE EXERCISES BECAUSE OF: ' + err.message); 
                        } else{
                            updatedExercises.save(err=>{
                                if(err){
                                    console.log('UNABLE TO SAVE EXERCISE: ' + err.message); 
                                }
                            }); 
                        }
                    })
                }); 
            }
        }); 

        Reference.deleteMany({'author.id': user.id}, (err)=>{
            if(err){
                console.log("UNABLE TO DELETE REFERENCES WHEN DELETING USER: " + err.message); 
            } else{
                console.log('SUCCESS: References deleted')
            }
        });

        Comment.deleteMany({'author.id': user.id}, (err)=>{
            if(err){
                console.log("UNABLE TO DELETE COMMENTS WHEN DELETING USER: " + err.message); 
            } else{
                console.log('SUCCESS: Comments deleted')
            }
        });
        console.log('IMAGE ID BEFORE DELETE: ' + user.imageId);        
        try{
            await cloudinary.v2.uploader.destroy(user.imageId, (err, result)=>{
                console.log(err, result); 
            });
            user.remove((err)=>{
                if(err){
                    console.log("ERROR DELETING USER: " + err); 
                } else{
                    console.log('SUCCESS')
                }
            }); 
            console.log("IMAGE ID AFTER DELETE: " + user.imageId); 
            res.redirect('/exercises'); 
        } catch(err){
            if(err){
                console.log('ERROR DELETING USER PROFILE: ' + err.message); 
                req.flash('error', 'Unable to delete profile because of: ' + err.message); 
                return res.redirect('back'); 
            }
        }
    }); 
}); 

            //HANDLING USER FORGETTING PASSWORD:
//Getting the page to enter email address of where to send email address to. 
router.get('/forgot', (req, res)=>{
    res.render('./users/forgot'); 
});

/*
DEPENDENDCIES: 
nodemailer - allowing sending of emails with node. 
crypto - generating unique 20 character code to allow resetting of passoword. 
The crypto code will be set in the userSchema with an expiration time. 
*/
router.post('/forgot', (req, res, next)=>{
    async.waterfall([ //waterfall is an array of functions that gets called one after the other. 
        (done)=>{ //FUNCTION ONE - generate unique 20 character code. 
            crypto.randomBytes(20, (err, buf)=>{  //more info: https://nodejs.org/api/crypto.html#crypto_crypto_randombytes_size_callback
                var token = buf.toString('hex'); 
                done(err, token); 
            });
        }, 
        (token, done)=>{
            User.findOne({email: req.body.email}, (err, user)=>{
                if(err || !user){
                    console.log("Cannot find user with " + req.body.email); 
                    return res.redirect('/forgot'); 
                }
                user.resetPasswordToken = token; 
                user.resetPasswordExpires = Date.now() + 36000000

                user.save( err => {
                    done(err, token, user); 
                })
            });    
        },
        (token, user, done) =>{
            const smtpTransport = nodemailer.createTransport({ //createTransport - built in () in nodemailer
                service: "Gmail", 
                auth:{
                    user: process.env.GMAIL, 
                    pass: process.env.GM_PW
                }
            }); 
            const mailOptions = {
                to: user.email, 
                from: 'noreply@kinetic.com', 
                subject: 'Kinetic password request',
                text: 'Hi there \n\n' + 
                'You are receiving this email because you (or someone else) has requested a link to change your password \n\n' + 
                'Please click on the following link or paste it in your browser \n\n ' +
                'http://' + req.headers.host + '/reset/' + token + '\n\n'+
                'Kind regards, \n\n' + 
                'The kinetic team'    
            };
            smtpTransport.sendMail(mailOptions, (err)=>{
                console.log('email sent!'); 
                done(err, 'done'); 
            }); 
        }
    ],
    (err)=>{
        if(err){
            return next("ERROR SENDING EMAIL: " + err.message); 
        } else{
            res.redirect('/forgot'); 
            req.flash('success', 'Email sent and should be visable shortly'); 
        }
    });
});

//Getting form with reset password token URL to change password. 
router.get('/reset/:token', (req, res)=>{
    User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}}, (err, user)=>{
        if(err || !user){
            console.log('ERROR - Invalid reset token or reset token has expired'); 
            return res.redirect('/forgot'); 
        }
        res.render('./users/reset', {token: req.params.token}); 
    });
}); 

router.post('/reset/:token', (req, res)=>{
    async.waterfall([
        (done)=>{
            User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}}, (err, user)=>{
                if(err || !user){
                    console.log('PASSWORD RESET TOKEN IS INVALID OR HAS EXPIRED' + err.message); 
                    return res.redirect('back');
                }
                if(req.body.password === req.body.confirm){
                    user.setPassword(req.body.password, (err)=>{
                        user.resetPasswordToken = undefined; 
                        user.resetPasswordExpires = undefined; 

                        user.save(err=>{
                            req.logIn(user, (err)=>{
                                done(err, user); 
                            }); 
                        });
                    }); 
                } else{
                    console.log('Passwords do not match'); 
                    res.redirect('back'); 
                }
            }); 
        },
        (user, done)=>{
            const smtpTransport = nodemailer.createTransport({
                service: 'Gmail', 
                auth:{
                    user:process.env.GMAIL, 
                    pass: process.env.GM_PW
                }
            });
            const mailOptions = {
                to: user.email, 
                from: process.env.GMAIL,
                subject: 'Kinetic: Your email address has changed', 
                text: 'Hello, ' + user.firstName + '\n\n' + 
                'This email confirms that you have changed your password'
            }; 
            smtpTransport.sendMail(mailOptions, (err)=>{
                done(err); 
            });
        }
    ], 
    (err)=>{
        res.redirect('/exercises'); 
        req.flash('success', 'Password successfully changed')
    }); 
}); 


//LOGOUT
router.get('/logout', (req, res)=>{
    req.logout(); 
    req.flash('success', 'Goodbye! See you soon.');
    res.redirect('/exercises');
}); 

module.exports = router; 