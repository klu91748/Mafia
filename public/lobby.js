//Make connection
var socket = io.connect('http://localhost:4000');

//Query DOM
var createRoomButton = document.getElementsByClassName('btn btn-primary')[0],
    joinRoomButton = document.getElementsByClassName('btn btn-secondary')[0],
    form = document.getElementById('form'),
    narrator = false,
    userInfo;
    
//Emit events
createRoomButton.addEventListener('click', function(){
    deleteMainDOM();
    var nameText = document.createElement('div');
    nameText.className = 'display-4';
    nameText.innerHTML = 'NAME';

    var nameInput = document.createElement('input');
    nameInput.className = 'form-control';
    nameInput.placeholder = 'ENTER YOUR NAME';

    var playButton = document.createElement('input');
    playButton.className = 'btn btn-primary';
    playButton.type = 'button';
    playButton.value = 'PLAY';
    form.appendChild(nameText);
    form.appendChild(nameInput);
    form.appendChild(playButton);

    playButton.addEventListener('click', function(){
        socket.emit('createRoom',{
            name: nameInput.value,
            roomCode: 0
        });
        deleteText();
        deleteInput();
        deletePlayButton();
    });
});

joinRoomButton.addEventListener('click', function(){
    deleteMainDOM();
    var nameText = document.createElement('div');
    nameText.className = 'display-4';
    nameText.innerHTML = 'NAME';

    var nameInput = document.createElement('input');
    nameInput.className = 'form-control';
    nameInput.placeholder = 'ENTER YOUR NAME';

    var roomText = document.createElement('div');
    roomText.className = 'display-4';
    roomText.innerHTML = 'ROOM CODE';

    var roomInput = document.createElement('input');
    roomInput.className = 'form-control';
    roomInput.placeholder = 'ENTER ROOM CODE';
    roomInput.maxLength = 4;

    var playButton = document.createElement('input');
    playButton.className = 'btn btn-primary';
    playButton.type = 'button';
    playButton.value = 'PLAY';
    form.appendChild(nameText);
    form.appendChild(nameInput);
    form.appendChild(roomText);
    form.appendChild(roomInput);
    form.appendChild(playButton);

    playButton.addEventListener('click', function(){
        socket.emit('joinRoom',{
            name: nameInput.value,
            roomCode: roomInput.value
        });
    });
})

//Listen for events
socket.on('createRoom', function(data){
    narrator = true;

    feedback.innerHTML = '<h1>ROOM CODE:'+data.roomCode+'</h1>';
    feedback.innerHTML += '<h1>NARRATOR: '+data.name+'</h1>';

    var startButton = document.createElement('input');
    startButton.className = 'btn btn-primary';
    startButton.type = 'button';
    startButton.value = 'START';
    form.appendChild(startButton);

    startButton.addEventListener('click', function(){
        socket.emit('startGame', userInfo);
    });
});

socket.on('joinRoom', function(data){
    deleteText();
    deleteInput();
    deletePlayButton();
});

socket.on('failedToJoinRoom', function(){
    feedback.innerHTML = '<h1>INVALID ROOM CODE</h1>';
});

socket.on('sendName', function(data){
    userInfo = data;
    feedback.innerHTML = '<h1>ROOM CODE:'+data.roomCode+'</h1>';
    feedback.innerHTML += '<h1>NARRATOR: '+data.name[0]+'</h1>';
    for (var i=1; i<userInfo.name.length; i++){
        feedback.innerHTML += '<h2>'+data.name[i]+'</h2>';
    }
})

socket.on('narratorStart', function(data){
    feedback.innerHTML = '<h1>NARRATOR</h1>';
    for (var i=0; i<data.name.length; i++){
        feedback.innerHTML += '<h1>'+data.name[i]+': '+data.role[i]+'</h1>';
    }
    //document.getElementsByClassName('btn btn-primary')[0].value = 'REROLL';
    document.getElementsByClassName('btn btn-primary')[0].remove();
})

socket.on('gameStart', function(data){
    feedback.innerHTML = '<h1>ROLE:'+data+'</h1>';
})

socket.on('gameClose', function(){
    feedback.innerHTML = '<h1>NARRATOR DISCONNECTED</h1>';
})

//Functions
function deleteInput(){
    var input = document.getElementsByClassName('form-control');
    var size = input.length;
    while(size>0){
        input[size-1].remove();
        size--;
    }
}

function deletePlayButton(){
    document.getElementsByClassName('btn btn-primary')[0].remove();
}

function deleteText(){
    var text = document.getElementsByClassName('display-4');
    var size = text.length;
    while(size>0){
        text[size-1].remove();
        size--;
    }
}

function deleteMainDOM(){
    document.getElementById('picture').remove();
    createRoomButton.remove();
    joinRoomButton.remove();
}
