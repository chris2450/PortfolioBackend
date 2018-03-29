const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path')
var app = express();
var port = process.env.PORT || 3000;
var db = mongoose.connection;
const accountSid = 'AC51b58a893b28983f454e0e878a1945ca';
const authToken = '48a429d6cedf07524fce3f5d5536a99a';
const client = require('twilio')(accountSid, authToken);
var jwt = require('jsonwebtoken')
var xss = require("xss");
var bcrypt = require('bcrypt')
var salt = 10;
require('dotenv').config()
mongoose.connect('mongodb://chris123:2450chris@ds259778.mlab.com:59778/barahona');
mongoose.connection.on('error', function (err) {
    if (err) throw err;
});
mongoose.connection.on('connected',function (err){
    console.log('collection created');
    commentCollection = db.collection('comments');
});
    
console.log("cool")
var Schema = mongoose.Schema;
// schemas start here
var userSchema = new Schema({
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    pic: {
        type: String,
        default: 'assets/christian.png'
    },
    created: {
        type: Date,
        default: Date.now()
    },
    modified: {
        type: Date,
        default: Date.now()
    }
})
var userSchema = new Schema({
    
    created: {
        type: Date,
        default: Date.now()
    },
    modified: {
        type: Date,
        default: Date.now()
    }
})
var blogSchema = new Schema({
    date: {
        type: Date,
        default: Date.now()
    },
   author:{
       type: String,
       default: "Christian Barahona",
},
    title:{
        type: String,
    
  },
   content :{
        type: String,
    }
})// schema ends

var CommentSchema = new Schema ({
    discussionId:String,
    name: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    replies:[
        {
            name: {
                type: String,
                default:"Unknown"
            },
            content: String
        }
    ],
    createdDate: {
        type: Date,
        default: Date.now()
    }
});
    
var User = mongoose.model('user', userSchema);
var Blog = mongoose.model('blog', blogSchema);
var Comment = mongoose.model('comment', CommentSchema);
var xssService = {
    sanatize: function (req, res, next) {
        var data = req.body
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                data[key] = xss(data[key]);
            }
        }
        next();
    }
}
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({ origin: true, credentials: true }));
var bcryptService = {
    hash: function (req, res, next) {
        bcrypt.hash(req.body.password, salt, function (err, res) {
            if (err) throw err;
            req.body.password = res;
            console.log(res)
            next();
        })
    }
}
app.post('/register', xssService.sanatize, bcryptService.hash, function (req, res) {
    var newUser = user(req.body);
    newUser.save(function (err, product) {
        if (err) throw err;
        console.log('user saved!');
        res.status(200).send({
            type: true,
            data: "User successfully registered"
        });
    });
});
const message = mongoose.Schema({
    name: String,
    message: String
})
var Message = mongoose.model('messages', message)
app.post('/newMessages', function (req, res) {
    var newMessage = Message(req.body);
    newMessage.save()
        .then(item => {
            res.send("new messaged stored")
        })
        .catch(err => {
            res.status(400).send("unable to save message")
        })
    client.messages
        .create({
            body:
                "name: " + JSON.stringify(req.body.name) +
                "\n" + JSON.stringify(req.body.message),
            to: '+13234583951',
            from: '+18339883327 '
        })
        .then(message => process.stdout.write(message.sid));
})
app.post('/login', function (req, res) {
    User.findOne({ 'email': req.body.email }, 'password', function (err, product) {
        if (product === null) {
            res.status(200).send({
                type: false,
                data: 'User does not exist'
            })
        } else {
            bcrypt.compare(req.body.password, product.password, function (err, resp) {
                console.log(product.password)
                if (err) throw err;
                console.log(resp)
                if (resp) {
                    const token = jwt.sign({ User }, 'secret_key', { expiresIn: '300s' });
                    console.log("user's token: ", token);
                    res.status(200).send({
                        type: true,
                        data: 'User Logged In!',
                        token: token
                    })
                } else {
                    res.status(200).send({
                        type: false,
                        data: 'Password is incorrect'
                    })
                }
            })
            if (err) throw err;
            console.log(product)
        }
    })
})
    app.post('/getBlog', function (req, res) {
        var id = req.body.id
        Blog.findOne({
            _id: id
        }, function(err, data){
            if(err) throw err;
            console.log(data);
            res.status(200).send(data);
        })
    })

    app.post('/postBlog', function (req, res) {
        var newBlog = new Blog(req.body);
        newBlog.save(function (err, product) {
            if (err) throw err;
            console.log("Blog Saved!");
            res.status(200).send({
                type: true,
                data: 'Succesfully Added New Blog'
            })
        })
    });

    app.post('/comment', function (req, res) {
        var comments = new Comment(req.body)
        console.log(req.body);
        comments.save(function (err, prodcut) {
            if (err) throw err;
            res.status(200).send({
                type: true,
                data: "Comment Saved"
            }
            )
        })
    })
    app.get('/coolcomment', function(req, res){
        commentCollection.find({ discussionId : req.headers.id }).toArray(function(err, docs){
            if (err){
                throw err;
                res.sendStatus(500);
            } else {
                var result = docs.map(function(data){
                    return data;
                })
                res.json(result);
            }
        })
    });
    
app.listen(port, function () {
    console.log('listening on port: ', port);
})