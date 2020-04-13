const   express     = require('express'), 
        router      = express.Router(), 
        Exercise    = require('../models/exercise'),
        Comment     = require('../models/comment');

router.get('/', (req, res)=>{
    res.send('USER ROUTE WORKING!'); 
}); 

module.exports = router; 