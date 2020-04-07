const express = require('express')
const mongoose = require("mongoose");
const moment = require('moment');
const historyModel = require("./models/chathistory");  
const eventlogModel = require("./models/eventlog");  


const app = express();
// mongoose.connect("mongodb://feiya:Feiya126@cluster0-shard-00-00-h9bay.azure.mongodb.net:27017,cluster0-shard-00-01-h9bay.azure.mongodb.net:27017,cluster0-shard-00-02-h9bay.azure.mongodb.net:27017/admin_data?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority");

const connectionString =
"mongodb://feiya:Feiya126@cluster0-shard-00-00-h9bay.azure.mongodb.net:27017,cluster0-shard-00-01-h9bay.azure.mongodb.net:27017,cluster0-shard-00-02-h9bay.azure.mongodb.net:27017/admin_data?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority";

mongoose
  .connect(connectionString, {
    useNewUrlParser: true})
  .then(
    () => {
      console.log("Mongoose connected successfully ");
    },
    error => {
      console.log("Mongoose could not connected to database : " + error);
    }
  );

//set the template engine ejs
app.set('view engine', 'ejs')

//middlewares
app.use(express.static('public'))


//routes
app.get('/', (req, res) => {
	res.render('index')
})

//Listen on port 5000
server = app.listen(5000, ()=> console.log("Server connected."))

//socket.io instantiation
const io = require("socket.io")(server)


//listen on every connection
io.on('connection', (socket) => {
	console.log('New user connected')

  
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
            message: `${socket.username} is now Disconnected`
        });
    });

//log function
    async function savedLog(data){
        const log = new eventlogModel({
        errorType: data.error,
        errorMessage: data.message,
        date: moment().format(),
        })
        const result =  await log.save();
        console.log('*********LOG TABLE*********')
        console.log(result);
    }

	//default username
	socket.username = "Anonymous"

    //listen on change_username
    socket.on('change_username', (data) => {
        if (data.username == ''){
            savedLog({error:'Error', message: `Please enter your username.`, })
      }
        let oldname = socket.username
        socket.username = data.username
        savedLog({error:'Change Username', message: `${oldname} is now ${data.username}`, })
    })


    //////////////////////////
  // listen on rooms
  ////////////////////////
socket.on('room1Bth', () => {
  console.log("Now joined room1!");
      //join the room 
  socket.join("room1Bth");
      //broadcast to entire room
  io.sockets.to("room1Bth").emit(
        "room1",
        "user has joined to room1 chat");});


socket.on('room2Bth', () => {
   console.log("Now joined room2!");
              //join the room 
   socket.join("room2Bth");
              //broadcast to entire room
              alert('Now joined room2!')
    io.sockets.to("room2Bth").emit(
         "room1",
         "user has joined to room2 chat");}
    
         );




//////////////////
//Print Event log
socket.on('eventLog', () => {
  console.log("EVENT LOG");
});
//   function savedLog(data){
//     const log = new eventlogModel({
//     errorType: data.error,
//     errorMessage: data.message,
    // date: moment().format(),
//   })}


    //listen on new_message
    socket.on('new_message', (data) => {
        //broadcast the new message
        async function savedMessage(){
            const chats = new historyModel({
                sender: socket.username,
                date: moment().format(),
                // room: "room1",
                message: data.message
            })
            const result =  await chats.save();
            console.log(result);
        }
        savedMessage();
        io.sockets.emit('new_message', {message : data.message, username : socket.username});
    })
      
    socket.on('typing', (data) => {
    	socket.broadcast.emit('typing', {username : socket.username})
    })

    // io.sockets.emit('new_message', {message : data.message, username : socket.username});
})


