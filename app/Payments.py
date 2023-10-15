import sys, time
from datetime import datetime, timedelta
import requests as r
import hashlib
import json
from app.data import sql_query as s, sql_fetch_list as f
from app.email_mod import send_mail as mail
import app.KKM_test as Kkm
from app.send_sms import sms
from app.site_settings import alfa_url, return_url, alfa_token, tinkoffPars, tin_url
from app.site_settings import tin_URLs
from app.site_settings import tin_successURL


# url = 'https://payment.alfabank.ru/payment/rest/register.do'
# token = 'nb9vb7d5g14af89m84n3vqohhb'
# returnUrl = 'http://fanfan.store:8082/promo?trace?'
# returnUrl = 'http://fanfan.store:8082/basket?trace?'
# returnUrl = 'http://127.0.0.1:8000/promo?trace?'
url = alfa_url()
token = alfa_token()
returnUrl = return_url()
tinURL = "https://securepay.tinkoff.ru/v2/Init"


def key_value(key, dictionary):
    value = [dictionary[b] for b in dictionary if b == key]
    return value[0] if len(value) == 1 else None


def method(pmt_method):
    match pmt_method:
        case 'SBP_C2B':
            return 'по QR-коду'
        case 'CARD':
            return 'по карте'
    return 'error'


def my_dict(string):
    d = {}
    l = string.split(', ')
    for el in l:
        new_el = el.split(':')
        d[new_el[0]] = str(new_el[1])
    return d


def pmt_link(args):
    suffix = '' + args['orderNumber']
    # returnUrl = returnUrl + '?' + suffix
    base_params = {'token': token, 'returnUrl': returnUrl + suffix}

    params = base_params | args
    # print(args, ' from pmt_link')
    response = r.post(url, params).text
    # print('url, params from pmt_link procedure: ', url, params)
    res = json.loads(response)
    # print(res, 'this is the "res" from "pmt_link" procedure')
    # key = 'formUrl'
    # if key_value(key, res):
    #     link = res['formUrl']
    # else:
    #     link =
    # print(link, " res['formUrl']")
    return res


def order_id(args):
    # params = my_dict(args)
    args_phone = args['phone']
    orderid = args["orderNumber"].split("-")
    seq_id = orderid[1]
    seed = orderid[0]
    base_params = {'token': token, 'returnUrl': returnUrl}
    params = base_params | args
    # print(f"params for r.post: {params}")
    response = r.post(url, params).text
    res = json.loads(response)
    key = list(res)[0]
    SUBJECT = 'sending payment link'
    if key == 'errorCode':
        message = seed + ": " + res['errorMessage']
    else:
        message = seed + ':' + seq_id + ':' + res['orderId']
        sql_parameter = "'" + message + "'"

# this is the procedure to return payment link
# if returns that means link was generated
        sql = f"declare @r int, @string varchar(max) = {sql_parameter}; " \
              f"exec @r = web.suffix_record @string; select @r;"
        # sql_return_code = f"suffix result: {s(sql)}"
        # print(f"sql_return_code: {sql_return_code}")

        link = res['formUrl']
        print(link)
        message = 'ссылка для оплаты заказа №' + str(seed) + '\n' + link
        order_confirmation_message = 'заказ №' + seed + ', оплата:  ' + link
        sms(args_phone, order_confirmation_message)
    return_message = {"subject": SUBJECT, 'body': message}
    print(return_message, " : return message from order_id procedure")
    s_message = json.dumps(return_message, ensure_ascii=False)
    mail(s_message)
    if key != 'errorCode':
        print('no error')
        # time.sleep(30)
        return order_status(args)
    # print(order_confirmation_message)
    return return_message


"""
    #parameters to be environed
"""


