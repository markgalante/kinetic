const   express     = require('express'), 
        router      = express.Router(), 
        Exercise    = require('../models/exercise'),
        Comment     = require('../models/comment');

router.get('/register', (req, res)=>{
    res.render('users/register'); 
}); 

module.exports = router; 