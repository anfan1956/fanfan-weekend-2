from app import app
from app.functions import menu, dt_time_max, form, art_display, set_dates, finish_date
from app.functions import goods, inv_set, the_totals, calculate_webOrder, key_value
from app.functions import delivery_data, use_pmtSys
from app.Payments import pmt_link, order_status_site
from app.send_sms import sms
from app.site_settings import send_sms_messages, make_full_payment, parent, pmt_keys
from app.mails import fanfan_send_mail, mail_pmt_link, mail_sales_receipt
from app.data import sql_query as s, sql_list, sql_fetch_list
from flask import render_template, redirect, request, url_for, make_response, jsonify, flash, abort
import json, re, uuid
from random import randint

parent = parent()
sms_messages = send_sms_messages()


@app.route("/home")
def home():
    content = {"title": "про ФанФан и Weekend", "menu": menu()}
    return render_template('home.html', **content)


@app.route("/not_found")
def not_found():
    content = {"title": "Page Not Found", "menu": menu()}
    # print(content['menu'])
    # abort(404)
    return render_template('404.html', **content)


@app.route('/')
def landing():
    # return '<h1> Hi, it is home</h1>'
    return redirect(url_for("promo"))


@app.route("/basketS")
def basketS():
    dt = dt_time_max()
    print(f"request.path: {request.path}, request.method: {request.method}")
    content = {"title": "КОРЗИНА", "menu": menu()}
    phone = request.cookies.get('phone')
    Session = request.cookies.get('Session')
    if not phone and not Session:
        res = make_response(redirect(url_for('register2')))
        res.set_cookie("currentLocation", request.path)
        Session = uuid.uuid4()
        res.set_cookie("Session", Session, expires=dt)

        return res
    else:
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
        sqlParams = {
            'phone': phone,
            'Session': Session
        }
        sqlParams = json.dumps(sqlParams)
        sql = f"select web.basketContent_json_('{sqlParams}')"
        print(f"sql for basket:  {sql}")
        data = s(sql)
        data = json.loads(data)
        data_0 = data[0]
        print('Printing basket content: ', data)
        basket_content = data_0.get('корзина')
        # sql = f"select cust.basket_totals_json('{phone}')"
        sql = f"select cust.basket_totals_json('{sqlParams}')"
        print(sql)
        basket_totals = json.loads(s(sql))[0]
        totals = basket_totals.get('итого')
        if not basket_content:
            headers = list(data[0].keys())
            content['headers'] = headers
            content['data'] = data
            if basket_totals:
                content['totals'] = basket_totals
        else:
            content['basket_content'] = basket_content
    return render_template('basketS.html', **content)


@app.route("/basket")
def basket():
    print(f"request.path: {request.path}, request.method: {request.method}")
    content = {"title": "КОРЗИНА", "menu": menu()}
    phone = request.cookies.get('phone')
    Session = request.cookies.get('Session')
    if not phone and not Session:
        res = make_response(redirect(url_for('register2', menu=menu())))
        res.set_cookie("currentLocation", request.path)
        return res
    if phone or Session:
        sql = f"select web.delivery_addr_js_('{phone}')"
        # sql = f"select web.top_adr_('{phone}')"
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
        sqlParams = {
            'phone': phone,
            'Session': Session
        }
        sqlParams = json.dumps(sqlParams)
        sql = f"select web.basketContent_json_('{sqlParams}')"
        print(f"sql for basket:  {sql}")
        data = s(sql)
        data = json.loads(data)
        data_0 = data[0]
        print(data_0)
        basket_content = data_0.get('корзина')
        sql = f"select cust.basket_totals_json('{sqlParams}')"
        print(sql)
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
        else:
            content['basket_content'] = basket_content
    return render_template('basket.html', **content)


