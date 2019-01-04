var UserName, NickName, QQ_Dissid;
var Pageindex = 1

var qq_info_box = document.getElementById('QQ-info-box');
var qq_profile = document.getElementById('qq-profile');
var qq_name = document.getElementById('qq-name');

var bind_qq_btn = document.getElementById('bind-btn');
var bind_qq_input = document.getElementById('bind-input');

var asyn_more_container = document.getElementById("asyn-more-container");
var asyn_more_btn = document.getElementById("asyn-more-btn");

var logout_btn = document.getElementById("log-out-btn");

bind_qq_btn.onclick = bind_with_qq;
asyn_more_btn.onclick = query_next_songs;
logout_btn.onclick = logout;

function logout() {
    Cookies.remove('UserName');
    Cookies.remove('NickName');
    document.location = '/';
}

bind_qq_input.addEventListener("keyup", function (event) {
    event.preventDefault();
    if (event.keyCode == 13) {
        bind_with_qq();
    }
});

// read from cookies to init data
window.onload = function () {
    // read cookies
    UserName = Cookies.get('UserName');
    NickName = Cookies.get('NickName');
    if (UserName) {
        document.getElementById('login-or-userpage').setAttribute('href', '/UserPage.html');
        document.getElementById('login-or-userpage').innerHTML = UserName;
        document.getElementById('user-name').innerHTML = NickName + ' 的歌单';
        initUserSongList(UserName);
    }
    else {
        alert("请先登录");
        document.location = '/';
    }
}

var songarray;

function initUserSongList(userid) {
    songarray = new Array();
    document.getElementById("listContainer").innerHTML = "";
    $.get("/api/songlist/" + userid, function (data) {
        var jsonobject = JSON.parse(data);
        songarray = jsonobject["songlist"];
        for (var index = 0; index < songarray.length; index++) {
            var song = songarray[index];
            addSongInList(song.songname, song.album, song.singers, song.interval, song.videoid, index);
        }
        if (jsonobject['qqnumber']) {
            fetch_user_qqinfo(jsonobject['qqnumber']);
        }
    });
}

function bind_with_qq() {
    var UserQQ = bind_qq_input.value;
    if (UserQQ) {
        $.ajax({
            type: "POST",
            url: '/bindqq',
            data: {
                'userid': UserName,
                'userqq': UserQQ
            },
            success: function (data, textStatus, jQxhr) {
                fetch_user_qqinfo(UserQQ);
            },
            error: function (jqXhr, textStatus, errorThrown) {

            },
            dataType: 'json'
        });
    }
}

function fetch_user_qqinfo(qq_number) {
    $.get("/api/searchqquser/" + qq_number, function (data) {
        if (data) {
            var jsonobject = JSON.parse(data);
            qq_name.innerText = jsonobject['title'];
            qq_profile.src = jsonobject['pic'];
            qq_info_box.style.opacity = 1;
            asyn_more_container.style.opacity = 1;
            QQ_Dissid = jsonobject['dissid'];

            var base_index = songarray.length;
            var qqusersongs = getSongsFromQQUserSongs(jsonobject['songlist']);
            var index;
            for (index = 0; index < qqusersongs.length; index++) {
                var song = qqusersongs[index];
                songarray.push(song);
                addSongInList(song.songname, song.album, song.singers, song.interval, song.videoid, base_index + index);
            }
            if (jsonobject['songlist'].length < 30) {
                asyn_more_btn.disabled = true;
                asyn_more_btn.innerText = "没有更多歌曲了";
            }
        }
    });
}

function query_next_songs() {
    $.get("/api/qquserlist?dissid=" + QQ_Dissid + "&pageindex=" + Pageindex, function (data) {
        if (data) {
            Pageindex += 1;
            var base_index = songarray.length;

            var jsonobject = JSON.parse(data);
            var qqusersongs = getSongsFromQQUserSongs(jsonobject['songlist']);
            var index;
            for (index = 0; index < qqusersongs.length; index++) {
                var song = qqusersongs[index];
                songarray.push(song);
                addSongInList(song.songname, song.album, song.singers, song.interval, song.videoid, base_index + index);
            }
            if (jsonobject['songlist'].length < 30) {
                asyn_more_btn.disabled = true;
                asyn_more_btn.innerText = "没有更多歌曲了";
            }
        }
    });
}

