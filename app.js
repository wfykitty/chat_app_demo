const express = require("express");
const mongoose = require("mongoose");
const moment = require("moment");
const historyModel = require("./models/chathistory");
const eventlogModel = require("./models/eventlog");
const PORT = process.env.PORT || 5000;
const app = express();

const connectionString =
    "mongodb://feiya:Feiya126@cluster0-shard-00-00-h9bay.azure.mongodb.net:27017,cluster0-shard-00-01-h9bay.azure.mongodb.net:27017,cluster0-shard-00-02-h9bay.azure.mongodb.net:27017/admin_data?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority";

mongoose
    .connect(connectionString, {
        useNewUrlParser: true
    })
    .then(
        () => {
            console.log("Mongoose connected successfully ");
        },
        error => {
            console.log("Mongoose could not connected to database : " + error);
        }
    );

//set the template engine ejs
app.set("view engine", "ejs");

//middlewares
app.use(express.static("public"));

//routes
app.get("/", (req, res) => {
    res.render("index");
});

//Listen on port 5000
server = app.listen(PORT, () => console.log("Server connected."));

//socket.io instantiation
const io = require("socket.io")(server);

//listen on every connection
io.on("connection", socket => {
    console.log("New user connected");

    // listen for disconnect
    socket.connection = "Connected";

    socket.on("disconnect", data => {
        if (data.disconnect == "") {
            savedLog({
                error: "Error",
                message: `Please connect to disconnect.`
            });
        }
        let connectionStatus = socket.connection;
        socket.connection = data.disconnect;
        savedLog({
            error: "User disconnected",
            message: `${socket.username} now left the room and disconnected`
        });
    });

    //log function
    async function savedLog(data) {
        const log = new eventlogModel({
            errorType: data.error,
            errorMessage: data.message,
            date: moment().format()
        });
        const result = await log.save();
        console.log("*********LOG STORED IN DATABASE*********");
        console.log(result);
    }

    //default username
    socket.username = "Anonymous";
    //listen on change_username
    socket.on("change_username", data => {
        if (data.username == "") {
            savedLog({
                error: "Error",
                message: `Please enter your username.`
            });
        }
        let oldname = socket.username;
        socket.username = data.username;
        savedLog({
            error: "Change Username",
            message: `${oldname} is now ${socket.username}`
        });
    });

    // listen to room 1
    socket.on("room1Bth", () => {
        console.log("Now joined room 1!");
        //join the room
        socket.join("room1Bth");
        savedLog({
            error: "New Room",
            message: `${socket.username} joined Room 1`
        });
        //send chat log ******
        historyModel
            .find({ room: "room1" }, function(err, docs) {
                if (!err) {
                    console.log(docs);
                    let data = docs.map(x => {
                        let _ = { user: x.sender, message: x.message };
                        return _;
                    });
                    io.sockets.emit("ChatLog1", data);
                } else {
                    throw err;
                }
            })
            .sort("-date")
            .limit(10);
        // io.sockets.emit("ChatLog1", {
        //     user: room1ChatLog.sender,
        //     message: room1ChatLog.message
        // });
        //broadcast to room
        
            io.to("room1Bth")
            .emit("new_message", "User has joined the room 1 chat");
    });

    // listen to room 2
    socket.on("room2Bth", () => {
        console.log("Now joined room 2!");
        //join the room
        socket.join("room2Bth");
        savedLog({
            error: "New Room",
            message: `${socket.username} joined Room 2`
        });
        //send chat log ******
        historyModel
            .find({ room: "room2" }, function(err, docs) {
                if (!err) {
                    console.log(docs);
                    let data = docs.map(x => {
                        let _ = { user: x.sender, message: x.message };
                        return _;
                    });
                    console.log("******Chat of room2****")
                    console.log(data)
                    io.to('room2Bth').emit("ChatLog2", data);
                } else {
                    throw err;
                }
            })
            .sort("-date")
            .limit(10);
        // io.sockets.emit("ChatLog2", {
        //     user: room1ChatLog.sender,
        //     message: room1ChatLog.message
        // });
        //broadcast to room
        
            io.to("room2Bth")
            .emit("new_message", "User has joined the room 2 chat");

            
    });

    //listen event log & history log
    socket.on("eventLog", () => {
        eventlogModel.find({}, function(err, docs) {
            if (!err) {
                console.log(docs);
                socket.emit('eventHistory', docs)
            } else {
                throw err;
            }
        }).limit(10)
        .sort("-date")
    });

    socket.on("chatlog", () => {
        historyModel.find({}, function(err, docs) {
            if (!err) {
                console.log(docs);
                socket.emit('chatHistory', docs)
            } else {
                throw err;
            }
        }
        
        ).limit(10)
        .sort("-date")
    });

    //listen on new_message
    socket.on("new_message", data => {
        //broadcast the new message
        console.log(data.room)
        async function savedMessage() {
            const chats = new historyModel({
                sender: socket.username,
                room: data.room,
                date: moment().format(),
                message: data.message
            });
            const result = await chats.save();
            console.log(result);
        }
        savedMessage();
        io.sockets.emit("new_message", {
            message: data.message,
            username: socket.username
        });
    });

    socket.on("typing", data => {
        socket.broadcast.emit("typing", { username: socket.username });
    });

    // io.sockets.emit('new_message', {message : data.message, username : socket.username});
});