@app.route("/register2", methods=['POST', 'GET'])
def register2():
    print(f"method: {request.method}, path: {request.path}")
    Session = request.cookies.get('Session')
    dt = dt_time_max()
    print(Session)
    if request.method == 'POST':
        results = None
        if request.method == 'POST':
            response = {}
            data = request.get_json()
            print(data)
            mode = data.get('mode')
            phone = data.get('phone')
            requestMail = data.get('requestMail')
            deleteEmail = data.get('deleteEmail')
            if mode == 0:
                sql = f"set nocount on; declare @r int; exec @r = web.smsGenerate '{phone}'; select @r"
                sms_mes = str(s(sql))
                print(sms_mes)
                response['sms-code'] = sms_mes
                results = jsonify(response)
                if sms_messages:
                    sms(phone, sms_mes)
            elif mode == 2:
                if deleteEmail:
                    sql = f"cust.email_delete '{phone}'"
                    results = jsonify(s(sql))
                sms_entered = data.get('sms_entered')
                sql = f"select top 1 smsCode from web.sms_log where phone = '{phone}' order by logid desc"
                sms_msg = str(s(sql))
                if sms_msg == sms_entered or requestMail:
                    print(sms_entered, sms_msg, ': just printing, not sms')
                    sql = f"set nocount on; declare @note varchar(max); exec web.promoAllStyles_p {phone}, @note output; select @note"
                    result = s(sql)
                    print(result)
                    if not requestMail:
                        if sms_messages:
                            sms(phone, result)
                    promo = re.findall(r'\d{6}', result)[0]
                    sql = f"select cust.customer_mail('{phone}')"
                    q_result = s(sql)
                    print(q_result)
                    sql = f"select cust.customer_prefs ('{phone}')"
                    prefs = json.loads(s(sql))[0]
                    for p in prefs:
                        response[p] = prefs[p]
                    sql = f"select cust.customer_mail('{phone}')"
                    print(sql)
                    response['promo'] = promo
                    response["email"] = q_result
                    response['mode'] = mode
                    Session = str(uuid.uuid4())
                    results = make_response(jsonify(response))
                    results.set_cookie("phone", phone, expires=dt)
                    results.set_cookie("promo", promo, expires=dt)
                    results.set_cookie("Session", Session, expires=dt)

                else:
                    response['error'] = "wrong code"
                    response['mode'] = 0
                    results = jsonify(response)
            elif mode == 3:
                email_new = data.get('email')
                sql = f"set nocount on; declare @r int; exec @r = web.emailGenerate '{email_new}'; select @r"
                code = str(s(sql))
                print(code)
                argv = {'code': code, 'To': email_new}
                emai_sent = fanfan_send_mail(**argv)
                response["mode"] = mode
                results = jsonify(response)
            elif mode == 4:
                email_new = data.get('email')
                emailCode = data.get('code')
                sql = f"select top 1 emailCode from web.email_log where email = '{email_new}' order by logid desc"
                # print(f"sql: {sql}")
                email_msg = str(s(sql))
                print(email_msg)
                if email_msg == emailCode:
                    notes = True  # set temporarily will have to update with buttons later
                    sql = f"exec cust.email_update '{phone}' , '{email_new}' , '{notes}'"
                    print(sql)
                    result = s(sql)  # ______________________________________________________________________________________
                    print(f"email update result: {result}")  # __________________________________________________________
                    response['mode'] = mode
                    results = jsonify(response)
            elif mode == 5:
                if len(phone) != 10:
                    response['error'] = 'неверно указан телефон'
                else:
                    jsonData = json.dumps(data)
                    print(jsonData)
                    sql = f"exec cust.prefs_update '{jsonData}'"
                    print(s(sql))
                    response['updated'] = True
                results = jsonify(response)
            # print(results)
        return results
    if not Session or Session == 'newSession':
        print('will have to make new cookie')
        Session = str(uuid.uuid4())
        # res = make_response(redirect(url_for('register2', menu=menu(), form=form())))
        res = make_response(redirect(url_for('register2')))
        res.set_cookie("Session", Session, expires=dt)
        return res
    return render_template('register2.html', menu=menu(), form=form())


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
    print("print: request.method, request.path: ", request.method, request.path)
    content = {"title": finish_date(),
               "menu": menu(),
               "parent": parent
               }
    if goods():
        content['goods'] = goods()
    res = make_response(render_template("promo.html", **content))
    res.set_cookie("currentLocation", request.path, expires=dt_time_max())
    Session = request.cookies.get("Session")
    if not Session:
        Session = str(uuid.uuid4())
        res.set_cookie("Session", Session, expires=dt_time_max())
    return res
    # return render_template("promo.html", **content)


