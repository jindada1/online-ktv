import sqlite3
import os

#数据库文件绝对路径
UserDB_FILE_PATH = './users.db'
KTVDB_FILE_PATH = './ktvrooms.db'

#获取数据库连接对象
def get_conn(path):
    conn = sqlite3.connect(path)
    if os.path.exists(path) and os.path.isfile(path):
        return conn
    else:
        conn = None
        return sqlite3.connect(':memory:')

#获取数据库游标对象
def get_cursor(conn):
    if conn is not None:
        return conn.cursor()
    else:
        return get_conn('').cursor()

#创建数据库表
def create_table(conn, sql):
    if sql is not None and sql != '':
        cur = get_cursor(conn)
        cur.execute(sql)
        conn.commit()
        close_all(conn, cur)
    else:
        pass

#删除数据库表
def drop_table(conn, table):
    '''如果表存在,则删除表，如果表中存在数据的时候，使用该
    方法的时候要慎用！'''
    if table is not None and table != '':
        sql = 'DROP TABLE IF EXISTS ' + table
        cur = get_cursor(conn)
        cur.execute(sql)
        conn.commit()
        close_all(conn, cur)
    else:
        pass

#关闭数据库游标对象和连接对象    
def close_all(conn, cursor):
    try:
        if cursor is not None:
            cursor.close()
    finally:
        if cursor is not None:
            cursor.close()

#插入数据
def save(conn, sql, data):
    if sql is not None and sql != '':
        if data is not None:
            cur = get_cursor(conn)
            for d in data:
                cur.execute(sql, d)
                conn.commit()
            close_all(conn, cur)
        else:
            pass
    else:
        pass

#查询所有数据
def fetchall(conn, sql):
    if sql is not None and sql != '':
        cur = get_cursor(conn)
        cur.execute(sql)
        table = cur.fetchall()
        return table
    else:
        pass

#查询多条数据
def fetchmany(conn, sql, num):
    if sql is not None and sql != '':
        cur = get_cursor(conn)
        cur.execute(sql)
        table = cur.fetchmany(num)
        return table
    else:
        pass

#更新数据/删除数据
def update(conn, sql, data):
    if sql is not None and sql != '':
        if data is not None:
            cur = get_cursor(conn)
            for d in data:
                cur.execute(sql, d)
                conn.commit()
            close_all(conn, cur)
    else:
        pass