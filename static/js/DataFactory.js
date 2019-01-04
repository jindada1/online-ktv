
RootURL = 'https://' + document.domain + ':' + location.port

function httpGet(theUrl) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", theUrl, false); // false for synchronous request
    xmlHttp.send(null);
    return xmlHttp.responseText;
}

function getCORSMusicUrl(songmid) {
    jsonobj = JSON.parse(httpGet(RootURL + "/api/key"));
    var key = jsonobj["key"];
    return "http://101.227.216.142/amobile.music.tc.qq.com/C100" + songmid + ".m4a?vkey=" + key + "&guid=3757070001&uid=0&fromtag=30";
}

function getLyric(songmid) {
    return httpGet('/api/lyric/' + songmid);
}

function getAlbumCoverUrl(albummid) {
    return "https://y.gtimg.cn/music/photo_new/T002R300x300M000" + albummid + ".jpg?max_age=2592000";
}

function getSingerPic300(singer_mid) {
    return "http://y.gtimg.cn/music/photo_new/T001R300x300M000" + singer_mid + ".jpg";
}

function getSingerlistFromResponse(rawResponseText) {
    jsonobj = JSON.parse(rawResponseText);
    var singerlist = jsonobj["singerList"]["data"]["singerlist"];
    return singerlist;
    /*
    singerlist[i]{
        country: "香港"
        singer_id: 13948
        singer_mid: "001fNHEf1SFEFN"
        singer_name: "G.E.M. 邓紫棋"
        singer_pic: "http://y.gtimg.cn/music/photo_new/T001R150x150M000001fNHEf1SFEFN.webp"
    }
    */
}


function getSongsFromSearchResponse(rawResponseText) {
    // 存放歌曲信息
    var songarray = new Array();
    jsonobj = JSON.parse(rawResponseText);
    var list = jsonobj["data"]["song"]["list"];
    for (var index = 0; index < list.length; index++) {
        var song = list[index];

        var singersstr = "";
        var singers = song["singer"];
        for (var i = 0; i < singers.length; i++) {
            var singer = singers[i];
            singersstr += singer["name"];
        }

        var timestr = convertIntTimeToStr(song["interval"]);

        songarray.push({
            name: song["songname"],
            singer: singersstr,
            songmid: song["songmid"],
            songid: song["songid"],
            albumname: song["albumname"],
            albummid: song["albummid"],
            intervalstr: timestr,
            vid: song["vid"]
        });
    }
    return songarray;
}

function _getMvUrlFromResponse(rawresponse, vid) {
    jsonobj = JSON.parse(rawresponse);
    var mp4_videolist = jsonobj["getMvUrl"]["data"][vid]['mp4'];
    for (var quality = mp4_videolist.length - 1; quality > -1; quality--) {
        var mp4urllist = mp4_videolist[quality]["freeflow_url"];
        if (mp4urllist.length > 0) {
            return mp4urllist[0];
        }
    }
}

function getMvUrlFromResponse(rawresponse, vid) {
    jsonobj = JSON.parse(rawresponse);
    var reses = jsonobj["reses"];
    var ips = jsonobj['ips'];
    for (var quality = reses.length - 1; quality > -1; quality--) {
        var mp4res = reses[quality];
        if (mp4res != '?vkey=') {
            return ips[1] + mp4res;
        }
    }
}

function getSongsFromQQUserSongs(rawsonglist) {
    var result = new Array();
    rawsonglist.forEach(function (qqsong, index) {
        if (qqsong['alertid'] != 0) {
            var oursong = {
                'songmid': qqsong['songmid'],
                'songname': qqsong['songname'],
                'singers': qqsong['singer'][0]['name'],
                'album': qqsong['albumname'],
                'albummid': qqsong['albummid'],
                'interval': convertIntTimeToStr(qqsong['interval']),
                'videoid': qqsong['vid'],
                'songid': qqsong['songid']
            };
            result.push(oursong);
        }
    }, this);
    return result;
}

function convertIntTimeToStr(inttime) {
    if (inttime % 60 > 9) {
        return (parseInt(inttime / 60)).toString() + ":" + (inttime % 60).toString();
    } else {
        return (parseInt(inttime / 60)).toString() + ":0" + (inttime % 60).toString();
    }
}

// var demosong = {
//     songurl: 'https://dl.stream.qqmusic.qq.com/M800004EzHKM2jXY9i.mp3?vkey=7025B0393B3B5016D52B6F079D7E933E4F09C29089658B427AAB422BD6D5653C3B7990BFFEA9EB00038042F67E3B0BD21258BA5650FE4B12&guid=3757070001&uid=0&fromtag=30',
//     albummid:'003yQidc3s7P65',
//     songmid:'004EzHKM2jXY9i',
//     artist:'testARTIST',
//     name:'testSONG'
// }
function GetRealSong(song) {
    var albumurl = getAlbumCoverUrl(song.albummid);
    var lyric = getLyric(song.songmid);
    // var lyric = '';
    console.log(albumurl);
    return {
        url: song.songurl,
        cover: albumurl,
        lyric: lyric,
        artist: song.artist,
        name: song.name
    };
}