@app.route('/product2/<styleid>', methods=['GET', 'POST'])
def product2(styleid):
    phone = request.cookies.get('phone')
    Session = request.cookies.get('Session')
    if not phone and not Session:
        res = make_response(redirect(url_for('register2', menu=menu())))
        res.set_cookie("currentLocation", request.path)
        return res
    sql = f"select web.delivery_addr_js_('{phone}')"
    print(sql)
    addr_list = json.loads(s(sql))
    i = inv_set(styleid)[0]
    this_styleid = i.get('styleid')
    if this_styleid == 'not available':
        abort(404)
    print(request.path, request.method)
    # sql = f"select web.product_({styleid})"
    sql = f"select web.product2_({styleid})"
    big_data = json.loads(s(sql))
    data = big_data[0]
    content = {
        "menu": menu(),
        "parent": parent,
        "data": data,
        "last_date": finish_date(),
        'addrData': addr_list
    }
    return render_template('product2.html', **content)


@app.route('/productS2/<styleid>', methods=['GET', 'POST'])
def productS2(styleid):
    dt = dt_time_max()
    phone = request.cookies.get('phone')
    Session = request.cookies.get('Session')
    print(Session)
    if not Session:
        Session = str(uuid.uuid4())
    # if not phone and not Session:
    #     res = make_response(redirect(url_for('productS2', styleid=styleid)))
    #     res.set_cookie("currentLocation", request.path)
    #     return res
    sql = f"select web.delivery_addr_js_('{phone}')"
    print(sql)
    addr_list = json.loads(s(sql))
    i = inv_set(styleid)[0]
    this_styleid = i.get('styleid')
    if this_styleid == 'not available':
        abort(404)
    print(request.path, request.method)
    sql = f"select web.product_({styleid})"
    big_data = json.loads(s(sql))
    data = big_data[0]
    content = {
        "menu": menu(),
        "parent": parent,
        "data": data,
        "last_date": finish_date(),
        'addrData': addr_list
    }
    res = make_response(render_template('productS2.html', **content))
    res.set_cookie("currentLocation", request.path)
    res.set_cookie("Session", Session, expires=dt)
    return res
    # return render_template('productS2.html', **content)


@app.route('/catalog')
def catalog():
    articles = art_display('/catalog', 0, False)
    brands = sorted({a['бренд'] for a in articles})
    cats = sorted({a['категория'] for a in art_display('/catalog', 0)})
    content = {"title": "Каталог товаров",
               "parent": parent,
               "articles": articles,
               "brands": brands,
               "cats": cats,
               "menu": menu()}
    return render_template('catalog.html', **content)


@app.route('/catalog2')
def catalog2():
    articles = art_display('/catalog', 0, False)
    brands = sorted({a['бренд'] for a in articles})
    cats = sorted({a['категория'] for a in art_display('/catalog', 0)})
    content = {"title": "Каталог товаров",
               "parent": parent,
               "articles": articles,
               "brands": brands,
               "cats": cats,
               "menu": menu()}
    return render_template('catalog2.html', **content)


