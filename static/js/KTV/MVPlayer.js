var mv_video = document.getElementById('mv-video');
var lyricContainer = document.getElementById('lyricContainer');
// var albumCover = document.getElementById('albumCover');

var backaudio = document.getElementById('backaudio');
var turn_accompany = document.getElementById('switch-accompany-btn');

turn_accompany.onclick = function (event) {
    if (backaudio.paused) {
        mv_video.volume = 0;
        backaudio.currentTime = mv_video.currentTime;
        backaudio.play();
    }
    else {
        mv_video.volume = 1;
        backaudio.pause();
    }
}

var lyric = null;

// 维护的歌单
var SONG_LIST = new Array();
var CACHE = {
    "startfrom": 0,
    "starttime": 0
};

var StarOnStage = "";
var NewGuy = true;

function initSongPlaying(song, starttime, startfrom, isplaying) {
    StarOnStage = song.owner;
    // if the song is playing
    if (isplaying) {
        // console.log('isplaying')
        if (setAudio(GetRealSong(song))) {
            // compute time offset to sync with other clients
            var clienttimestamp = Date.parse(new Date()) / 1000;
            var offset = startfrom + (clienttimestamp - starttime);
            mv_video.currentTime = offset;
            PlayMusic(true);
            // showPlayOverlay();
            CACHE.startfrom = startfrom;
            CACHE.starttime = starttime;
        }
    }
    // the song is not playing
    else {
        if (setAudio(GetRealSong(song))) {
            // set time offset to sync with other clients
            mv_video.currentTime = startfrom;
        }
    }
}

// in case some browser block mv_video autoplay,so user need to click button to catch up with playing
function catchUpPlay() {
    var clienttimestamp = Date.parse(new Date()) / 1000;
    var offset = CACHE.startfrom + (clienttimestamp - CACHE.starttime);
    if (offset < mv_video.duration) {
        mv_video.currentTime = offset;
        PlayMusic(true);
    }
    else {
        if (SONG_LIST.length > 0) {
            sendToServer_wantnext();
        }
    }
}

function initCandidateSongs(existlist) {
    // initial songlist data structure
    SONG_LIST = existlist;
    // initial songlist UI
    existlist.forEach(UIaddsong);
}

/*
realsong{
    url:
    albumurl:
    lyric:
    songname:
}
 */
//control player
function setAudio(realsong) {
    // albumCover.src = realsong.albumurl;
    try {
        setLyric(realsong.lyric);
    } catch (error) {
        console.log('歌词有误');
    }

    if (typeof (realsong.url) != "undefined") {
        mv_video.src = realsong.url;
        $.get("/api/accompany/" + realsong.songname + ' 伴奏', function (data) {
            backaudio.src = data;
        });
        return true;
    }
    else {
        console.log('setAudio 定位url失败');
        return false;
    }
}

function GetRealSong(rawsong) {
    var albumurl = getAlbumCoverUrl(rawsong.song.albummid);
    var lyric = getLyric(rawsong.song.songmid);

    // var lyric = '';
    return {
        url: rawsong.song.songurl,
        albumurl: albumurl,
        lyric: lyric,
        songname: rawsong.song.name
    };
}

function PlayMusic(_play) {
    if (_play) {
        mv_video.play();
    }
    else {
        mv_video.pause();
    }
}

mv_video.onended = function () {
    if (SONG_LIST.length > 0) {
        sendToServer_wantnext();
    }
    // CheckStage();
}

var NeedSync = true;
mv_video.oncanplay = function () {
    CheckStage();
    if (!NewGuy) {
        PlayMusic(true);
    }
    if (StarOnStage == USER && !NewGuy) {
        // 发号施令
        var clienttimestamp = Date.parse(new Date()) / 1000;
        if (NeedSync) {
            sendToServer_start(clienttimestamp);
            console.log("发号施令");
        }
        else{
            NeedSync = true;
        }
    }
};

function adjsutTo(ownerStarttime) {
    if (StarOnStage === USER) {
        // aready send sync, do not send again
        NeedSync = false;
    }
    // follow with others
    var clienttimestamp = Date.parse(new Date()) / 1000;
    var offset = clienttimestamp - ownerStarttime;
    // modify currentTime can lunch oncaplay()
    mv_video.currentTime = offset;
    // PlayMusic(true);
}

function CheckStage() {
    if (SONG_LIST.length > 0 && !NewGuy) {
        var nextguy = SONG_LIST[0].owner;
        // do nothing
        if (StarOnStage == nextguy) {
            return
        }

        // you are on stage
        if (USER == StarOnStage) {
            // stop broadcast
            console.log('========= leave stage');
            stopBroadcast();
        }

        // you are on stage
        if (USER == nextguy) {
            // prepare to broadcast
            console.log('========= goto stage');
            createButtonClickHandler();
        }
        StarOnStage = nextguy
    }
    if (NewGuy) {
        // you are on stage
        if (USER == StarOnStage) {
            // prepare to broadcast
            console.log('========= goto stage');
            createButtonClickHandler();
        }
    }
}

