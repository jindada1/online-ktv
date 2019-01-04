
var CHILD_WINDOW_URL = '/SuperPlayer.html';
var LOCAL_STORAGE_KEY = 'AddNewSong';

// var demosong = {
//     songurl: 'https://dl.stream.qqmusic.qq.com/M800004EzHKM2jXY9i.mp3?vkey=7025B0393B3B5016D52B6F079D7E933E4F09C29089658B427AAB422BD6D5653C3B7990BFFEA9EB00038042F67E3B0BD21258BA5650FE4B12&guid=3757070001&uid=0&fromtag=30',
//     albummid:'003yQidc3s7P65',
//     songmid:'004EzHKM2jXY9i',
//     artist:'testARTIST',
//     name:'testSONG'
//     // 可以自己加
// }

function sendToLocalStorage(url,songmid,albummid,name,artist) {
    var song = {
        'songurl':url,
        'songmid': songmid,
        'albummid': albummid,
        'name': name,
        'artist': artist
    }
    // console.log(song);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(song));
    // localStorage.removeItem('postorder');
    // set a time to get item, the item should be removed by player tab
    setTimeout(function () {
        // so, If we get item after period of time, the player tab does not remove item
        if (localStorage.getItem(LOCAL_STORAGE_KEY)) {
            // we can assume that the player tab is closed
            var win = window.open(CHILD_WINDOW_URL, 'SuperPlayerTab');
            // sendToLocalStorage();
        }
        //其它代码
    }, 100);
}