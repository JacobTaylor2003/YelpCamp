const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    email: {
        type: String,
        required: [true, 'Email is Required!'],
        unique: true
    },
    username: {
        type: String,
        required: [true, 'Username Required']
    },
})
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);