@app.route("/shops")
def shops():
    phone = '9167834248'
    cookies = dict(request.cookies)
    print(cookies)
    # if not request.cookies.get('phone'):
    #     # res = make_response(render_template("shops.html", title="Адреса магазинов", menu=menu()))
    #     res = make_response(redirect(url_for("shops", title="Адреса магазинов", menu=menu())))
    #     # res.set_cookie('phone', phone)
    #     return res, 302
    # else:
    #     res = make_response("Value of phone is {}".format(request.cookies.get('phone')))
    #     print(res)

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
            print(f"print for proc sizeQuantities: {type(data)} {data}")
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
        print(data)
        action = data[0].get('procName')
        pmtSys = data[0].get('pmtSys')
        print(f'basket_actions - "procName {action}"')
        phone = data[0].get('phone')
        if action != 'remove':
            orderTotal = int(data[0].get('orderTotal'))
            print(f'"orderTotal" from data : {orderTotal}')
            # print(action, 'action in ONE_CLICK', action in ['ON_SITE RESERVATION', 'ONE_CLICK'])
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
            print(f"after if action '{action}': {data}")
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
        if action in ['ON_SITE RESERVATION', 'ONE_CLICK']:
            order = f"'{json.dumps(data)}'"
            sql = f"select web.basketContent_('{phone}')"
            print(f'ON-SITE-RESERVATION first sql: {sql}')
            basketContent = json.loads(s(sql))
            amounts_equal = True
            if action == 'ON_SITE RESERVATION':
                orderTotals = calculate_webOrder(basketContent, data)
                print(f"orderTotals['amount'] from calculate_webOrder: {orderTotals['amount']} , orderTotal {orderTotal}")
                amounts_equal = (orderTotals['amount'] == orderTotal)
            if amounts_equal or action == 'ONE_CLICK':
                sql = f"exec web.reservation_json {order}"
                print(f"sql after orderTotals == orderTotal: {sql}")
                result = json.loads(s(sql))
                pmtPars = result[0].get('pmtPars')
                pmtPars = f"'{make_full_payment(pmtSys)}', {pmtPars}"
                print(f"pmtPars:  {pmtPars}", type(pmtPars))
                orderid = pmtPars.split(", ")[1]
                print("orderid, type(orderid): ", orderid, type(orderid))
                sql = f"select web.pmt_str_params_({pmtPars}, next value for web.ordersSequence)"
                print(f"sql: {sql}")
                result = s(sql)
                # print(f"result = s(sql) pmtStr parameters: {result}")
                pmtPars = json.loads(result)[0]
                print(f"pmtPars after json.loads(result)[0]: {pmtPars}")
                result = use_pmtSys(pmtSys, pmtPars)
                print(result, ":result after use_pmtSys")
                link = result
                # link = pmt_link(pmtPars)
                print(f"this is link for {pmtSys}: {link}")
                sql = f"select cust.customer_mail('{phone}')"
                print(sql, " sql: select cust.customer_mail")
                email = s(sql)
                if email != 'na':
                    arg = {
                        "To": email,
                        "link": link,
                        "orderid": orderid
                    }
                    # turn off temporarily problem with Google Mail
                    mail_pmt_link(**arg)
                result = jsonify(link)
                return result
            else:
                msg = {"error": "Товар уже частично продан. Обновите корзину"}
                result = jsonify(msg)
                return result
        return res


# @app.route('/oneClick', methods=['POST', 'GET'])
# def oneClick():
#     print(f"method: {request.method}, path: {request.path}")
#     # some hard coding is done
#     # to change when appropriate, wait_minutes, pickupShopid
#     if request.method == "POST":
#         data = request.get_json()
#         action2 = data.get('action')
#         print(data, action2)
#         order = json.dumps(data)
#         sql = f"exec web.reservation_json '[{order}]'"
#
#         print(f'sql: {sql}')
#         action = key_value('action', data)
#         pickup = key_value('pickup', data)
#         spotid = key_value('spotid', data)
#         pickupShopid = key_value('pickupShopid', data)
#         print(f'action, pickup, spotid, pickupShopid:  {action}, {pickup}, {spotid}, {pickupShopid}')
#         if pickupShopid is None:
#             pickupShopid = 0
#         print(pickupShopid)
#         if action == 'paymentLink':
#             phone = data['phone']
#             # sql = f"web.deliveryLog_create  {spotid}, {pickupShopid}"
#             # print(f'sql : {sql}')
#             # tickeid = s(sql)
#
#             # data['ticketid'] = tickeid
#             args = ['styleid', 'color', 'size']
#             par_string = ", ".join([f"'{data[k]}'" for k in args])
#             sql = f"select barcodeid from inv.bc_sortid_qtys(inv.barcode_sortid_({par_string})) where shipOrder = 1"
#             # print(sql)
#             barcodeid = s(sql)
#             args_2 = ['price', 'discount', 'promo', 'pickup', 'ticketid', 'final']
#             par_string_2 = ", ".join([f"{data[k]}" for k in args_2])
#             print(par_string_2)
#             shop = 'FANFAN.STORE'
#             user = 'INTERBOT F. '
#             wait_minutes = 15
#             # pickupShopid = 27  # ____________________________________________________________________________________________
#             sql_2 = f"set nocount on; declare @r int, @note varchar(max); if @@TRANCOUNT > 0 rollback transaction; " \
#                     f" declare @info web.reservation_type; insert @info values ({barcodeid}, {par_string_2} ); " \
#                     f" exec @r = web.reservation_create '{shop}', '{user}', '{phone}', @info , @note output, {wait_minutes}, " \
#                     f"{pickupShopid}; select @note note, @r orderid;"
#             print(sql_2)
#             result = sql_fetch_list(sql_2)
#             print(f"result from sql - web.reservation_create: {result}")
#             orderid = result[1]
#             jsdata = str(orderid) + ", 900"  # hardcoding 900 seconds ______________________________________________________
#
#             jsdata = f"'{full}', {jsdata}"
#             print(jsdata, ': jsdata')
#             sql = f"select web.pmt_str_params_({jsdata}, next value for web.ordersSequence)"
#             # print(f"sql: {sql}")
#             result = s(sql)
#             # print(f"result = s(sql): {result}")
#             pmtPars = json.loads(result)[0]
#             link = pmt_link(pmtPars)
#             result = jsonify(link)
#             if sms_messages:
#                 s_message = 'ссылка на оплату: ' + link
#                 sms(phone, s_message)
#             sql = f"select cust.customer_mail('{phone}')"
#             email = s(sql)
#             arg = {
#                 "To": email,
#                 "link": link,
#                 "orderid": orderid
#             }
#             mail_pmt_link(**arg)
#             return result


