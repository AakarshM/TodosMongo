/**
 * Created by Aakarsh on 12/28/16.
 */

//Using ES6

var db = require('./db/mongoose.js');
var express = require('express');
var bodyParser = require('body-parser');
var {authenticate} = require('./db/middleware.js');
var {SHA256} = require('crypto-js');
var jwt = require('jsonwebtoken');
var app = express();
app.use(bodyParser.json());
var port = process.env.PORT || 3000;


app.post('/todos', authenticate, function (req, res) {
    var body = req.body;
    var todo = new db.todo(
        {
            text: body.text,
            completed: body.completed,
            _creator: req.user._id

        }
    );

    todo.save(function (err, result) {
        if (err) {
            res.json(err);
        }
        res.json(result);
    });


});


app.get('/todos', authenticate, function (req, res) {

    var getTodos = db.todo.find({_creator: req.user._id}, function (err, result) { //error, result


        if (err) {
            return res.status(400).send(error);
        }

        res.json(result);

    });

    return getTodos;


});


app.get('/todos/:id', authenticate, function (req, res) {
    var id = req.params.id;
    var userID = req.user._id;

    if (!db.objectID(id).isValid()) {
        return res.status(404).send();
    }

    db.todo.find({_creator: userID ,_id: id}, function (err, result) {
        if (err) {
            return res.status(400).send("error");
        }
        res.json(result);

    });

});

app.delete('/todos/:id', authenticate, function (req, res) {
    var toDeleteID = req.params.id;
    var creatorIDUser = req.user._id; //creator id in all todos

    db.todo.remove({ _creator: creatorIDUser ,_id: toDeleteID}, function (err, result) {
        if (err) {
            return console.log(err);
        }

        res.json(result);

    });


});


app.patch('/todos/:id', function (req, res) {
    var toPatchID = req.params.id;
    var creatorID = req.user._id;


    db.todo.findOneAndUpdate({_creator: creatorID ,_id: toPatchID}, {
        $set: req.body
    }, {new: true}, function (err, result) {
        if (err) {
            return console.log("error");
        }

        res.json(result);
    });


});


///////SIGN UP USERS

app.post('/users', function (req, res) {
    var body = req.body;  //{email, password}

    var user = new db.user(
        {
            email: body.email,
            password: body.password
        }
    );

    user.save().then(function () {
        return user.generateAuthToken();
    }).then(function (token) {
        console.log(JSON.stringify(user, null, 3));
        res.header('x-auth', token).send(user);

    }).catch((e) => {
        res.status(400).send(e)
    })


});


//Login users

app.post('/users/login', function (req, res) {
    var email = req.body.email;
    var password = req.body.password;

    //Find the user's hashed pass in the database

    db.user.findByCredentials(email, password).then((user) => {

        return user.generateAuthToken().then((token) => {
            res.header('x-auth', token).send(user);

        });

    }).catch((e) => {
        res.status(401).send()
    });


});


//Logout users

app.delete('/users/me/token', authenticate, function (req, res) {
    req.user.removeToken(req.token).then(()=>{
        res.status(200).send(); //all ok
    }).catch((e) => {res.status(400).send()});



});


//user profile (me) requiring auth

app.get('/users/me', authenticate, function (req, res) {
    res.send(req.user);
});


app.listen(port, function () {
    console.log("Listening on port " + port);
});
