
var LOCAL_STORAGE_KEY = 'AddNewSong';


// read from local storage
window.onload = function () {
    var newsong = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
    if (newsong) {
        // do something when add song
        addMusic(GetRealSong(newsong));
        localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
}

$(window).on('storage', newSongCome);

function newSongCome(event) {
    if (event.originalEvent.key != LOCAL_STORAGE_KEY) return;
    let newsong = JSON.parse(event.originalEvent.newValue);
    if (!newsong) return;
    // do something when add song
    addMusic(GetRealSong(newsong));
    localStorage.removeItem(LOCAL_STORAGE_KEY);
}