from app import app
from app.functions import menu, dt_time_max, form, art_display, set_dates, finish_date
from app.functions import goods, inv_set, the_totals, calculate_webOrder, key_value
from app.Payments import pmt_link
from app.send_sms import sms
from app.mails import fanfan_send_mail
from app.data import sql_query as s, sql_list, sql_fetch_list
from flask import render_template, redirect, request, url_for, make_response, jsonify, flash, abort
import json, re, uuid
from random import randint

parent = "/static/images/parent/"
sms_messages = True
sms_messages = False
full = True


@app.route("/about")
def about():
    content = {"title": "про ФанФан и Weekend", "menu": menu()}
    # print(content['menu'])
    # abort(404)
    return render_template('about.html', **content)


@app.route('/')
def home():
    # return '<h1> Hi, it is home</h1>'
    return redirect(url_for("promo"))


@app.route("/basket")
def basket():
    print(f"request.path: {request.path}, request.method: {request.method}")
    content = {"title": "КОРЗИНА", "menu": menu()}
    phone = request.cookies.get('phone')
    if not phone:
        res = make_response(redirect(url_for('register', menu=menu())))
        res.set_cookie("currentLocation", request.path)
        return res
    sql = f"select web.delivery_addr_js_('{phone}')"
    print(sql)
    addr_list = json.loads(s(sql))
    # print(f'addr_list: {addr_list}, {type(addr_list)}')
    if request.method == 'GET':
        # print(f"request.cookies.get: {phone}")
        # print(f"request.args: {request.args}")
        address = request.args.get("deliverTo")
        content['deliverTo'] = address
        content['addrData'] = addr_list
        print('flag 1')
    sql = f"select web.basketContent_('{phone}')"
    print(f"sql:  {sql}")
    data = s(sql)
    # print(f"from web.basketContent sql :{data}")
    data = json.loads(data)
    data_0 = data[0]
    basket_content = data_0.get('корзина')
    sql = f"select cust.basket_totals_json('{phone}')"
    print(sql)
    # print(f"sql for basket totals response: {s(sql)}")
    basket_totals = json.loads(s(sql))[0]
    totals = basket_totals.get('итого')
    # print(basket_totals, type(basket_totals), f" итого: {totals}")
    # print(basket_content, type(basket_content))
    if not basket_content:
        headers = list(data[0].keys())
        content['headers'] = headers
        content['data'] = data
        if basket_totals:
            content['totals'] = basket_totals
        # else:
        #     content['totals'] = 0
    else:
        content['basket_content'] = basket_content
        # print(f"Корзина: {basket_content}")
    return render_template('basket.html', **content)


