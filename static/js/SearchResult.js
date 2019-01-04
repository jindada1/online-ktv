var UserName, NickName;

// read from cookies to init data
window.onload = function () {
    if (key == "") {
        // console.log('None');
    }
    else {
        StartSearch(key);
    }
    // read cookies
    UserName = Cookies.get('UserName');
    NickName = Cookies.get('NickName');

    if (UserName) {
        document.getElementById('login-or-userpage').setAttribute('href', '/UserPage.html');
        document.getElementById('login-or-userpage').innerHTML = UserName;
    }
}

var songarray;
var RESULT_INDEX = 1;
var SEARCH_KEY;

var lastbtn = document.getElementById('lastpage');
var nextbtn = document.getElementById('nextpage');

lastbtn.onclick = function () {
    if (RESULT_INDEX > 1) {
        RESULT_INDEX -= 1;
        StartSearch(SEARCH_KEY);
    }
};

nextbtn.onclick = function () {
    RESULT_INDEX += 1;
    StartSearch(SEARCH_KEY);
};

function StartSearch(searchkey) {
    songarray = new Array();
    SEARCH_KEY = searchkey;
    document.getElementById("listContainer").innerHTML = "";

    $.get("/api/search?searchkey=" + searchkey + '&pageindex=' + RESULT_INDEX, function (data) {
        if (data) {
            var zhida = JSON.parse(data)["data"]["zhida"];
            if(zhida["type"] === 1){
                document.getElementById("singer-name").innerText = zhida["zhida_singer"]["singerName"];
                document.getElementById("singer-profile").src = zhida["zhida_singer"]["singerPic"];
                document.getElementById("profile-holder").style.opacity = 1;
            }

            songarray = getSongsFromSearchResponse(data);
            songarray.forEach(function (song, index) {
                addSongInList(song.name, song.albumname, song.singer, song.intervalstr, song.vid, index);
            }, this);
            document.getElementById('page-index').textContent = RESULT_INDEX;
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
    $.get("/api/urlof/" + song.songmid, function (songurl) {
        sendToLocalStorage(songurl, song["songmid"], song["albummid"], song.name, song.singer);
    });
}

function playvideo(index) {
    var song = songarray[index];
    $.get("/api/mvof/" + song.vid, function (data) {
        var videourl = getMvUrlFromResponse(data, song.vid);
        window.open(videourl);
    });
}

function like(index) {
    var song = songarray[index];
    if (UserName) {
        $.ajax({
            type: "POST",
            url: '/add',
            data: {
                'userid': UserName,
                'songname': song.name,
                'songmid': song.songmid,
                'interval': song.intervalstr,
                'singers': song.singer,
                'album': song.albumname,
                'albummid': song.albummid,
                'videoid': song.vid,
                'songid': song.songid
            },
            success: function (data, textStatus, jQxhr) {
                console.log(data);
                alert('ok');
            },
            error: function (jqXhr, textStatus, errorThrown) {
                console.log('errorThrown');
            },
            dataType: 'json'
        });
    }
    else {
        alert('请先登录');
    }
}

function download(index) {
    var a = document.createElement("a");
    $.get("/api/urlof/" + songarray[index].songmid, function (data) {
        a.setAttribute("href", data);
        a.setAttribute("download", songarray[index]["name"] + ".mp3");
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

    var likebutton = document.createElement("i");
    likebutton.className += "button_icon like_button_icon";                         //like icon
    likebutton.onclick = function () { like(index); };

    buttonscontainer.appendChild(likebutton);
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
