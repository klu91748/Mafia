const express = require('express');
const socket = require('socket.io');
//const mongoose = require('mongoose');

//App setup
const app = express();
const port = process.env.PORT || 80;
const server = app.listen(port, function(){
    console.log('Listening to requests on port 80')
});

//Static files
app.use(express.static('public'));

/*Connect to database
const uri = process.env.ATLAS_URI;
mongoose.connect(uri,
    {
    useCreateIndex: true,
    useUnifiedTopology: true,
    useNewUrlParser: true
});
mongoose.connection.once('open', function(){
    console.log('Connection to database has been established.');
});
*/

//Socket setup and pass server
var io = socket(server);

var rooms = [];

io.on('connection', function(socket){
    console.log('made socket connection', socket.id);

    socket.on('createRoom', function(data){  
        var roomCode = Math.floor((Math.random() * 8999) + 1000);
        while (rooms.includes(roomCode)){
            roomCode = Math.floor((Math.random() * 8999) + 1000);
        }
        data.roomCode = roomCode;
        socket.name = data.name;
        socket.roomCode = roomCode;
        socket.narrator = true;
        rooms.push(roomCode);   
        socket.join(roomCode);
        socket.emit('createRoom', data);       
    });

    socket.on('joinRoom', function(data){   
        var roomCode = parseInt(data.roomCode);
    
        io.in(roomCode).clients(function(error, clients){
            if (clients.length == 0){
                rooms.splice(rooms.indexOf(roomCode), 1);
                socket.emit('failedToJoinRoom', data);
            }

            else{
                data.roomCode = roomCode;
                socket.name = data.name;
                socket.roomCode = roomCode;
                socket.join(roomCode);
                socket.emit('joinRoom', data);
                sendName(socket.roomCode);
            }     
        });
    });

    socket.on('startGame', function(data){
        if (data == null) return;
        socket.gameInProgress = true;

        var length = data.name.length;
        var role = [];
        var name = [];

        for (var i=1; i<=length-1; i++){
            if (i==7) role.push("Jester");
            else if (i==4) role.push("Nurse");
            else if (i==5) role.push("Officer");
            else if (i%3==0) role.push("Mafia");
            else role.push("Citizen");
        }
        role = shuffle(role);
        
        io.in(data.roomCode).clients(function(error, clients){
            for (var i=1; i<length; i++){
                name.push(io.sockets.connected[clients[i]].name);
                io.sockets.connected[clients[i]].gameInProgress = true;
            }
            io.to(clients[0]).emit('narratorStart', {
                name: name,
                role: role
            });
            for (var i=1; i<length; i++){
                io.to(clients[i]).emit('gameStart', role[i-1]);    
            }
        });
    });
    
    socket.on('disconnect', function(){
        if (socket.narrator == true){
            socket.to(socket.roomCode).emit('gameClose');
        }
        if (socket.gameInProgress == true) {
            return;
        }
        else{
            sendName(socket.roomCode);
        }   
    });
});

//Functions
function sendName(roomCode){
    io.in(roomCode).clients(function(error, clients){
        var name = [];
        for (var i=0; i<clients.length;i++){
            name.push(io.sockets.sockets[clients[i]].name);
        }
        io.in(roomCode).emit('sendName',{
            name: name,
            roomCode: roomCode
        });
    });
}

function shuffle(array){
    var currentIndex = array.length,
        temporaryValue,
        randomIndex;

    while (currentIndex){
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}