def order_status(args):
    print('initialising order_status procedure')
    orderid = args["orderNumber"]
    seed = orderid.split("-")[0]
    url = 'https://payment.alfabank.ru/payment/rest/getOrderStatusExtended.do'
    userName = 'r-fanfan-api'
    password = 'ZakutiliNA25'
    params = {'userName': userName, 'password': password, 'orderNumber': orderid}
    response = r.post(url, params).text
    res = json.loads(response)
    try:
        status = res['orderStatus']
    except KeyError:
        print('an exception occurred: status not defined')
        time.sleep(30)
        return order_status(args)
    # print(status)
    SUBJECT = 'checking order status'

    if status == 2:
        mes = 'Проведена полная авторизация суммы заказа ' + seed
        print(mes)
        pmtType = method(res['paymentWay'])
        pmtAmount = float(res['paymentAmountInfo']['totalAmount']/100)
        pmt_string = f"'{pmtType}:{pmtAmount}:АЛЬФА-БАНК'"
        # print(pmt_string)

        sql = f"declare @r int, @cancel bit = 'False', @orderid varchar(max) = '{seed}', @note varchar(max), @pmtStr varchar(max) = {pmt_string}; " \
              f"if @@TRANCOUNT>0 rollback transaction; " \
              f"exec @r = web.order_action_p @orderid =@orderid, @cancel = @cancel, @note = @note output, @pmtStr= @pmtStr; select @r, @note;"
        print(sql)
        r_string = f(sql)
        print(r_string)
        if r_string[0] > 0:
            r_list = r_string[1].split('" "')
            name = r_list[0]
            sale_id = r_string[0]
            products = r_list[1].strip('\"')
            cash_payment = float(r_list[2].strip('\"'))
            is_return = r_list[3]
            total = 0
            lines = products.split(';')
            for el in lines:
                product = list(el.split(','))
                total += float(product[2])
                if len(sys.argv) == 1:
                    print(product[0])
            card_payment = total - cash_payment
            Kkm.receipt(name, products, card_payment, is_return)
            receipt = Kkm.last_document_info()
            print(f'фиск. строка: {receipt}, type: {type(receipt)}')
            sql = f"""set nocount on;
            update s set s.receiptid = {receipt[0]}, s.fiscal_id = {"'" + str(receipt[1] + "'")}
            from inv.sales s
            where s.saleID={sale_id};
            select @@ROWCOUNT;"""
            result = s(sql)
            print(result)
            return result
        else:
            s_message = 'procedure returned error'
            print(s_message)
            return s_message

    elif status == 0:
        sql = f"set nocount on; exec web.reservation_state {int(seed)};"
        response = s(sql)
        print(response)
        if response == 'cancelled':
            s_message = response
            return s_message

        mes = 'Заказ ' + seed + ' зарегистрирован, но не оплачен;'
        print(mes)
        time.sleep(20)
        return order_status(args)

    elif status == 6:
        mes = 'Авторизация заказа ' + seed + ' отклонена.'
    # print(mes)
    return_message = {"subject": SUBJECT, 'body': mes}
    s_message = json.dumps(return_message, ensure_ascii=False)
    mail(s_message)
    return s_message


