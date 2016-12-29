/**
 * Created by Aakarsh on 12/28/16.
 */
var mongoose = require('mongoose');

var TodoSchema = mongoose.Schema(
    {
        text: {
            type: String,
            required: true,
            minlength: 1,
            trim: true //remove upfront and backend white space

        },
        completed: {
            type: Boolean,
            default: false
        },
        completedAt: {
            type: Number,
            default: null

        },
        _creator: {
            type: mongoose.Schema.Types.ObjectId, //mongoose for object id types (of users).
            required: true
        }

    });

var Todo = mongoose.model('Todo', TodoSchema);

module.exports = Todo;

