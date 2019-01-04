from flask import Flask,render_template,jsonify,request,json
import fromQQmusic
import UserDB
import KtvDB

from flask_socketio import SocketIO, rooms, join_room, leave_room
import time
import threading

app = Flask(__name__)
socketio = SocketIO(app)

PagesRoute = ['Index.html','LR.html','UserPage.html','SuperPlayer.html']

@app.route('/')
def hello_world():
    # return render_template('Index.html')
    return render_template('Index.html')

@app.route('/<string:page>')
def gopage(page):
    if PagesRoute.__contains__(page):
        return render_template(page)
    else:
        return render_template('Index.html')

@app.route('/room/<string:room_id>')
def index(room_id):
    return render_template('KTVwithMV.html', room_id=room_id, room_name = ROOM_NAME[room_id])

@app.route('/portal/SearchResult')
def searchpage():
    searchkey = request.args.get('search')
    if searchkey == 'Huang7232425':
        return render_template('super_manager.html')
    return render_template('SearchResult.html',searchkey = searchkey)

@app.route("/login", methods=["POST"])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        try:
            if UserDB.login(username,password):
                return json.dumps({'status':'OK','data':'login'})
            return json.dumps({'status':'WR','data':'login'})
        except:
            return json.dumps({'status':'RT','data':'login'})

@app.route("/sign", methods=["POST"])
def sign():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        # print(request.form)
        try:
            if UserDB.register(username,password):
                return json.dumps({'status':'OK','data':'sign'})
            # print('failed sign up')
            return json.dumps({'status':'DP','data':'sign'})
        except :
            # print('except')
            return json.dumps({'status':'RT','data':'sign'})
            pass

@app.route("/bindqq", methods=["POST"])
def bind_user_QQ():
    if request.method == 'POST':
        userid = request.form['userid']
        userqq = request.form['userqq']
        if UserDB.binding_qq(userid,userqq):
            return json.dumps({'status':'OK','data':'succ'})
        else:
            return json.dumps({'status':'Fail','data':'succ'})

@app.route("/add", methods=["POST"])
def adduser_song():
    if request.method == 'POST':
        userid = request.form['userid']
        songname = request.form['songname']
        songmid = request.form['songmid']
        interval = request.form['interval']
        singers = request.form['singers']
        album = request.form['album']
        albummid = request.form['albummid']
        videoid = request.form['videoid']
        songid = request.form['songid']
        # print(request.form)
        # songname,songmid,interval,singers,album,videoid,songid 是要加入到 userid 用户的歌单里的歌曲信息
        UserDB.add_song_to(songname, songmid, interval, singers, album, albummid, videoid, songid)
        if UserDB.add_to(userid, songmid):
            UserDB.add_count(songmid)
            return json.dumps({'status':'OK','data':'succ'})
        return json.dumps({'status':'DP','data':'exist'})
    else:
        pass

@app.route("/delete", methods=["POST"])
def deluser_song():
    if request.method == 'POST':
        userid = request.form['userid']
        songmid = request.form['songmid']
        UserDB.delete_from(userid, songmid)
        return json.dumps({'status':'OK','data':'succ'})

@app.route('/api/search')
def get_search():
    searchkey = request.args.get('searchkey')
    pageindex = request.args.get('pageindex')
    return fromQQmusic.getsearch(searchkey,pageindex)

@app.route('/api/singers')
def get_singers():
    return fromQQmusic.getSingers()

@app.route('/api/singersongs')
def get_singersongs():
    pageindex = request.args.get('pageindex')
    singermid = request.args.get('singermid')
    return fromQQmusic.getSingerSongs(pageindex,singermid)

@app.route('/api/mvof/<string:mvid>', methods=['GET'])
def get_mv(mvid):
    return fromQQmusic.getmv(mvid)

@app.route('/api/urlof/<string:songmid>', methods=['GET'])
def get_tasks(songmid):
    return fromQQmusic.getmusicuri(songmid)