def order_status_site(args):
    print('initialising order_status procedure')
    orderid = args["orderNumber"]
    seed = orderid.split("-")[0]
    url = 'https://payment.alfabank.ru/payment/rest/getOrderStatusExtended.do'
    userName = 'r-fanfan-api'
    password = 'ZakutiliNA25'
    params = {'userName': userName, 'password': password, 'orderNumber': orderid}
    print(params, ' that is coming from procedure')
    response = r.post(url, params).text
    res = json.loads(response)
    try:
        status = res['orderStatus']
    except KeyError:
        print('an exception occurred: status not defined')
        time.sleep(10)
        return
    # print(status)
    SUBJECT = 'checking order status'
    if status == 2:
        mes = 'Проведена полная авторизация суммы заказа ' + seed
        print(mes)
        pmtType = method(res['paymentWay'])
        pmtAmount = float(res['paymentAmountInfo']['totalAmount']/100)
        pmt_string = f"'{pmtType}:{pmtAmount}:АЛЬФА-БАНК'"
        # print(pmt_string)
        sql = f"declare @r int, @cancel bit = 'False', @orderid varchar(max) = '{seed}', @note varchar(max), @pmtStr varchar(max) = {pmt_string}; " \
              f"if @@TRANCOUNT>0 rollback transaction; " \
              f"exec @r = web.order_action_p @orderid =@orderid, @cancel = @cancel, @note = @note output, @pmtStr= @pmtStr; select @r, @note;"
        print(sql)
        r_string = f(sql)
        print(r_string, " : return from sql query when status =2")
        if r_string[0] > 0:
            r_list = r_string[1].split('" "')
            name = r_list[0]
            sale_id = r_string[0]
            products = r_list[1].strip('\"')
            cash_payment = float(r_list[2].strip('\"'))
            is_return = r_list[3]
            total = 0
            lines = products.split(';')
            for el in lines:
                product = list(el.split(','))
                total += float(product[2])
                if len(sys.argv) == 1:
                    print(product[0])
            card_payment = total - cash_payment
            Kkm.receipt(name, products, card_payment, is_return)
            receipt = Kkm.last_document_info()
            print(f'фиск. строка: {receipt}, type: {type(receipt)}')
            sql = f"""set nocount on;
            update s set s.receiptid = {receipt[0]}, s.fiscal_id = {"'" + str(receipt[1] + "'")}
            from inv.sales s
            where s.saleID={sale_id};
            select @@ROWCOUNT;"""
            result = s(sql)
            print(result, "  - in procedure")
            return result
        else:
            s_message = 'procedure returned error'
            print(s_message)
            return s_message
    elif status == 0:
        sql = f"set nocount on; exec web.reservation_state {int(seed)};"
        response = s(sql)
        print(response, 'from sql')
        if response == 'cancelled':
            s_message = response
            return s_message
        mes = 'Заказ ' + seed + ' зарегистрирован, но не оплачен;'
        print(mes)
        time.sleep(5)
        return order_status(args)
    elif status == 6:
        mes = 'Авторизация заказа ' + seed + ' отклонена.'
    # print(mes)
    return_message = {"subject": SUBJECT, 'body': mes}
    s_message = json.dumps(return_message, ensure_ascii=False)
    mail(s_message)
    print(s_message)
    return s_message


def tinkoffInitPars(token):
    pars = tinkoffPars()
    tokenData = {
        "Amount": token["Amount"],
        "OrderId": token["OrderId"],
        "Password": pars["Password"],
        "TerminalKey": pars["TerminalKey"]
    }
    tokenValues = ''.join(str(val) for val in tokenData.values())
    encoded = tokenValues.encode()
    Token = hashlib.sha256(encoded).hexdigest()
    interval = token["interval"]
    expiration_time = datetime.now() + timedelta(seconds=interval)
    success = tin_URLs().get("success")
    notification = tin_URLs().get("notification")
    data = {
        "TerminalKey": pars["TerminalKey"],
        "Amount": token["Amount"],
        "OrderId": token["OrderId"],
        "Token": Token,
        "RedirectDueDate": expiration_time.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "SuccessURL": success,
        # "SuccessURL": tin_successURL(),
        "FailURL": "https://fanfan.store/promo",
        # "NotificationURL": "https://fanfan.store/info"
        "NotificationURL": notification
    }

    arg = {
        "headers": pars["headers"],
        "json": data
    }
    return arg


def tinkoff_link(arg):
    token = {
        "Amount": arg.get("amount"),
        "interval": arg.get("timeOutSec"),
        "OrderId": arg.get("orderNumber")
    }
    args = tinkoffInitPars(token)
    print(args)
    response = r.post(tin_url(), **args)
    return response.json()


if __name__ == '__main__':
    pmtPars = {
        'orderNumber': '79056-625',
        'description': 'order # 79056',
        'amount': 1000,
        'timeOutSec': 900,
        'phone': '9167834248',
        'email': 'af.fanfan.2012@gmail.com'
    }
    link = tinkoff_link(pmtPars)
    print(link)

