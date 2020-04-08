const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let chatHistory = new Schema({
    sender: { type: String },
    date: {
        type: Date
    },
    room: {
        type: String
    },
    message: {
        type: String
    }
});
module.exports = mongoose.model("History", chatHistory);