@app.route('/api/key')
def get_key():
    return fromQQmusic.getkey()

@app.route('/api/lyric/<string:songmid>', methods=['GET'])
def get_lyric(songmid):
    return fromQQmusic.getLyric(songmid)

@app.route('/api/toplisten', methods=['GET'])
def get_toplisten():
    num = request.args.get('num')
    num = int(num)
    return UserDB.get_top(num)
    
@app.route('/api/top/<string:date>', methods=['GET'])
def get_topsongs(date):
    return fromQQmusic.getTopSongs(date)

@app.route('/api/hot/<string:date>', methods=['GET'])
def get_tophotsongs(date):
    return fromQQmusic.getTopHotSongs(date)

@app.route('/api/songlist/<string:username>', methods = ['GET'])
def get_songlist(username):
    return UserDB.songlist_test(username)

@app.route('/api/accompany/<string:songname>', methods = ['GET'])
def get_accompany(songname):
    return fromQQmusic.getfromkugou(songname)

@app.route('/api/searchqquser/<string:qqnumber>', methods = ['GET'])
def get_qquser(qqnumber):
    return fromQQmusic.search_user(qqnumber)

@app.route('/api/qquserlist')
def get_qquserlist():
    dissid = request.args.get('dissid')
    pageindex = request.args.get('pageindex')
    pageindex = int(pageindex)
    result = fromQQmusic.get_user_songlist(dissid,pageindex)
    return json.dumps({'songlist':result})

ROOM = {}

'''
_song{
    song:{
        name:        (str)
        singer:      (str)
        interval:    <int>
        songmid:     (str)
        albummid:    (str)
    }
    owner:           (str)
}
'''
def addsong(data):
    ROOM[data['room']]['songlist'].append({'song':data['song'], 'owner':data['username']})
    # print('add a song')


def remove(data):
    index = data['index']
    ROOM[data['room']]['songlist'].pop(index)
    # print('removeed a song')
    # print(index)

def puttop(data):
    song = ROOM[data['room']]['songlist'][data['index']]
    ROOM[data['room']]['songlist'].remove(song)
    ROOM[data['room']]['songlist'].insert(1,song)
    # print('put a song top')

operations = {
    'add':addsong,
    'remove':remove,
    'puttop':puttop
}

'''
data{
    username:        (str)
    clinetid:        (str)
    room:            (str)
    usn:             <int>

    category:        (str)
    song: {
        name:        (str)
        singer:      (str)
        interval:    <int>
        songmid:     (str)
        albummid:    (str)
    }   
    index:           <int>
}
'''
@socketio.on('operate')
def on_operate(data):
    if ROOM[data['room']]['ISFree']:
        ROOM[data['room']]['ISFree'] = False
        try:
            # operate success
            operations[data['category']](data)
            socketio.send(data,room=data['room'])
            # print(ROOM[data['room']]['songlist'])
        except:
            # operate failed
            socketio.emit('operatefail','error',room=data['clinetid'])
        ROOM[data['room']]['ISFree'] = True
    else:
        # someone else is operating counter
        socketio.emit('operatefail','busy',room=data['clinetid'])

def play(data):
    # print('one client pressed play')
    # get time stamp when play music
    ROOM[data['room']]['starttime'] = int(time.time())
    ROOM[data['room']]['ISPlaying'] = True

def pause(data):
    # print('one client pressed pause')
    # get time stamp when pause music
    ROOM[data['room']]['startfrom'] = data['playtime']
    ROOM[data['room']]['ISPlaying'] = False

def switch(data):
    # print('one client switched next')
    # clients want to switch next song, remove the top song in server's song list
    ROOM[data['room']]['songlist'].pop(0)
    ROOM[data['room']]['starttime'] = int(time.time())
    ROOM[data['room']]['startfrom'] = 0
    # print(ROOM[data['room']])