@app.route("/register", methods=['POST', 'GET'])
def register():
    print(f"method: {request.method}, path: {request.path}")
    if request.method == 'POST':
        dt = dt_time_max()
        response = {}
        data = request.get_json()
        phone = data.get('phone')
        phone_mail_confirmation = data.get('phone_mail_confirmation')
        if phone_mail_confirmation:
            phone_mail_confirmation = re.sub(r"(^8)|(\+7)|[\s\-\(\)]", '', phone_mail_confirmation)
        sms_enter = data.get('sms_enter')
        email = data.get('email')
        email_new = data.get('email_new')
        emailCode = data.get('emailCode')
        data = f"'{json.dumps(data)}'"
        print(data)
        if phone:
            phone = re.sub(r"(^8)|(\+7)|[\s\-\(\)]", '', phone)
            print(phone)
            if len(phone) != 10:
                return redirect(request.path)
            if not sms_enter:
                sql = f"set nocount on; declare @r int; exec @r = web.smsGenerate '{phone}'; select @r"
                sms_mes = str(s(sql))
                print(sms_mes)
                if sms_messages:
                    sms(phone, sms_mes)
                response["code"] = sms_mes
                response["mode"] = 1
                results = jsonify(response)
            else:
                sql = f"select top 1 smsCode from web.sms_log where phone = '{phone}' order by logid desc"
                sms_msg = str(s(sql))
                print(sms_msg)
                if sms_enter == sms_msg:
                    Session = request.cookies.get('Session')
                    print(f"Session: {Session}")
                    sql = f"set nocount on; declare @note varchar(max); exec web.promoAllStyles_p {phone}, @note output; select @note"
                    result = s(sql)
                    print(result)
                    if sms_messages:
                        sms(phone, result)
                    promocode = re.findall(r'\d{6}', result)[0]
                    sql = f"select cust.customer_mail('{phone}')"
                    print(sql)
                    q_result = s(sql)
                    print(q_result)
                    response["email"] = q_result
                    response["mode"] = 2
                    print(response)
                    Session = str(uuid.uuid4())
                    results = make_response(jsonify(response))
                    results.set_cookie("phone", phone, expires=dt)
                    results.set_cookie("promo", promocode, expires=dt)
                    results.set_cookie("Session", Session, expires=dt)
                    return results
                else:
                    response = {"error": "неверный код"}
                results = jsonify(response)
            return results
        if email_new:
            if not emailCode:
                print(f"email must be working: {email_new}")
                flash("На вашу почту отправлен код подтверждения.", category="success")
                sql = f"set nocount on; declare @r int; exec @r = web.emailGenerate '{email_new}'; select @r"
                code = str(s(sql))
                print(code)
                argv = {'code': code, 'To': email_new}
                emai_sent = fanfan_send_mail(**argv)
                response["mode"] = 3
                print(f'"{emai_sent}": response to verification email')
                results = jsonify(response)
                # return results
            else:
                sql = f"select top 1 emailCode from web.email_log where email = '{email_new}' order by logid desc"
                print(f"sql: {sql}")
                email_msg = str(s(sql))
                print(email_msg)
                if email_msg == emailCode:
                    notes = True    # set temporarily will have to update with buttons later
                    sql = f"exec cust.email_update '{phone_mail_confirmation}' , '{email_new}' , '{notes}'"
                    print(sql)
                    result = s(sql)  # ______________________________________________________________________________________
                    print(f"email update result: {result}")  # __________________________________________________________
                    flash("Ваша почта подтверждена", category="success")
                    response['mode'] = 4
                    results = jsonify(response)
            return results
    return render_template('registration.html', menu=menu(), form=form())


@app.route("/main")
def main():
    content = {"title": "Последние поступления",
               "parent": parent,
               "articles": art_display('/main', 6),
               "menu": menu(),
               "dates": set_dates('/main', 6)}
    return render_template('main.html', **content)


@app.route("/promo")
def promo():
    content = {"title": finish_date(),
               "menu": menu(),
               # "goods": goods(),
               "parent": parent
               }
    if goods():
        content['goods'] = goods()
    # print(goods())
    return render_template("promo.html", **content)


@app.route('/product2/<styleid>', methods=['GET', 'POST'])
def product2(styleid):
    i = inv_set(styleid)[0]
    this_styleid = i.get('styleid')
    if this_styleid == 'not available':
        abort(404)
    print(request.path)
    sql = f"select web.product_({styleid})"
    big_data = json.loads(s(sql))
    # print(big_data, type(big_data))
    data = big_data[0]
    # print(f'data = big_data[0] {data}')
    content = {
        "menu": menu(),
        "parent": parent,
        # "data": style_data(styleid),
        "data": data,
        "last_date": finish_date()
    }
    return render_template('product2.html', **content)


@app.route('/catalog')
def catalog():
    articles = art_display('/catalog', 0)
    brands = sorted({a['бренд'] for a in articles})
    cats = sorted({a['категория'] for a in art_display('/catalog', 0)})
    content = {"title": "Каталог товаров",
               "parent": parent,
               "articles": articles,
               "brands": brands,
               "cats": cats,
               "menu": menu()}
    return render_template('catalog.html', **content)


