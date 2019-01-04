var UserName;

var socket = io.connect('http://' + document.domain + ':' + location.port);

socket.on('connect', function () {
    socket.emit('monitor');
});
/*
    room["roomid"]
    room["mem_num"]
    room["name"]
    room["song_playing"]
 */
socket.on('get_rooms_status', function (rooms) {
    for (var index = 0; index < rooms.length; index++) {
        var room = rooms[index];
        
        if (room["song_playing"] == "") {
            addKtvRoom(room["roomid"],room["name"],room["mem_num"]);
        }
        else{
            addKtvRoom(room["roomid"],room["name"],room["mem_num"],getAlbumCoverUrl(room["song_playing"]["song"]["albummid"]));
        }
        socket.disconnect();
    }
});

initSongs();
initRecommand();
initSingerList();

// read from cookies to init data
window.onload = function () {
    // read cookies
    UserName = Cookies.get('UserName');
    NickName = Cookies.get('NickName');
    if (UserName) {
        document.getElementById('login-or-userpage').setAttribute('href', '/UserPage.html');
        document.getElementById('login-or-userpage').innerHTML = UserName;
    }
}

var songlist;

function initSongs() {
    $.get("/api/toplisten?num=12", function (data) {
        if (typeof (data) != "") {
            var topSongsContainer = document.getElementById('top-songs');
            jsonobj = JSON.parse(data);
            songlist = jsonobj['songlist']
            songlist.forEach(function(song,index){
                var text = '<div class="song-item"><img onclick="play('+ index +')" class="rect-img" src="'+getAlbumCoverUrl(song.albummid)+'"><div class="info"><a href="/portal/SearchResult?search='+song.singers+'">'+song.singers+'</a><a href="/portal/SearchResult?search='+song.songname+'">'+song.songname+'</a></div><span class="time-string">'+song.interval+'</span></div>';
                topSongsContainer.innerHTML += text;
            })
        }
    });
}

function play(index) {
    var song = songlist[index];
    $.get("/api/urlof/" + song.songmid, function (songurl) {
        sendToLocalStorage(songurl, song["songmid"], song["albummid"], song.songname, song.singers);
    });
}

function initSingerList() {
    $.get("/api/singers", function (data) {
        if (typeof (data) != "") {
            getSingerlistFromResponse(data).forEach(function(singer) {
            /*
                singer{
                    country: "香港"
                    singer_id: 13948
                    singer_mid: "001fNHEf1SFEFN"
                    singer_name: "G.E.M. 邓紫棋"
                    singer_pic: "http://y.gtimg.cn/music/photo_new/T001R150x150M000001fNHEf1SFEFN.webp"
                }
            */
            }, this);
        }
    });
}

function initRecommand() {
    var d = new Date();
    var DayofYear = Math.ceil((new Date() - new Date(new Date().getFullYear().toString())) / (24 * 60 * 60 * 1000)) + 1;
    var day = Math.floor((DayofYear - 4) / 7) - 1;

    var date = "2018_" + "51";

    $.get("/api/top/" + date, function (data) {
        if (typeof (data) != "") {
            jsonobj = JSON.parse(data);
            var songlist = jsonobj["songlist"];
            for (var index = 0; index < 12; index++) {
                var song = songlist[index];

                var singers = "";
                for (var i = 0; i < song["data"]["singer"].length; i++) {
                    var singer = song["data"]["singer"][i];
                    singers += singer["name"];
                }
                var newsong = {
                    album_cover: getAlbumCoverUrl(song["data"]["albummid"]),
                    name: song["data"]["songorig"],
                    singer: singers,
                    songmid: song["data"]["songmid"]
                };
                if (index < 4) {
                    addRecommend(newsong, 'One', 'One');
                } else if (index < 8) {
                    addRecommend(newsong, 'One', 'Two');
                }
                else {
                    addRecommend(newsong, 'One', 'Three');
                }
            }
        }
    });

    $.get("/api/hot/" + date, function (data) {
        if (typeof (data) != "") {
            jsonobj = JSON.parse(data);
            var songlist = jsonobj["songlist"];
            for (var index = 0; index < 12; index++) {
                var song = songlist[index];

                var singers = "";
                for (var i = 0; i < song["data"]["singer"].length; i++) {
                    var singer = song["data"]["singer"][i];
                    singers += singer["name"];
                }
                var newsong = {
                    album_cover: getAlbumCoverUrl(song["data"]["albummid"]),
                    name: song["data"]["songorig"],
                    singer: singers,
                    songmid: song["data"]["songmid"]
                };
                if (index < 4) {
                    addRecommend(newsong, 'Two', 'One');
                } else if (index < 8) {
                    addRecommend(newsong, 'Two', 'Two');
                }
                else {
                    addRecommend(newsong, 'Two', 'Three');
                }
            }
        }
    });
}

function addRecommend(song, low, column) {
    let text = '<div class="item"><a href="/portal/SearchResult?search='+ song.name +'"><img src="' + song.album_cover + '"></a><div class="title">' + song.name + '</div><div class="singer"><span>' + song.singer + '</span></div></div>';
    document.getElementById('Box_' + low + '_' + column).innerHTML += text;
}

function addKtvRoom(roomid,roomname, members = 6, roomimage = "/static/images/images/green.jpg") {
    let text = '<div class="list-item"> <a href=room/' + roomid + '><img style="max-width:150px;" src="' + roomimage + '"></a> <p>包厢名：' + roomname + '</p> <p>在线人数：' + members + '</p> </div>';
    $('div.product-item-box').append(text);
}