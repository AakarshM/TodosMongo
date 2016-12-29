/**
 * Created by Aakarsh on 12/28/16.
 */
var mongoose = require('mongoose');
var {ObjectID} = require('mongodb').ObjectID;
var userModel = require('./user.js');
var todoModel = require('./todo.js');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/TodoApp');

var db = {};
db.objectID = ObjectID;
db.client = mongoose;
db.user = userModel;
db.todo = todoModel;

module.exports = db;