@app.route("/shops")
def shops():
    phone = '9167834248'
    cookies = dict(request.cookies)
    print(cookies)
    if not request.cookies.get('phone'):
        # res = make_response(render_template("shops.html", title="Адреса магазинов", menu=menu()))
        res = make_response(redirect(url_for("shops", title="Адреса магазинов", menu=menu())))
        res.set_cookie('phone', phone)
        return res, 302
    else:
        res = make_response("Value of phone is {}".format(request.cookies.get('phone')))
        print(res)
        # return res
    # res = make_response(f"setting a cookie")
    # res.set_cookie("logged", "2222", 10)
    # res.set_cookie("phone", phone, 3)
    return render_template("shops.html", title="Адреса магазинов", menu=menu())


@app.route("/login2", methods=['POST', 'GET'])
def login2():
    print(f'request.method: "{request.method}", request.path: "{request.path}"')
    content = {"title": "Авторизация", "menu": menu()}
    if request.method == 'POST':
        dt = dt_time_max()
        print(request.form)
        phone = request.form.get('phone')
        email = request.form.get('email')
        emailCode = request.form.get('emailCode')
        smsInput = request.form.get('smsInput')
        btn_2 = request.form.get("btn-2")
        if phone:
            phone = re.sub(r"(^8)|(\+7)|[\s\-\(\)]", '', phone)
            if len(phone) != 10:
                flash("неверный формат телефона", "error")
                return redirect(request.path)
            flash("сообщение отправлено", category="success")
            Session = str(uuid.uuid4())
            if not smsInput:
                sql = f"set nocount on; declare @r int; exec @r = web.smsGenerate '{phone}'; select @r"
                sms_mes = str(s(sql))
                print(sms_mes)
                if sms_messages:
                    sms(phone, sms_mes)
                res = make_response(render_template('login.html', **content))
                res.set_cookie('code', 'sms', 3)
                res.set_cookie('phone', phone, 180)
                res.set_cookie('Session', Session, 180)
                res.set_cookie('email', 'email', 0)
                res.set_cookie('promo', 'promo', 0)
                return res
        if smsInput:
            phone = request.cookies.get('phone')
            sql = f"select top 1 smsCode from web.sms_log where phone = '{phone}' order by logid desc"
            sms_msg = str(s(sql))
            print(sms_msg)
            if smsInput == sms_msg:
                Session = request.cookies.get('Session')
                sql = f"set nocount on; declare @note varchar(max); exec web.promoAllStyles_p {phone}, @note output; " \
                      f"select @note "
                result = s(sql)
                if sms_messages:
                    sms(phone, result)
                result = re.findall(r'\d{6}', result)[0]
                flash('Телефон подтвержден. Промокод отправлен в СМС сообщении', category="success")
                sql = f"select cust.customer_mail('{phone}')"
                print(sql)
                q_result = s(sql)
                print(q_result)
                res = make_response(render_template("login.html", **content))
                res.set_cookie('phone', phone, expires=dt)
                res.set_cookie('email', q_result, 180)
                res.set_cookie('code', 'promo', 3)
                res.set_cookie('promo', result, expires=dt)  # is not finished________________________________________________________
                res.set_cookie('Session', Session, expires=dt)
                return res
            else:
                flash("неверный код СМС", category='error')
        if email:
            print(f"email: {email}")
            flash("На вашу почту отправлен код подтверждения.", category="success")
            sql = f"set nocount on; declare @r int; exec @r = web.emailGenerate '{email}'; select @r"
            code = str(s(sql))
            print(code)
            argv = {'code': code, 'To': email}
            response = fanfan_send_mail(**argv)
            print(f'"{response}": response to verification email')
            res = make_response(render_template("login.html", **content))
            res.set_cookie('code', 'email', 3)
            res.set_cookie('email', email, 180)
            return res
        if emailCode:
            email = request.cookies.get('email')
            phone = request.cookies.get('phone')
            notes = request.cookies.get('notes')
            notes = 'True' if notes == 'on' else 'False'
            sql = f"select top 1 emailCode from web.email_log where email = '{email}' order by logid desc"
            print(f"sql: {sql}")
            email_msg = str(s(sql))
            print(email_msg)
            if email_msg == emailCode:
                sql = f"exec cust.email_update '{phone}' , '{email}' , '{notes}'"
                print(sql)
                result = s(sql)  # ______________________________________________________________________________________
                print(f"email update result: {result}")  # __________________________________________________________
                flash("Ваша почта подтверждена", category="success")
                res = make_response(redirect(request.path))
                res.set_cookie("email", email, 0)
                res.set_cookie("code", 'allDone', 3)
                return res
            flash("неверный код подтверждения. Почта не зарегистрирована", category='error')
            res = make_response(redirect(request.path))
            res.set_cookie("code", 'promo', 3)
            res.set_cookie("email", email, 3)
            return res
        if btn_2:
            return redirect(url_for("promo"))
        else:
            res = make_response(render_template("login.html", **content))
            res.set_cookie('code', 'promo', 3)
            return res
    return render_template("login.html", **content)


