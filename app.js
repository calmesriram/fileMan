require('custom-env').env("staging")
var multer  = require('multer')
var personsechma = require('./app/schema/people_mongodb_schema')
var filemansechma = require('./app/schema/File_man_schema')
var express = require("express");
var bodyparser = require("body-parser");
var jwt = require("jsonwebtoken");
var config = require("./config")
var mongoose = require("mongoose");
var cors = require("cors");
const path = require('path');
var fs = require("fs");
var app = express();
var savepathupload = multer({ dest: './app/appAsserts' })
 
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, './app/appAsserts');
    },
    filename: function(req, file, cb) {
        // var fileMan = new filemansechma({
        //     fileName: new Date().toISOString() + file.originalname,
        //     createdAt: new Date()
        // })
        // fileMan.save()
      cb(null, new Date().toISOString() + file.originalname);
    }
  });
 
  const fileFilter = (req, file, cb) => {
    // reject a file
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(null, false);
    }
  };
 
  const upload = multer({
    storage: storage,
    // limits: {
    //   fileSize: 1024 * 1024 * 5
    // },
    fileFilter: fileFilter
  });
protectedroutes = express.Router();
app.set('setsecret',config.secret)
app.use('/api',protectedroutes);
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:true}));
app.use(cors());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
protectedroutes.use(bodyparser.json());
protectedroutes.use(bodyparser.urlencoded({extended:true}));
protectedroutes.use(cors());
protectedroutes.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

var DBname = "mytest"

    mongoose.connection.on('connected', function() {
        console.log('Connection to Mongo established.');        
        if (mongoose.connection.client.s.url.startsWith('mongodb+srv')) {
            mongoose.connection.db = mongoose.connection.client.db(DBname);
        }
    });
    
    mongoose.connect(process.env.MONGOD_url, {dbName: DBname}, function(err, client) {
      if (err) {
         console.log("mongo error", err);
         return;
      }
    });
 protectedroutes.use((req,res,next)=>{
    
    var token = req.headers['access-token']
    console.log(token,"hai")
    if(token){
        jwt.verify(token,app.get('setsecret'),(err,data)=>{
            if(err){
                return res.json({"msg":"invalid token"})
            } else {
                req.decoded = data;
                next();
            }
        })
    } else{
        return res.send({messge:'no token provided'})
    }
    // res.end();
})

app.post("/login",(req,res)=>{

    var username  = req.body.username;
    var password =  req.body.password;
    
    personsechma.find({username,password}).then(result =>{               
        if(result){
            // console.log(result[0]['password'])
            if(result[0]['username'] == username && result[0]['password'] == password){
                console.log("correnct")      
             
                jwt.sign({ exp: Math.floor(Date.now() / 1000) + (60 * 60), data:req.body.name },app.get('setsecret'),(err,tok)=>{
                    // jwt.sign(req.body.name,app.get('setsecret'),{expiresIn: Math.floor(Date.now() / 1000) + (60 * 1) },(e,d)=>{
                        if(err){
                            console.log(err)
                            res.end(err)
                            
                        }   
                        res.json({"Date":result,"token":tok})
                        res.end();
                    })

                    
               
                // res.json("unable to create token")
                // res.end();
            }else{
                res.json({"status":"false","msg":"incorrect username or password"})
                res.end();
            }           
        }           

    }).catch(err =>{
        res.send(err)
        res.end();
    })
})

app.post('/reg',(req,res)=>{    
    var a;
    var savePerson
    personsechma.find({},(err,data)=>{
        if(err){
        console.log(err)}
        console.log(data.length)
        a = 1+ data.length;
    }).then(()=>{
        savePerson = new personsechma({     
            pid:a,      
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        username: req.body.username,
        password: req.body.password,
        phonenumber: req.body.phonenumber,
        createdAt:Date.now()
        })
        savePerson.save().then((result)=>{
            console.log(result)
            if(result)
        res.json({"status":"success","msg":"Register Success","records":result})
        res.end();
        }).catch(err =>{
            res.send(err);
            res.end();
        })
    })
      
  
})

protectedroutes.put('/updateuser',(req,res)=>{    
    var username  = req.body.username;        
    personsechma.findOneAndUpdate({username},{$set:req.body}).then(result =>{
        if(result){
            res.json({"status":true,"msg":"Update Success","data":result})            
        }
    }).catch(err =>{
        res.send(err);
        res.end();
    })    
})

protectedroutes.delete('/deluser/:username',(req,res)=>{
    
    var username  = req.params.username;
    console.log(username);
    personsechma.deleteOne({username}).then(result =>{
        if(result){
            res.json({"status":"success","bool":true})
            res.end()
        }
    }).catch(err =>{
        res.send(err);
        res.end();
    })
})



protectedroutes.get('/allusers',(req,res)=>{    

    personsechma.find({},(err,data)=>{
        if(err){
            console.log(err,"Error")
            return res.end();
        }
        if(data){
            console.log(data)
            return res.json(data);            
        }
    })   
})

protectedroutes.get('/allusers',(req,res)=>{    

    personsechma.find({},(err,data)=>{
        if(err){
            console.log(err,"Error")
            return res.end();
        }
        if(data){
            console.log(data)
            return res.json(data);            
        }
    })   
})

// app.get('/all',(req,res)=>{    

//     filemansechma.find({},(err,data)=>{
//         if(err){
//             console.log(err,"Error")
//             return res.end();
//         }
//         if(data){
//             console.log(data)
//             return res.json(data);            
//         }
//     })   
// })
app.get("/",(req,res)=>{
    res.json({"Message":"Application Emitted","Live":"active","status":true})
    res.end();
})

app.post('/profile', upload.single('avatar'), function (req,file, res, next) {
    console.log(req.file,"rpl;")
    console.log(req.body,"rpl;")
    res.end("Uploaded");
    // req.file is the `avatar` file
    // req.body will hold the text fields, if there were any
})

// router.get('/getsingleuserdp/:_singleuserid',(req,res,next)=>{
//     var userid = req.params._singleuserid
// User.findOne({"userID":userid},function(err,data){
//     if(err)
//     console.log(err)
//     if(data){
//         console.log("sriram",data);
//         var d = fs.readdirSync("./profiledp/");
//         console.log(d)
//         fs.readFile('./profiledp/'+data['myimage'],function(err,data){
//         if(err){
//          console.log("Error",err)
//         }
//         if(data){
//          console.log("file",data)
//          res.writeHead(200,{'Content-type':'image/jpeg'});
//          res.write(data)
//          res.end()
//         }
//         if(!data){
//             console.log("file","File dp is not found")                
//             res.end("File dp is not found")
//            }
//     })
  
// }
// })

// })


var port = process.env.PORT || 3000;
app.listen(port);
console.log(port);