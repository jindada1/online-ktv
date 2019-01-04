var input = document.getElementById("searchinput");
var resultSongs = new Array();
var send_bullet_btn = document.getElementById("send-bullet");
var msg_input = document.getElementById("content-input");
var msg_box = document.getElementById("message-box");

send_bullet_btn.onclick = function () {
    sendbullet();
}

function sendbullet() {
    var content = msg_input.value;
    if (content) {
        sendToServer_msg(content);
        msg_input.value = "";
    }
}

msg_input.addEventListener("keyup", function (event) {
    event.preventDefault();
    if (event.keyCode == 13) {
        sendbullet();
    }
});

input.addEventListener("keyup", function (event) {
    event.preventDefault();
    if (event.keyCode == 13) {
        DoMySearch();
    }
});

/*
// get from server, stored in SONG_LIST
rawsong{
    song:{
        name:        (str)
        singer:      (str)
        interval:    <int>
        songmid:     (str)
        albummid:    (str)
        songurl:     (str)
    }
    owner:           (str)    点这首歌的用户名
}

// pass to setAudio() in lyricController.js
realsong{
    url:
    albumurl:
    lyric:
}

// searched song from getSongsFromSearch() in datasource.js
song{
    name:       song["songname"],
    singer:     singersstr,
    songmid:    song["songmid"],
    albummid:   song["albummid"],
    inttime:    song["interval"]
};

// send to server, pass to sendToServer_add() in SocketioClient.js
newsong:{
    name:        (str)
    singer:      (str)
    interval:    <int>
    songmid:     (str)
    albummid:    (str)
    songurl:     (str)
}
*/

var RESULT_INDEX = 0;

function DoMySearch() {
    searchkey = document.getElementById('searchinput').value;
    if (searchkey != "") {
        document.getElementById('SearchResultList').innerHTML = "";
        $.get("/api/search?searchkey=" + searchkey + '&pageindex=' + RESULT_INDEX, function (data) {
            resultSongs = getSongsFromSearchResponse(data);
            resultSongs.forEach(function (song, index) {
                if (song["vid"]) {
                    document.getElementById('SearchResultList').innerHTML +=
                        '<li class="result-list-item" onclick="clickitem(' + index + ')"><span><b>' + song.name + '</b></span> <span>' + song.singer + '</span></li>';
                }
            });
        });
    }
}

function showPlayOverlay() {
    document.getElementById('overlayblock').style.height = 'auto';
}

function initPlay() {
    document.getElementById('overlayblock').style.height = '0px';
    catchUpPlay();
}

function clickitem(index) {
    var song = resultSongs[index];
    $.get("/api/mvof/" + song.vid, function (data) {
        var newsong = {
            'name': song.name,
            'singer': song.singer,
            'interval': song.inttime,
            'songmid': song.songmid,
            'albummid': song.albummid,
            'songurl': getMvUrlFromResponse(data, song.vid)
        }
        if (typeof (data) != "undefined") {
            sendToServer_add(newsong);
        }
        else {
            console.log("定位音乐资源有误！");
        }
    });
}

function wantremovesong(index) {
    if (index > 0) {
        sendToServer_remove(index);
    }
}

function wantputtopsong(index) {
    if (index > 1) {
        sendToServer_puttop(index);
    }
}

function playToggle() {
    if (mv_video.paused) {
        sendToServer_play();
    }
    else {
        sendToServer_pause();
    }
}

function switchNext() {
    wantSwitch();
}

/* 以下是客户端收到消息更新 UI 的 demo，在接收消息的函数里调用 */
function UIaddsong(_song) {
    var index = document.getElementById('songs-ordered-holder').childNodes.length;
    var text;
    if (index === 0) {
        text = '<a class="isplaying" onclick="wantputtopsong(' + index + ')"><div class="num-index">' + (index + 1) + '</div><div class="owner">' + _song.owner + '</div><div class="songname">' + _song.song.name + '</div><span class="delete_button_icon" onclick="wantremovesong(' + index + ')"></span></a>';
    }
    else {
        text = '<a onclick="wantputtopsong(' + index + ')"><div class="num-index">' + (index + 1) + '</div><div class="owner">' + _song.owner + '</div><div class="songname">' + _song.song.name + '</div><span class="delete_button_icon" onclick="wantremovesong(' + index + ')"></span></a>';
    }
    $('div.dropdown-content').append(text);
}

function UIputtop(index) {
    var container = document.getElementById('songs-ordered-holder');
    child = container.childNodes[index];
    container.removeChild(child);
    container.insertBefore(child, container.childNodes[1]);
}

function UIremove(index) {
    var container = document.getElementById('songs-ordered-holder');
    child = container.childNodes[index];
    container.removeChild(child);
}

function UI_recv_msg(data) {
    var text = '<p><b>'+data.sender+'：</b>'+data.msg+'</p>'
    msg_box.innerHTML += text;
    msg_box.lastElementChild.scrollIntoView();
}