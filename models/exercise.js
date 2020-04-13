const   mongoose    = require('mongoose'), 

const exerciseSchema = new mongoose.Schema({
    name: { type: String, required: "This field cannot be left blank"}, 
    image: String, 
    imageId: String, 
    description: String, 
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User"
        },
        username: String
    }, 
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Comment"
        }
    ], 
    slug: {
        type: String, 
        unique: true, 
        trim: true
    }, 
    recommends: [
        {
            type: mongoose.Schema.Types.ObjectId, 
            ref: User
        }
    ]
});

module.exports = mongoose.model('Exercise', exerciseSchema); 