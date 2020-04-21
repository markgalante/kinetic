const mongoose      = require('mongoose'); 

const referenceSchema = new mongoose.Schema({
    lastName: String, 
    firstName: String, 
    year: Date,
    title: String, 
    journal: String, 
    edition: Number, 
    volume: Number, 
    pageStart: Number, 
    pageEnd: Number 
});

module.exports = mongoose.model("Reference", referenceSchema); 