import SQLiteDB
import json
import random

#创建房间
def create_room(room_name):
    room_id = Generate_ID()
    fetch_sql = "SELECT * FROM rooms WHERE roomid = '" + room_id + "'"
    conn = SQLiteDB.get_conn(SQLiteDB.KTVDB_FILE_PATH)
    table = SQLiteDB.fetchall(conn, fetch_sql)
    if len(table) == 0:
        add_sql = '''INSERT INTO rooms values (?, ?, ?)'''
        data = [(room_id, room_name, 0),]
        conn = SQLiteDB.get_conn(SQLiteDB.KTVDB_FILE_PATH)
        SQLiteDB.save(conn, add_sql, data)
        return room_id
    else:
        return ''

#房间重命名
def rename_room(room_id, room_name):
    fetch_sql = "SELECT * FROM rooms WHERE roomid = '" + room_id + "'"
    conn = SQLiteDB.get_conn(SQLiteDB.KTVDB_FILE_PATH)
    table = SQLiteDB.fetchall(conn, fetch_sql)
    if len(table) > 0:
        update_sql = '''UPDATE rooms SET roomname = ? WHERE roomid = ? '''
        data = [(room_name, room_id),]
        conn = SQLiteDB.get_conn(SQLiteDB.KTVDB_FILE_PATH)
        SQLiteDB.update(conn, update_sql, data)
        return True
    else:
        return False

#def set_onlinenum():

#返回全部房间信息
def get_rooms():
    count_sql = "SELECT count(*) FROM rooms"
    fetch_sql = "SELECT * FROM rooms"
    conn = SQLiteDB.get_conn(SQLiteDB.KTVDB_FILE_PATH)
    num = SQLiteDB.fetchall(conn, count_sql)
    table = SQLiteDB.fetchall(conn, fetch_sql)
    rooms = []
    if len(table) > 0:
        for i in range(len(table)):
            room = {
                'id':table[i][0],
                'name':table[i][1],
                'onlinenum':table[i][2]
            }
            rooms.append(room)
    # dic = {'num':num, 'rooms':rooms}
    # myjson = json.dumps(dic, ensure_ascii = False)
    # return myjson
    return rooms


def Generate_ID():
    number1 = random.randint(0, 9)
    number2 = random.randint(0, 9)
    number3 = random.randint(0, 9)
    number4 = random.randint(0, 9)
    mystr = str(number1) + str(number2) + str(number3) + str(number4)
    return mystr