function MouseOverListItem() {
    this.classList.add("Listview_item__hover");
}

function MouseOutListItem() {
    this.classList.remove("Listview_item__hover");
}

function play(index) {
    var song = songarray[index];
    $.get("/api/urlof/" + song.songmid, function (data) {
        sendToLocalStorage(data, song["songmid"], song["albummid"], song.songname, song.singers);
    });
}

function playvideo(index) {
    var song = songarray[index];
    $.get("/api/mvof/" + song.videoid, function (data) {
        var videourl = getMvUrlFromResponse(data, song.videoid);
        window.open(videourl);
    });
}

function dislike(index) {
    var song = songarray[index];
    $.ajax({
        type: "POST",
        url: '/delete',
        data: {
            'userid': UserName,
            'songmid': song.songmid
        },
        success: function (data, textStatus, jQxhr) {
            location.reload();
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log('errorThrown');
        },
        dataType: 'json'
    });
}

function download(index) {
    var a = document.createElement("a");
    $.get("/api/urlof/" + songarray[index].songmid, function (data) {
        a.setAttribute("href", data);
        a.setAttribute("download", songarray[index]["songname"] + ".mp3");
        a.click();
    });
}

function addSongInList(songname, albumname, singersname, timespan, videoid, index) {
    var newli = document.createElement("li");
    if (index % 2 == 0) {
        newli.style.background = "whitesmoke";
    }
    var newlistitem = document.createElement("div");
    newlistitem.classList.add("Listview_item");
    newlistitem.addEventListener("mouseover", MouseOverListItem);
    newlistitem.addEventListener("mouseout", MouseOutListItem);

    var newitemblock = document.createElement("div");
    newitemblock.classList.add("list_itemblock");

    if (videoid != "") {
        var videobutton = document.createElement("i");
        videobutton.className += "button_icon video_button_icon";
        videobutton.onclick = function () { playvideo(index); };
        newitemblock.appendChild(videobutton);
    }

    var newitemsong = document.createElement("div");
    newitemsong.classList.add("list_songname");

    var newsongname = document.createElement("div");
    newsongname.classList.add("list_songnametext");
    newsongname.innerText = songname;

    var buttonscontainer = document.createElement("div");
    buttonscontainer.classList.add("hovershow");

    var playbutton = document.createElement("i");
    playbutton.className += "button_icon play_button_icon";                                 //play icon
    playbutton.onclick = function () { play(index); };

    var downloadbutton = document.createElement("i");
    downloadbutton.className += "button_icon download_button_icon";                         //download icon
    downloadbutton.onclick = function () { download(index); };

    var dislikebutton = document.createElement("i");
    dislikebutton.className += "button_icon dislike_button_icon";                         //like icon
    dislikebutton.onclick = function () { dislike(index); };

    buttonscontainer.appendChild(dislikebutton);
    buttonscontainer.appendChild(playbutton);
    buttonscontainer.appendChild(downloadbutton);
    newitemsong.appendChild(newsongname);
    newitemsong.appendChild(buttonscontainer);

    var newitemalbum = document.createElement("div");
    newitemalbum.classList.add("list_album");
    newitemalbum.innerText = albumname;
    var newitemsingers = document.createElement("div");
    newitemsingers.classList.add("list_singers");
    newitemsingers.innerText = singersname;
    var newitemtime = document.createElement("div");
    newitemtime.classList.add("list_time");
    newitemtime.innerText = timespan;
    newlistitem.appendChild(newitemblock);
    newlistitem.appendChild(newitemsong);
    newlistitem.appendChild(newitemalbum);
    newlistitem.appendChild(newitemsingers);
    newlistitem.appendChild(newitemtime);

    newli.appendChild(newlistitem);
    document.getElementById("listContainer").appendChild(newli);
}