const   mongoose                = require('mongoose'), 
        passportLocalMongoose   = require('passport-local-mongoose'); 

const UserSchema = new mongoose.Schema({
    username: {type: String, unique: true}, 
    // password: String, 
    firstName: String, 
    lastName: String,
    image: String, 
    imageId: String, 
    profession: String, 
    email: {
        type: String, 
        unique: true, 
        required: true
    },
    bio: String,
    graduated: Number, 
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }]
}); 

UserSchema.plugin(passportLocalMongoose); 

module.exports = mongoose.model("User", UserSchema); 


//WHEN WORKING WITH DATES: var Assignment = mongoose.model('Assignment', { dueDate: Date });
// Assignment.findOne(function (err, doc) {
//     doc.dueDate.setMonth(3);
//     doc.save(callback); // THIS DOES NOT SAVE YOUR CHANGE
  
//     doc.markModified('dueDate');
//     doc.save(callback); // works
//   })