const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let Eventlog = new Schema({
    errorType: {
        type: String
    },
    errorMessage: { type: String },
    date: {
        type: Date
    }
});

module.exports = mongoose.model("Eventlog", Eventlog);