@app.route('/sortCodeQty', methods=['POST', 'GET'])
def sortcode_qty():
    print(f'request.method: "{request.method}", request.path: "{request.path}"')
    results = None
    if request.method == 'POST':
        js_string = request.get_json()  # list of dictionaries
        procName = js_string[0].get('procName')
        phone = js_string[0].get('phone')
        print(f"procName:  {procName}")
        sql = f"select web.basketContent_('{phone}')"
        # print(sql)
        basketData = s(sql)
        response = json.loads(basketData)
        if procName == 'initialize':
            # print(f"print for proc initialize: {type(response)} {response}")
            if response[0].get("корзина"):
                res = {"this": 0, "total": 0}
            else:
                res = the_totals(response)
                # print(res)
            return res
        elif procName == 'sizeQuantities':
            data = js_string[1]
            # print(response)
            # print(f"print for proc sizeQuantities: {type(data)} {data}")
            res = the_totals(response, data)
            # print(res)
            return res
    else:
        print("those are results")
    return results


@app.route('/basket_actions', methods=['POST', 'GET'])
def basket_actions():
    print(f"method: {request.method}, path: {request.path}")
    if request.method == 'POST':
        # dt = dt_time_max()
        response = {}
        data = request.get_json()
        action = data[0].get('procName')
        phone = data[0].get('phone')
        orderTotal = data[0].get('orderTotal')
        if action == 'calculate':
            data = f"'{json.dumps(data)}'"
            sql = f"select web.basket_toPay_json({data})"
            print(sql)
            result = s(sql)
            result = json.loads(result)[0]
            # print(f"basket_actions from sql: {result}")
            response['OK'] = 'OK'
            response['toPay'] = result.get('toPay')
            res = response
        if action in ['remove', 'purchase']:
            data = json.dumps(data)
            data = f"'{data}'"
            # print(f"after if action '{action}': {data}")
            sql = f"exec web.basketAction_2 {data}"
            # print(f"sql: {sql}")
            result = s(sql)
            result = json.loads(result)[0]
            # print(f"basket_actions from sql if 'remove': {result}")
            # print(result)
            success = result.get('success')
            response['success'] = success
            res = result
            if success:
                res = result
            else:
                print('will have not to redirect')
                return res
            return res
        if action in ['ON_SITE RESERVATION']:
            # order = json.dumps(data)
            order = f"'{json.dumps(data)}'"
            # print(f"order ON_SITE RESERVATION: {order}")
            sql = f"select web.basketContent_('{phone}')"
            # print(sql)
            basketContent = json.loads(s(sql))
            # print(f"basketContent: {basketContent}, next step is the proc:")
            # print('\n', f"type basketContent: {type(basketContent)}, type data: {type(data)}")
            orderTotals = calculate_webOrder(basketContent, data)
            # print(orderTotals['amount'] == orderTotal, ": checking if th order goods are still avail")
            if orderTotals['amount'] == orderTotal:
                sql = f"exec web.reservation_json {order}"
                print(sql)
                result = json.loads(s(sql))
                pmtPars = result[0].get('pmtPars')
                pmtPars = f"'{full}', {pmtPars}"
                print(f"pmtPars:  {pmtPars}")
                sql = f"select web.pmt_str_params_({pmtPars}, next value for web.ordersSequence)"
                print(f"sql: {sql}")
                result = s(sql)
                print(f"result = s(sql) pmtStr parameters: {result}")
                pmtPars = json.loads(result)[0]
                print(f"pmtPars from 'oneClick': {pmtPars}")
                link = pmt_link(pmtPars)
                result = jsonify(link)
                return result
            else:
                msg = {"error": "Товар уже частично продан. Обновите корзину"}
                result = jsonify(msg)
                return result
        return res


