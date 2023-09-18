import requests

url = "https://smsc.ru/sys/send.php"
login = "anfan"                     # API
password = "i4dLd4wfW8uu4Wr"
cost_request = 0
signature = "FANFAN_WKND"
phone = '9167834248'
result = 'test'


def response_send(params):
    r = requests.get(url, params)
    return r.status_code


def sms(phone, result):
    string_ms = "7" + phone + ":" + str(result)
    params = {'login': login, 'psw': password, 'list': string_ms, 'cost': cost_request, 'op': 1, 'sender': signature}
    return response_send(params)


if __name__ == '__main__':
    sms(phone, result)
    print(result)
