/**
 * Created by Aakarsh on 12/28/16.
 */
var mongoose = require('mongoose');
var validator = require('validator');
var jwt = require('jsonwebtoken');
var _ = require('underscore');
var bcrypt = require('bcryptjs');

var UserSchema = mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            minlength: 2,
            trim: true,
            unique: true,
            validate: {
                validator: validator.isEmail,
                message: "{VALUE} is not a valid E-Mail"

            }
        },

        password: {
            type: String,
            required: true,
            minlength: 6
    //Removed maxlength to keep HASH in check.
        },
        tokens: [
            {
                access: {
                    type: String,
                    required: true
                },

                token: {
                    type: String,
                    required: true
                }


            }
        ]

    });

UserSchema.methods.toJSON = function () {   //INSTANCE METHOD
    var inputBody = this;
    var objInput = inputBody.toObject();
    var public = _.pick(objInput, 'email', '_id');
    return public;

};

//Can override method in Mongoose (like toJSON() above)

UserSchema.statics.findByToken = function (token) {   //MODEL METHOD
    var userID; //ID relating to token.
    var User = this;

    try {
        userID = jwt.verify(token, 'abc123'); //returns id decoded

    } catch (e) {

        return new Promise((resolve, reject) => {
            //Promise gets fn's passed in.
            reject();
            ///OR return Promise.reject();

        });


    }
    return User.findOne({
        _id: userID,
        'tokens.token': token,
        'tokens.access': 'auth'

    });

};


UserSchema.methods.generateAuthToken = function () {
    var user = this;
    var access = 'auth';
    var token = jwt.sign({_id: user._id.toHexString(), access}, 'abc123').toString();
    user.tokens.push({access, token});
    return user.save().then(() => {
        return token;
    });

};

UserSchema.methods.removeToken = function (token) {
    var user = this;
    return user.update({
        $pull: {
            tokens:{
                token: token //if (token == token in the user)
            }

        }

    });


};

UserSchema.statics.findByCredentials = function (email, password) {
    var User = this;

    return User.findOne({email: email}).then((user) => {

        if(!user){
            return Promise.reject();
        }

        return new Promise(function (resolve, reject) {
            bcrypt.compare(password, user.password, (err, res) =>{ //result = T OR F
                if(res){
                    return resolve(user);
                }
                return reject();


            })
        });


    });



};

UserSchema.pre('save', function (next) {
    //Middleware accessed before saving the user (when signing up)
    //Access to individual document passed in (eg a single use)
    var user = this;


    if (user.isModified('password')) {
        var userPassword = user.password;
        bcrypt.genSalt(10, (err, salt) =>
        {
            bcrypt.hash(userPassword, salt, (err, hash) =>{
                //hash is the hashed password.
                user.password = hash; //set the user password in the document to the hash.
                next();

            });

        });


    } else {


        next();
    }


});


var User = mongoose.model('User', UserSchema);

module.exports = User;