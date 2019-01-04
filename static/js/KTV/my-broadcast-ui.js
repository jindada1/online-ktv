// Muaz Khan         - www.MuazKhan.com
// MIT License       - www.WebRTC-Experiment.com/licence
// Experiments       - github.com/muaz-khan/WebRTC-Experiment

var config = {
    openSocket: function (config) {
        console.log('open socket');
        console.log('connect chanel ' + config.channel);
        var SIGNALING_SERVER = 'https://socketio-over-nodejs2.herokuapp.com:443/';
        var SIGNALING_SERVER = 'https://webrtcweb.com:9559/';

        config.channel = config.channel || location.href.replace(/\/|:|#|%|\.|\[|\]/g, '');
        var sender = Math.round(Math.random() * 999999999) + 999999999;

        console.log('io connect chanel ' + config.channel);
        io.connect(SIGNALING_SERVER).emit('new-channel', {
            channel: config.channel,
            sender: sender
        });

        console.log('socket connect chanel ' + config.channel);
        var socket = io.connect(SIGNALING_SERVER + config.channel);
        socket.channel = config.channel;
        socket.on('connect', function () {
            console.log("socket.on('connect')");
            if (config.callback) config.callback(socket);
        });

        socket.send = function (message) {
            socket.emit('message', {
                sender: sender,
                data: message
            });
        };

        socket.on('message', config.onmessage);
    },
    onRemoteStream: function (media) {
        var video = media.video;
        video.setAttribute('controls', true);

        video.play();
    },
    onRoomFound: function (room) {
        RecvOther(function () {
            console.log("joinRoom");
            broadcastUI.joinRoom({
                roomToken: room.roomToken,
                joinUser: room.broadcaster
            });
        });
    }
};

function RecvOther(callback) {
    var video = document.getElementById('human-video');
    video.setAttribute('autoplay', true);

    callback && callback();
}

function captureUserMedia(callback) {
    var video = document.getElementById('human-video');
    video.setAttribute('autoplay', true);

    getUserMedia({
        video: video,
        onsuccess: function (stream) {
            // in get user media
            config.attachStream = stream;
            callback && callback();

            video.setAttribute('muted', true);
        },
        onerror: function () {
            alert('unable to get access to your webcam.');
            callback && callback();
        }
    });
}


/* UI specific */

var broadcastUI = broadcast(config);

function stopBroadcast () {
    config.attachStream.getVideoTracks().forEach(function(track) {track.stop()});
    OnStage = false;
}

// my turn
function createButtonClickHandler() {
    OnStage = true;
    captureUserMedia(function () {
        broadcastUI.createRoom({
            roomName: (document.getElementById('conference-name') || {}).value || 'Anonymous'
        });
    });
}

(function () {
    var uniqueToken = document.getElementById('unique-token');
    if (uniqueToken)
        if (location.hash.length > 2) uniqueToken.parentNode.parentNode.parentNode.innerHTML = '<h2 style="text-align:center;"><a href="' + location.href + '" target="_blank">Share this link</a></h2>';
        else uniqueToken.innerHTML = uniqueToken.parentNode.parentNode.href = '#' + (Math.random() * new Date().getTime()).toString(36).toUpperCase().replace(/\./g, '-');
})();
