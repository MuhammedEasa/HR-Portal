const mongoose = require("../Database/db.connect")

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }

});

const collection = mongoose.model("users", userSchema);


module.exports = collection