controls = [play,pause,switch]
'''
data{
    'room':         (str)
    'username':     (str)
    'category':     <int>
    'playtime':     <int>
}
'''
@socketio.on('control')
def on_control(data):
    if ROOM[data['room']]['CanControl']:
        ROOM[data['room']]['CanControl'] = False
        try:
            # control success
            controls[data['category']](data)
            socketio.emit('order',data,room=data['room'])
        except:
            # operate failed
            socketio.emit('operatefail','error',room=data['clinetid'])
        ROOM[data['room']]['CanControl'] = True
    else:
        # someone else is control audio
        socketio.emit('operatefail','操作太快',room=data['clinetid'])

@socketio.on('clientend')
def on_playend(data):
    # print('client finished playing')
    room=data['room']
    ROOM[room]['reqcache'] += 1
    if ROOM[room]['reqcache'] > ROOM_NUM[room]/3:
        # server switch next
        switch({'room':room})
        # clients switch next
        socketio.emit('order',{'category':2,'username':'auto'},room=room)

@socketio.on('starton')
def on_ownerstart(data):
    # print('client finished playing')
    room=data['room']
    if ROOM[room]['songlist'][0]['owner'] == data['username']:
        ROOM[room]['starttime'] = data['starttime']
        ROOM[data['room']]['ISPlaying'] = True
        # print(data['starttime'])
        socketio.emit('adjust',{'starttime':data['starttime']},room=room)

@socketio.on('sendmsg')
def on_recvmsg(data):
    room = data['room']
    socketio.emit('getmessage',{'sender':data['username'],'msg':data['msg']},room=room)

'''
ROOM{'id':room}
room{
    songlist:       []
    ISFree:         bool
    starttime:      int
    startfrom:      int
    members:        int
    reqcache:       int
}
'''
# used for client to join room he/she wants to join
@socketio.on('join')
def on_join(data):
    # get the room that client wants to join
    room=data['room']
    join_room(room)
    # if room not exist, error
    if not ROOM.__contains__(room):
        return 'error'
    # record new member's room
    # send list of the room to him/her
    # print('init client ' + str(request.sid) + ' in ' + room)
    # print(ROOM[room])
    socketio.emit('initsongs',{'list': ROOM[room]['songlist'],'starttime':ROOM[room]['starttime'],'startfrom':ROOM[room]['startfrom'],'ISPlaying':ROOM[room]['ISPlaying']},room=request.sid)
    # print('init client ' + str(request.sid) + ' in ' + room)

@socketio.on('connect')
def test_connect():
    # print('\n' + str(request.sid) + 'Client connected \n')
    pass

@socketio.on('disconnect')
def on_disconnect():
    # print('\n' + str(request.sid) + 'Client disconnected!!! \n')
    pass


ROOM_NUM = {}
ROOM_NUM_CACHE = {}
ROOM_NAME = {}
MONITOR_ROOM = 'monitor-room'

# enter ktv, not enter room
@socketio.on('monitor')
def monitor_connect():
    join_room(MONITOR_ROOM)
    rooms = []
    for room_id in ROOM_NUM:
        room = {}
        room["roomid"] = room_id
        room["mem_num"] = ROOM_NUM[room_id]
        room["name"] = ROOM_NAME[room_id]
        if len(ROOM[room_id]['songlist']) > 0:
            room["song_playing"] = ROOM[room_id]['songlist'][0]
        else:
            room["song_playing"] = ''
        rooms.append(room)
    # print(rooms)
    socketio.emit('get_rooms_status',rooms,room=request.sid)
    
@socketio.on('supermanager')
def send_all_infomation(data):
    rooms = []
    for room_id in ROOM_NUM:
        room = {}
        room["roomid"] = room_id
        room["mem_num"] = ROOM_NUM[room_id]
        room["name"] = ROOM_NAME[room_id]
        room["inner"] = ROOM[room_id]
        rooms.append(room)
    socketio.emit('get_all_rooms',rooms,room=request.sid)

