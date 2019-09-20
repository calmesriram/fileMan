var mongoose = require("mongoose");
var peple = require("./people_mongodb_schema");
var fileskey = mongoose.Schema({

    fileId:{
        type:Number,
    },
    fileName:{
        type:String,
    },
    createdAt:{
        type:String,
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
            ref:'peple',
            required: true
    },
    userName:{
        type:String
    }   
})
var d = mongoose.model('FileMan',fileskey);
module.exports = d;





   // user:{
    //     type:mongoose.Schema.Types.ObjectId,
    //     ref:'User',
    //     required: true
    // },
    // project:{
    //     type:mongoose.Schema.Types.ObjectId,
    //     ref:'Project',
    //     required: true
    // },