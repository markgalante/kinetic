const mongoose      = require('mongoose'); 

const referenceSchema = new mongoose.Schema({
    authors: String,  
    year: Date,
    title: String, 
    journal: String, 
    edition: Number, 
    volume: Number, 
    pageStart: Number, 
    pageEnd: Number, 
    author: {
        id:{
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User"
        }, 
        username: String
    } 
});

module.exports = mongoose.model("Reference", referenceSchema); 