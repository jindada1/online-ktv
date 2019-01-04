// 客户端信息
// var ROOM_ID = 'asd3sacd';
// var USER = "Tony";

var USN = 0;
var CLIENT_ID;
// 标记客户端还未被初始化
var UNINIT = true;
// 0. 先连接
// var socket = io.connect('http://127.0.0.1:8080');
var socket = io.connect('http://' + document.domain + ':8080');
// var socket = io.connect('http://goldenproud.cn:8080');


/* 以下是各个事件的监听函数
*/
// 1.监听 connect 事件，连结服务器，加入房间
socket.on('connect', function () {
    CLIENT_ID = socket.id;
    socket.emit('join', { 'room': ROOM_ID })
});

// 2. 监听 initsongs 事件，服务器返回已点歌曲，初始化客户端点歌台 UI
/* 以下为服务器返回的数据格式

// from server when client join room first, and will be passed for init functions in CLient.js
data{
    list:[                   (array) 每个元素是一个 {'song':{},'owner':str} 这样的结构
        {
            song:{
                name:        (str)
                singer:      (str)
                interval:    <int>
                songmid:     (str)
                albummid:    (str)
            }
            owner:           (str)    点这首歌的用户名
        },
        {},{},,,{}
    ],
    starttime:               <int>  current song 按下 'play' 的 sys timestamp  单位 s（秒）
    startfrom:               <int>  current song 按下 'play' 时已经播放了的时间 单位 s（秒）
    ISPlaying:               [bool] current song is playing or not
}
*/

socket.on('initsongs', function (data) {
    if (data.list.length > 0 && UNINIT) {
        // client has been initialized, avoid duplicated initialization
        UNINIT = false;
        // 初始化正在播放的歌曲
        initSongPlaying((data.list[0]), data.starttime, data.startfrom, data.ISPlaying);
        // 初始化歌单
        initCandidateSongs(data.list);
    }
});

// 4. 监听 operation 事件，有新操作，更新点歌台 UI
/* 以下为服务器返回的数据格式

// a standard operation send to server and get from server
data{
    username:        (str)
    clinetid:        (str)
    room:            (str)
    usn:             <int>
    
    category:        (str)
    song: {
        name:        (str)
        singer:      (str)
        interval:    <int>
        songmid:     (str)
        albummid:    (str)
        songurl:     (str)
    }   
    index:           <int>
}
*/

socket.on('message', function (data) {
    // 有人点歌
    if (data.category === "add") {
        // addsong 只是调用的 demo，可以自己改，它的作用就是根据返回的 data 更新 UI
        addsong(data.song, data.username);
    }
    if (data.category === "remove") {
        // remove 只是调用的 demo，可以自己改，它的作用就是根据返回的 data 更新 UI
        removesong(data.index);
    }
    if (data.category === "puttop") {
        if (data.index > 0) {
            puttopsong(data.index);
        }
    }
});

socket.on('order', function (data) {
    switch (data.category) {
        // some one pressed 'play'
        case PLAY:
            if (audio.paused) {
                PlayMusic(true);
            }
            break;

        // some one pressed 'pause'
        case PAUSE:
            if (!audio.paused) {
                PlayMusic(false);
            }
            break;

        // some one pressed 'switch', or because of song playing finished auto play next
        case SWITCH:
            switchSong();
            break;
        default:
        //
    }
});

// 3. 监听 operatefail 事件，操作失败
socket.on('operatefail', function (msg) {
    // operation failure
    alert(msg);
});

/* =================================================================================== 
以下是发送消息部分，协议中的参数结构
operations = {
    'add':addsong,
    'remove':remove,
    'puttop':puttop
}

// send to server, passed from clickitem() in Client.js
song: {
    name:        (str)
    singer:      (str)
    interval:    <int>
    songmid:     (str)
    albummid:    (str)
    songurl:     (str)
}
*/
// 1. 发送 add 指令给服务器，参数为歌曲信息
function sendToServer_add(song) {
    socket.emit('operate', {
        'username': USER,
        'clinetid': CLIENT_ID,
        'room': ROOM_ID,
        'usn': USN,

        'category': 'add',
        'song': song,
        'index': null
    });
}

// 2. 发送 remove 指令给服务器，参数为歌曲下标
function sendToServer_remove(index) {
    if (typeof index != 'number') {
        index = parseInt(index);
    }
    socket.emit('operate', {
        'username': USER,
        'clinetid': CLIENT_ID,
        'room': ROOM_ID,
        'usn': USN,

        'category': 'remove',
        'song': null,
        'index': index
    });
}

// 3. 发送 puttop 指令给服务器，参数为歌曲下标
function sendToServer_puttop(index) {
    console.log('puttop');
    if (typeof index != 'number') {
        index = parseInt(index);
    }
    socket.emit('operate', {
        'username': USER,
        'clinetid': CLIENT_ID,
        'room': ROOM_ID,
        'usn': USN,

        'category': 'puttop',
        'song': null,
        'index': index
    });
}

var PLAY = 0;
var PAUSE = 1;
var SWITCH = 2;

/*
control{
    'room':         (str)
    'username':     (str)
    'category':     <int>
    'playtime':     <int> (seconds)
}
*/

// 4. send to control panel play signal
function sendToServer_play() {
    socket.emit('control', {
        'room': ROOM_ID,
        'username': USER,
        'category': PLAY,
        'playtime': null
    });
}

// 5. send to control panel pause signal
function sendToServer_pause() {
    socket.emit('control', {
        'room': ROOM_ID,
        'username': USER,
        'category': PAUSE,
        'playtime': audio.currentTime
    });
}

// 5. send to control panel switch signal
function sendToServer_switch() {
    socket.emit('control', {
        'room': ROOM_ID,
        'username': USER,
        'category': SWITCH,
        'playtime': null
    });
}

// 6. send to control panel current play finished, want to next
function sendToServer_wantnext() {
    socket.emit('clientend', {
        'room': ROOM_ID
    });
}