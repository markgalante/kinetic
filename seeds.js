const   mongoose = require('mongoose'), 
        Exercise = require('./models/exercise'), 
        Reference = require('./models/reference'),
        Comment = require('./models/comment'); 
        
const data = [
    {
        name: 'Shoulder press', 
        video: '', 
        description: 'Press your shoulders all you like, babygirl',
        author:{
            id : "5e987c6ccdde9e24dc253adb", 
            username : "markgalante"
        },  
        muscle: 'Biceps brachii', 
        slug: "slug1"
    },
    {
        name: 'Crunch', 
        video: '', 
        description: 'Crunch yo\' tum tum, babygirl',
        author:{
            id : "5e987c6ccdde9e24dc253adb", 
            username : "markgalante"
        }, 
        muscle: 'Rectus abdominus',
        slug: "slug2"
    }, 
    {
        name: 'Squat', 
        video: '', 
        description: 'Squat your shitpot, babygirl', 
        author:{
            id : "5e987c6ccdde9e24dc253adb", 
            username : "markgalante"
        }, 
        muscle: 'Gluteus maximus',
        slug: "slug3"
    }
]

seedDB = () => {
    Exercise.create(data, (err)=>{

    })
}

module.exports = seedDB; 