@socketio.on('reset')
def reset_room(data):
    room_id = data['room']
    if room_id == 'all':
        Rooms = KtvDB.get_rooms()
        for room in Rooms:
            room_id = str(room['id'])
            ROOM[room_id]['songlist'] = []
            ROOM[room_id]['ISFree'] = True
            ROOM[room_id]['CanControl'] = True
            ROOM[room_id]['starttime'] = 0
            ROOM[room_id]['startfrom'] = 0
            ROOM[room_id]['ISPlaying'] = False
            ROOM[room_id]['reqcache'] = 0
    else:
        try:
            ROOM[room_id]['songlist'] = []
            ROOM[room_id]['ISFree'] = True
            ROOM[room_id]['CanControl'] = True
            ROOM[room_id]['starttime'] = 0
            ROOM[room_id]['startfrom'] = 0
            ROOM[room_id]['ISPlaying'] = False
            ROOM[room_id]['reqcache'] = 0
        except:
            pass

@socketio.on('reload_rooms')
def reload_room(data):
    _init_rooms()
    print('reload rooms')

@socketio.on('operate_room')
def operate_room(data):
    if data['operation'] == 'rename':
        KtvDB.rename_room(data['roomid'],data['roomname'])
        ROOM_NAME[data['roomid']] = data['roomname']
        print(data['roomid'] +' rename as '+ data['roomname'])

    if data['operation'] == 'create':
        room_id = KtvDB.create_room(data['roomname'])
        ROOM[room_id] = {}
        ROOM[room_id]['songlist'] = []
        ROOM[room_id]['ISFree'] = True
        ROOM[room_id]['CanControl'] = True
        ROOM[room_id]['starttime'] = 0
        ROOM[room_id]['startfrom'] = 0
        ROOM[room_id]['ISPlaying'] = False
        ROOM[room_id]['reqcache'] = 0
        ROOM_NAME[room_id] = data['roomname']
        
        ROOM_NUM[room_id] = 0
        ROOM_NUM_CACHE[room_id] = 0
        print('create room '+ data['roomname'] + ' with id = ' + room_id)

'''
    点名所有客户端，让他们报到
'''
def _call_the_roll():
    socketio.emit('reportexist','1')
    # wait for clients' response
    time.sleep(5)
    _gather_clients()
    # start call the roll again
    threading.Thread(target = _call_the_roll).start()

gathering = False

@socketio.on('report')
def client_report(msg):
    # cache is not locked
    if not gathering:
        room_id = msg['room']
        ROOM_NUM_CACHE[room_id] += 1

def _gather_clients():
    # lock cache
    gathering = True
    for room_id in ROOM_NUM:
        # write cache to room num
        ROOM_NUM[room_id] = ROOM_NUM_CACHE[room_id]
        # clear cache
        ROOM_NUM_CACHE[room_id] = 0
    # free cache
    gathering = False


# read from database to init room info
def _init_rooms():
    Rooms = KtvDB.get_rooms()
    for room in Rooms:
        room_id = str(room['id'])
        ROOM[room_id] = {}
        ROOM[room_id]['songlist'] = []
        ROOM[room_id]['ISFree'] = True
        ROOM[room_id]['CanControl'] = True
        ROOM[room_id]['starttime'] = 0
        ROOM[room_id]['startfrom'] = 0
        ROOM[room_id]['ISPlaying'] = False
        ROOM[room_id]['reqcache'] = 0
        # print('load a room')
        # print(ROOM[room_id])

        ROOM_NAME[room_id] = room['name']
        # print(room['name'])
        # print('      ——————————————      ')
        ROOM_NUM[room_id] = 0
        ROOM_NUM_CACHE[room_id] = 0

if __name__ == '__main__':
    _init_rooms()
    print('init rooms')
    # threading.Thread(target = _call_the_roll).start()
    socketio.run(app,port=3000)