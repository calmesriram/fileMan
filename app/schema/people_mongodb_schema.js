var mongoose = require("mongoose");

var emptable=mongoose.Schema({
      pid:{
            type:Number,
            unique:true,
            default:1 
         },  
     createdAt:{
         type:Date
     },
    firstname: {
     type:String,
     unique:true
    },
    lastname: String,
    username: String,
    password: String,
    phonenumber: String
});

var person = mongoose.model('person1',emptable);
module.exports = person;