@app.route('/goToBasket', methods=['POST', 'GET'])
def basket_user():
    print(f"request.path: {request.path}, request.method: {request.method}")
    if request.method == 'POST':
        js_string = request.get_json()
        procName = js_string[0].get('procName')
        phone = js_string[0].get('phone')
        arg = json.dumps(js_string)
        sql = f"exec web.basketAction_2 '{arg}';"
        print(sql)
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


@app.route("/delivery", methods=['GET', 'POST'])
@app.route("/delivery/<ticketid>", methods=['GET', 'POST'])
def delivery(ticketid=None):
    print(f'request method: "{request.method}", path: "{request.path}"')
    print(ticketid)
    del_data = ticketid if ticketid is None else delivery_data(ticketid)

    content = {
            "title": "Доставка",
            "menu": menu(),
            "del_data": del_data
            }
    print(f"delivery data: {delivery_data(ticketid)}")
    if request.method == 'POST':
        f = request.form
        # method = list(f.keys())[-1]
        # print(f"method:  {method}")
        args = ['address', 'ticketid', 'fio', 'phone']
        # ниже  - чтобы не переделывать sql процедуру, немного по индийски
        args_2 = ['ticketid', 'fio', 'phone', 'address']
        d = {a: request.form.get(a) for a in args}
        # print(d)
        new_ticketid = d['ticketid']
        phone = d['phone']
        d['phone'] = phone.replace(" ", "").replace("(", "").replace(")", "").replace("'", "").replace("+", "").replace("-", "")[-10:]
        val = ""
        for a in args:
            val += "'" + d[a] + "', "
        val = val[:-2]
        val_2 = ""
        for a in args_2:
            val_2 += "'" + d[a] + "', "
        val_2 = val_2[:-2]
        print(val_2)
        sql = "set nocount on; declare @note varchar(max); "
        sql = sql + f"exec web.delivery_register {val}, @note output; select @note;"
        print(sql)
        note = s(sql).strip("[]")
        note = json.loads(note)
        print(note, type(note))
        if 'fail' in note.keys():
            new_ticketid = ticketid if note['fail'] == 'logid does not exist' else new_ticketid
            content = {
                    # 'failed_ticket': new_ticketid,
                    'result': 'abort',
                    'menu': menu()
            }
            print(content['result'])
            return redirect(url_for('delivery', ticketid=new_ticketid))
        return redirect(url_for('main'))
    return render_template("delivery.html", **content)


@app.route('/orderPayment', methods=['POST', 'GET'])
def paymentTrace():
    print(request.path)
    # result = request.method
    if request.method == "POST":
        data = request.get_json()
        result = 'it worked'
        result = jsonify(result)
        response = order_status_site(data)
        print(response, ' - in /orderPayment Flask ')
        arg = {
            'orderid': '78454 - to be supplied',
            'To': 'buh@fanfan.pro',
            'content': 'order paid',
            'fiscal num': 'to be supplied'
        }
        mail_sales_receipt(**arg)
    return result


@app.route('/info', methods=['POST', 'GET'])
def info():
    print(request.method, request.path, "type smth")
    response = {}
    d = request.get_json()
    key = d.get("TerminalKey")
    bank = pmt_keys().get(key)
    if d.get("Status") == "CONFIRMED":
        d["Bank"] = bank
        json_pars = json.dumps(d)
        sql = f"exec web.order_action_json '[{json_pars}]'"
        response = s(sql)
    return response
