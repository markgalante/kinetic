const   mongoose    = require('mongoose'), 
        User        = require('./user');

const exerciseSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: "This field cannot be left blank"
    }, 
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
            ref: "User"
        }
    ], 
    reference:[{
        authors:String,  
        year: String, 
        title: String, 
        journal: String, 
        edition: String, 
        pageStart: Number,
        pageEnd: Number
    }], 
    muscle: String
});

exerciseSchema.pre('save', async function(next){
    try{
        if(this.isNew || this.wasNew){
            this.slug = await generateUniqueSlug(this._id, this.name); 
        }
        next();
    } catch(err){
        console.log(err.message); 
    }
});

var Exercise = mongoose.model("Exercise", exerciseSchema); 
module.exports = Exercise; 

async function generateUniqueSlug(id, exerciseName, slug){
    try{
        if(!slug){
            return slug = slugify(exerciseName); //added return   
        }
        var exercise = await Exercise.findOne({slug:slug}); 
        if(!exercise || exercise._id.equals(id)){
            return slug; 
        }
        var newSlug = slugify(exerciseName); 
        return await generateUniqueSlug(id, exerciseName, newSlug); 
    } catch(err){
        console.log(err.message); 
    }
}

function slugify(text){
    var slug = text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
    .replace(/\-\-+/g, '-')      // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start of text
    .replace(/-+$/, '')          // Trim - from end of text
    .substring(0, 75);           // Trim at 75 characters
    return slug + "-" + Math.floor(1000 + Math.random() * 9000) //Add 4 random digits to improve uniqueness
}

module.exports = mongoose.model('Exercise', exerciseSchema); 