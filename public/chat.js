$(function() {
    //make connection
    var socket = io.connect("https://serene-falls-19141.herokuapp.com/");

    //buttons and inputs
    var message = $("#message");
    var username = $("#username");
    var send_message = $("#send_message");
    var connected = $("#connected");
    var disconnected = $("#disconnected");
    var send_username = $("#send_username");
    var chatroom = $("#chatroom");
    var feedback = $("#feedback");
    var room1Bth = $("#room1");
    var room2Bth = $("#room2");
    var eventLogButton = $("#event_log");
    var chatlogButton = $("#chatlog");

    var currentRoom="room1";
    //room 1 channel
    room1Bth.click(() => {
        //this clears the chat
        chatroom.empty();
        currentRoom = 'room1'
        socket.emit("room1Bth", { message: "Joined room 1 sucessfully" });
        console.log("User joined room 1");
    });

    socket.on("ChatLog1", data => {
        console.log(data);
            feedback.html("");
            message.val("");
        for (let i=0; i<data.length; i++) {
            // console.log(data[i])
            chatroom.append(
                "<p class='message'>" + data[i].user + ": " + data[i].message + "</p>"
            );
        }
    });

    //room 2 channel
    room2Bth.click(() => {
        chatroom.empty();
        currentRoom = 'room2'
        socket.emit("room2Bth", { message: "Joined room 2 sucessfully" });
        console.log("User joined room 2");
    });

    socket.on("ChatLog2", data => {
        console.log(data);
            feedback.html("");
            message.val("");
        for (let i=0; i<data.length; i++) {
            // console.log(data[i])
            chatroom.append(
                "<p class='message'>" + data[i].user + ": " + data[i].message + "</p>"
            );
        }
    });

    
    //Emit message
    send_message.click(function() {
        console.log("Clicked");
        socket.emit("new_message", { message: message.val(), room: currentRoom });
    });
    
    //Emit connection and disconnection
    connected.click(function() {
        socket.emit("connected", { message: "connected to the chat room" });
    });
    disconnected.click(function() {
        socket.emit("disconnected", { message: "disconnected" });
    });

    //Listen on new_message
    socket.on("new_message", data => {
        feedback.html("");
        message.val("");
        chatroom.append(
            "<p class='message'>" + data.username + ": " + data.message + "</p>"
        );
    });
    
    //Listen on connection and disconnection
    socket.on("connected", data => {
        feedback.html("");
        message.val("");
        chatroom.append(
            "<p class='message'>" + data.username + "has connected to the room"
        );
    });
    socket.on("disconnected", data => {
        feedback.html("");
        message.val("");
        chatroom.append(
            "<p class='message'>" +
                data.username +
                "has disconnected from the room"
        );
    });
    
    //Emit a username
    send_username.click(function() {
        socket.emit("change_username", { username: username.val() });
    });
    
    //Emit typing
    message.bind("keypress", () => {
        socket.emit("typing");
    });
    
    //Listen on typing
    socket.on("typing", data => {
        feedback.html(
            "<p><i>" + data.username + " is typing a message..." + "</i></p>"
        );
    });

    //event & history log
    eventLogButton.click(() => {
        console.log('event button clicked')
        document.getElementById('historyTab').style.display="none";
        document.getElementById('eventTab').style.display="block";
        socket.emit("eventLog");
    });

    chatlogButton.click(function() {
        console.log('chat butoon clicked')
        document.getElementById('eventTab').style.display="none";
        document.getElementById('historyTab').style.display="block";
        socket.emit("chatlog");
    });

    socket.on("chatHistory", docs => {
        let tbody = $('#historyChat')
     
            tbody.html('')
            for(let i=0; i<docs.length; i++){
                tbody.append(
                    `
                    <tr style="text-align:center">
                        <td>${docs[i].sender}</td>
                        <td>${docs[i].message}</td>
                        <td>${docs[i].room}</td>
                        <td>${docs[i].date}</td>
                    </tr>
                    `
                )
            }

        
        console.log(docs)
    })

    socket.on("eventHistory", docs => {
        let tbody = $('#eventChat')
        tbody.html('')
        for(let i=0; i<docs.length; i++){
            tbody.append(
                `
                <tr style="text-align:center">
                    <td>${docs[i].errorType}</td>
                    <td>${docs[i].errorMessage}</td>
                    <td>${docs[i].date}</td>
                </tr>
                `
            )
        }
        console.log(docs)
    })
});



