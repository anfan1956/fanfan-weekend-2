import pyodbc
from pyodbc import connect as cnn
import os
from app.site_settings import server

PWD = os.environ.get('sql_path')
# server = '62.181.56.179,41433'
Demo_server = '10.0.0.7'
# server = '127.0.0.1'


def cn(demo=False):
    Server = server()
    if demo:
        Server = Demo_server
    con = cnn('Driver={ODBC Driver 17 for SQL Server};'
              f'Server={Server};'
              'Database=fanfan;'
              'UID=anfan;'
              f'PWD={PWD};')
    return con


def sql_query(args):
    con = cn()
    cursor = con.cursor()
    # print(args)
    cursor.execute(args)
    result = cursor.fetchone()[0]
    con.commit()
    con.close()
    return result


def sql_tinkoff_info(args):
    con = cn(True)
    print(f'module data.py, sql_tinkoff_info cn(): {con}')
    cursor = con.cursor()
    # print(args)
    cursor.execute(args)
    result = cursor.fetchone()[0]
    con.commit()
    con.close()
    return result


def sql_fetch_list(args):
    con = cn()
    cursor = con.cursor()
    cursor.execute(args)
    result = cursor.fetchall()
    con.commit()
    con.close()
    result = list(result[0])
    return result


def sql_list(args):
    con = cn()
    cursor = con.cursor()
    result = [r[0] for r in cursor.execute(args)]
    con.commit()
    con.close()
    print(pyodbc.version)
    return result


def get_photos(event_id):
    sql = f'select styles_photos from web.styles_photos_({event_id})'
    print(sql)
    photo = sql_query(sql).split(',')
    return photo


if __name__ == '__main__':
    event_id = 1
    # sql = 'set nocount on; insert tmp.jobs default values; select * from tmp.jobs'
    # sql = f'select styles_photos from web.styles_photos_({event_id})'
    # sql = "select cust.customer_id('9167834248')"
    sql = "select cust.customer_mail('9167834248')"
    print(sql)
    res = sql_query(sql)
    # photo = sql_fetch_list(sql)
    print(res)