function wantSwitch() {
    // check if there is candidate song remain
    if (SONG_LIST.length > 0) {
        sendToServer_switch();
    }
}

function switchSong() {
    NewGuy = false;
    // delete first(the song playing or finished playing)
    SONG_LIST.shift();
    // check if there is candidate song remain
    if (SONG_LIST.length > 0) {
        // set info of song
        if (setAudio(GetRealSong(SONG_LIST[0]))) {
            // play music
            // PlayMusic(true);
        }
    }
    else {
        PlayMusic(false);
    }
    // update UI
    refreshUI();
}

function addsong(song, owner) {
    SONG_LIST.push({
        'song': song,
        'owner': owner
    })
    UIaddsong({
        'song': song,
        'owner': owner
    });
    // add first song in list
    if (SONG_LIST.length == 1) {
        if (setAudio(GetRealSong(SONG_LIST[0]))) {
            NewGuy = false;
            // play music
            // sendToServer_play();
        }
    }
}

function removesong(index) {
    SONG_LIST.splice(index, 1);
    refreshUI();
}

function puttopsong(index) {
    //console.log(SONG_LIST);
    var thesongarr = SONG_LIST.splice(index, 1);
    //console.log(SONG_LIST);
    SONG_LIST.splice(1, 0, thesongarr[0])
    //console.log(SONG_LIST);
    refreshUI();
}

function refreshUI() {
    document.getElementById('songs-ordered-holder').innerHTML = "";
    //console.log(SONG_LIST);
    SONG_LIST.forEach(UIaddsong);
}

//sync the lyric
mv_video.addEventListener("timeupdate", function (e) {
    if (!lyric) return;
    for (var i = 0, l = lyric.length; i < l; i++) {
        if (mv_video.currentTime > lyric[i][0] - 0.50 /*preload the lyric by 0.50s*/) {
            //single line display mode
            // lyricContainer.textContent = lyric[i][1];
            //scroll mode
            var line = document.getElementById('line-' + i),
                prevLine = document.getElementById('line-' + (i > 0 ? i - 1 : i));
            prevLine.className = '';
            //randomize the color of the current line of the lyric
            line.className = 'current-line';
            lyricContainer.style.top = 130 - line.offsetTop + 'px';
        };
    };
});


function setLyric(rawlyric) {
    lyric = parseLyric(rawlyric);
    //display lyric to the page
    appendLyric(lyric);
}

function parseLyric(text) {
    //get each line from the text
    var lines = text.split('\n'),
        //this regex mathes the time [00.12.78]
        pattern = /\[\d{2}:\d{2}.\d{2}\]/g,
        result = [];

    // Get offset from lyrics
    var offset = this.getOffset(text);

    //remove the last empty item
    lines[lines.length - 1].length === 0 && lines.pop();
    //display all content on the page
    lines.forEach(function (v, i, a) {
        var time = v.match(pattern),
            value = v.replace(pattern, '');
        time.forEach(function (v1, i1, a1) {
            //convert the [min:sec] to secs format then store into result
            var t = v1.slice(1, -1).split(':');
            result.push([parseInt(t[0], 10) * 60 + parseFloat(t[1]) + parseInt(offset) / 1000, value]);
        });
    });
    //sort the result by time
    result.sort(function (a, b) {
        return a[0] - b[0];
    });

    return result;
}

function appendLyric(lyric) {
    var that = this,
        lyricContainer = this.lyricContainer,
        fragment = document.createDocumentFragment();
    //clear the lyric container first
    lyricContainer.innerHTML = '';
    lyric.forEach(function (v, i, a) {
        var line = document.createElement('p');
        line.id = 'line-' + i;
        line.textContent = v[1];
        fragment.appendChild(line);
    });
    lyricContainer.appendChild(fragment);
}

function getOffset(text) {
    //Returns offset in miliseconds.
    var offset = 0;
    try {
        // Pattern matches [offset:1000]
        var offsetPattern = /\[offset:\-?\+?\d+\]/g,
            // Get only the first match.
            offset_line = text.match(offsetPattern)[0],
            // Get the second part of the offset.
            offset_str = offset_line.split(':')[1];
        // Convert it to Int.
        offset = parseInt(offset_str);
    } catch (err) {
        //alert("offset error: "+err.message);
        offset = 0;
    }
    return offset;
}