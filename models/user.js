const mongoose = require('mongoose'); 

const UserSchema = new mongoose.Schema({
    username: {type: String, unique: true}, 
    password: String, 
    firstName: String, 
    lastName: String,
    profession: String, 
    email: {
        type: String, 
        unique: true, 
        required: true
    },
    bio: String,
    graduated: Date
}); 

module.exports = mongoose.model("User", UserSchema); 


//WHEN WORKING WITH DATES: var Assignment = mongoose.model('Assignment', { dueDate: Date });
// Assignment.findOne(function (err, doc) {
//     doc.dueDate.setMonth(3);
//     doc.save(callback); // THIS DOES NOT SAVE YOUR CHANGE
  
//     doc.markModified('dueDate');
//     doc.save(callback); // works
//   })