@app.route('/oneClick', methods=['POST', 'GET'])
def oneClick():
    # some hard coding is done
    # to change when appropriate, wait_minutes, pickupShopid
    if request.method == "POST":
        data = request.get_json()
        # print(data)
        action = key_value('action', data)
        if action == 'paymentLink':
            args = ['styleid', 'color', 'size']
            par_string = ", ".join([f"'{data[k]}'" for k in args])
            sql = f"select barcodeid from inv.bc_sortid_qtys(inv.barcode_sortid_({par_string})) where shipOrder = 1"
            # print(sql)
            barcodeid = s(sql)
            args_2 = ['price', 'discount', 'promo', 'pickup', 'ticketid', 'final']
            par_string_2 = ", ".join([f"{data[k]}" for k in args_2])

            shop = 'FANFAN.STORE'
            user = 'INTERBOT F. '
            phone = data['phone']
            wait_minutes = 15
            pickupShopid = 27  # ____________________________________________________________________________________________
            sql_2 = f"set nocount on; declare @r int, @note varchar(max); if @@TRANCOUNT > 0 rollback transaction; " \
                    f" declare @info web.reservation_type; insert @info values ({barcodeid}, {par_string_2} ); " \
                    f" exec @r = web.reservation_create '{shop}', '{user}', '{phone}', @info , @note output, {wait_minutes}, " \
                    f"{pickupShopid}; select @note note, @r orderid;"
            # print(sql_2)
            result = sql_fetch_list(sql_2)
            jsdata = str(result[1]) + ", 900"  # hardcoding 900 seconds ______________________________________________________
            jsdata = f"'{full}', {jsdata}"
            sql = f"select web.pmt_str_params_({jsdata}, next value for web.ordersSequence)"
            # print(f"sql: {sql}")
            result = s(sql)
            # print(f"result = s(sql): {result}")
            pmtPars = json.loads(result)[0]
            # print(f"pmtPars from 'oneClick': {pmtPars}")
            link = pmt_link(pmtPars)
            result = jsonify(link)
            return result


@app.route('/goToBasket', methods=['POST', 'GET'])
def basket_user():
    print(f"request.path: {request.path}, request.method: {request.method}")
    if request.method == 'POST':
        js_string = request.get_json()
        procName = js_string[0].get('procName')
        phone = js_string[0].get('phone')
        arg = json.dumps(js_string)
        sql = f"exec web.basketAction_2 '{arg}';"
        response = s(sql)
        if procName == 'insert':
            data = js_string[1]
            sql2 = f"select web.basketContent_('{phone}')"
            basketData = s(sql2)
            response = json.loads(basketData)
            data = js_string[1]
            res = the_totals(response, data)
            return res
        results = json.loads(response)[0]
        err = results.get('error')
        if err:
            # print(results.get('error'))
            return results
        # print(results, type(results))
    return results


@app.route('/deliveryData', methods=['POST', 'GET'])
def deliveryData():
    print(f'request.method: "{request.method}", request.path: "{request.path}"')
    results = None
    if request.method == 'POST':
        data = request.get_json()
        action = data[0].get('action')
        dataJson = json.dumps(data, ensure_ascii=False)
        print(f"json dumps: {dataJson}")
        print(f"action: {action}")
        if action == 'use':
            sql = f"exec web.address_register_json '{dataJson}'; "
            res = s(sql)
            print(f"web.address_register_json returns: {res}")
            phone = data[0].get('phone')
            return res
            if phone:
                print(f"data[1]: {data[1]}")
                deliverTo = data[1].get('address')
                print(f"deliverTo: {deliverTo}")
                results = data[1]
    return results