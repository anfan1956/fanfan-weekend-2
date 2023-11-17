import requests
from xmltodict import parse


def daily_rates():
    rates = {}
    response = requests.get('http://www.cbr.ru/scripts/XML_daily.asp')
    res = parse(response.content.decode(encoding=response.encoding))

    rates['date'] = res['ValCurs']['@Date']
    for v in res['ValCurs']['Valute']:
        v['Value'] = float(v['Value'].replace(',', '.'))
        rates[v['CharCode']] = v
    #
    # for cur in arg:
    #     daily[cur] = rates[cur]['Value']
    #     daily['date'] = rates.get('date')
    return rates


if __name__ == '__main__':
    cr_list = ['USD', 'EUR', 'GBP']
    r = daily_rates()
    print(r)
    the_date = r.get('date')
    rr = the_date.split(".")
    rr.reverse()
    rrr = ''.join(rr)
    print(the_date, rrr)
