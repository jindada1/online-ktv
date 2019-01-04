/**************************************************
 * MKOnlinePlayer v2.32
 * 播放列表配置模块
 * 编写：mengkun(http://mkblog.cn)
 * 时间：2017-9-15
 *************************************************/
// 建议修改前先备份一下
// 获取 歌曲的网易云音乐ID 或 网易云歌单ID 的方法：
// 先在 js/player.js 中开启调试模式，然后按 F12 打开浏览器的控制台。播放歌曲或点开歌单即可看到相应信息

var musicList = [
    {},
    {
        name: "自定义列表",   // 播放列表名字
        cover: "music1.jpg", // 播放列表封面图像
        item: []
    },
];


var _addMusicCounter = 100;

function addMusic(raw) {
    var music = {
        id: _addMusicCounter++,
        url: raw.url,
        pic: raw.cover,
        lyric: raw.lyric || "",
        artist: raw.artist,
        name: raw.name
    }
    var musics = musicList[1].item

    if (musics.length === 0) {
        rem.mainList.html('');   // 清空列表中原有的元素
        addListhead();      // 向列表中加入列表头
    }

    musics.push(music)
    addItem(musics.length, music.name, music.artist, music.album);
    if (musics.length === 1) {
        setTimeout(function () {
            pause();
        }, 500)
    }
}
