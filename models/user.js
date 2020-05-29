const   mongoose                = require('mongoose'), 
        passportLocalMongoose   = require('passport-local-mongoose'); 

//FUNCTION to ensure that usernames are stored without non-numerical characters
function removeNonAlphaNumericals(string){
    return string.replace(/\W/g, '');
}

const UserSchema = new mongoose.Schema({
    username: {type: String, unique: true, lowercase:true, set: removeNonAlphaNumericals}, 
    password: String, 
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
    graduated: String, 
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }], 
    resetPasswordToken: String, 
    resetPasswordExpires: Date
}); 

UserSchema.plugin(passportLocalMongoose); 

module.exports = mongoose.model("User", UserSchema); 

// UserSchema.pre('save', function(next){
//     this.username.replace(/\W/g, '').toLowerCase();
//     next(); 
// }); 

//WHEN WORKING WITH DATES: var Assignment = mongoose.model('Assignment', { dueDate: Date });
// Assignment.findOne(function (err, doc) {
//     doc.dueDate.setMonth(3);
//     doc.save(callback); // THIS DOES NOT SAVE YOUR CHANGE
  
//     doc.markModified('dueDate');
//     doc.save(callback); // works
//   })