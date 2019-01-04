

var query_btn = document.getElementById('query-info-btn');
var reset_btn = document.getElementById('reset-room-btn');
var reload_btn = document.getElementById('reload-room-btn');
var rename_btn = document.getElementById('rename-room-btn');
var create_btn = document.getElementById('create-room-btn');



var reset_input = document.getElementById('reset-room-input');
var rename_id_input = document.getElementById('rename-roomname-input');
var rename_input = document.getElementById('rename-roomid-input');
var create_input = document.getElementById('create-roomname-input');

 var manager_socket = io.connect('http://' + document.domain + ':' + location.port);
// var manager_socket = io.connect('https://goldenproud.cn');


query_btn.onclick = function (params) {
    sendToServer_Queryinfo();
}

reload_btn.onclick = function (params) {
    sendToServer_ReloadRooms();
}

reset_btn.onclick = function (params) {
    var room = reset_input.value;
    if (room) {
        sendToServer_reset(room);
    }
}


rename_btn.onclick = function (params) {
    var roomid = rename_id_input.value;
    var roomname = rename_input.value;
    if (roomid && roomname) {
        sendToServer_rename(roomid,roomname);
    }
}


create_btn.onclick = function (params) {
    var roomname = create_input.value;
    if (roomname) {
        sendToServer_create(roomname);
    }
}



manager_socket.on('connect', function () {
    sendToServer_Queryinfo();
});

manager_socket.on('get_all_rooms', function (data) {
    console.log(data);
});

function sendToServer_Queryinfo() {
    manager_socket.emit('supermanager', {});
}

function sendToServer_ReloadRooms() {
    manager_socket.emit('reload_rooms', {});
}

function sendToServer_reset(room) {
    manager_socket.emit('reset', {
        'room': room
    });
}

function sendToServer_rename(roomid,roomname) {
    manager_socket.emit('operate_room', {
        'operation':'rename',
        'roomid':roomid,
        'roomname': roomname
    });
}

function sendToServer_create(roomname) {
    manager_socket.emit('operate_room', {
        'operation':'create',
        'roomname': roomname
    });
}