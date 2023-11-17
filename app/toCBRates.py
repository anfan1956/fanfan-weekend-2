from app.cbr import daily_rates
from app.data import sql_allDB as sALL, cn_allDB, active_server
import datetime as d
import time as t


def cbrf_rates():
    cr_list = ['USD', 'EUR', 'GBP']
    cn_args = {
        "Server": active_server(True),
        "Database": "CBRates"
    }
    print(cn_args)
    l = daily_rates()
    td = l.get('date').split('.')
    td.reverse()
    td = ''.join(td)
    sql = f"""set nocount on; declare @r int, @rates dbo.rates_type, @the_time datetime = current_timestamp, @the_date date =  '{td}'; 
    insert @rates values """
    line = ''
    for key in cr_list:
        line += f"('{key}',  {str(l[key]['Value'])}), "
    sql += f'{line[:-2]}'
    sql += """; exec @r = dbo.cbr_rates_p2 @rates, @the_time, @the_date; select @r """
    result = sALL(cn_allDB(cn_args), sql)
    print("result: ", result)
    if result == 0:
        return 'rates updated'
    else:
        return 'there was a problem'


if __name__ == '__main__':
    hour = 3
    while True:
        if d.datetime.now().hour < hour:
            print(f'Do something {d.datetime.now()}, {d.datetime.now().hour}')
            hour = d.datetime.now().hour
            res = cbrf_rates()
            print(res)
            t.sleep(60)
