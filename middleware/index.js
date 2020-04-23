const   middlewareObj   = {}, 
        Exercise        = require('../models/exercise'), 
        Comment         = require('../models/comment'), 
        User            = require('../models/user'); 

middlewareObj.isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()){
        return next(); 
    } else {
        res.redirect('/login'); 
        console.log('You need to be logged in to do that.');
    }
}

module.exports = middlewareObj; 