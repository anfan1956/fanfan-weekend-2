import time, datetime, json
from datetime import timedelta
from app.data import sql_query as s, cn
from app.Payments import tinkoff_link, pmt_link


def replace_keys(dct, mapping):
    """this function replaces the keys from latin to cyrillic"""
    c = {}
    for item in list(dct.items()):
        if item[0] in mapping:
            c[mapping[item[0]]] = item[1]
        else:
            c[item[0]] = item[1]
    return c


def menu():
    menu = [
            {"name": "О нас", "url": "/home"},
            {"name": "Поступления", "url": "/main"},
            {"name": "Промо", "url": "/promo"},
            # {"name": "Каталог", "url": "/catalog"},
            {"name": "Каталог", "url": "/catalog2"},
            {"name": "Магазины", "url": "/shops"},
            # {"name": "Логин", "url": "/login2"},
            {"name": "Личный кабинет", "url": "/register2"},
            {"name": "Корзина", "url": "/basket"},
            # {"name": "Корзина", "url": "/basketS"},
            # {"name": "Доставка", "url": "/delivery"} #  В меню не показывать, только по вызову
            ]
    return menu


def dt_time_max():
    """converts any datetime/date to new datetime with same date and time=23:59:59.999999 in local time """
    offset = time.timezone if (time.localtime().tm_isdst == 0) else time.altzone
    time_l = datetime.datetime.now()
    tm = datetime.datetime.combine(time_l, datetime.time.max)+datetime.timedelta(seconds=offset)
    return tm


def dt_delta(minutes):
    """converts dt for cookie to correct UTC"""
    dt = datetime.datetime.utcnow()
    return dt + timedelta(minutes=minutes)


def form():
    my_form = {
        "username": "Sasha",
        "phone": "9167834248",
        "email": "sasha@sasha.int"
    }
    return my_form


def art_display(route, months, old=True):
    if old:
        sql = f"select inv.arrivals_json({months}, default, default )"
    else:
        sql = f"select inv.arrivals2_json({months}, default, default )"
    f_articles = json.loads(s(sql))
    arrivals = []
    match route:
        case '/main':
            key_filter = ['дата','бренд', 'категория','модель','артикул', 'цена','фото', 'промо_скидка']
        case '/catalog':
            key_filter = ['дата', 'бренд', 'категория','артикул','модель', 'цена', 'скидка', 'промо_скидка', 'фото']
        case _:
            key_filter = False
    if key_filter:
        for a in f_articles:
            filtered_arrivals = {k: a[k] for k in a if k in key_filter}
            arrivals.append(filtered_arrivals)
    else:
        arrivals = False
    return arrivals


def set_dates(route, months):
    articles = art_display(route, months)
    dates = set()
    for art in articles:
        for k in art:
            if k == 'дата':
                dates.add(art[k])
    dates = dates_russian_sorted(dates)
    dates = list(dates)
    return dates


def dates_russian_sorted(arg):
    months = ('января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря')
    monthToNumber = dict((name, i + 1) for i, name in enumerate(months))
    numToMonth = dict((i + 1, name) for i, name in enumerate(months))
    dates_dict = dict(enumerate(arg))
    for n in dates_dict:
        date = dates_dict[n].split(" ")
        month_num = str(monthToNumber[date[1]])
        if len(month_num) == 1:
            month_num = str(0) + month_num
        date[1] = date[0]
        date[0] = date[2]
        date[2] = date[1]
        date[1] = str(month_num)
        the_date = "-".join(date)
        dates_dict[n] = the_date
        dates_only = list(dates_dict.values())
        dates_only.sort(reverse=True)
        dates_sorted= []
    for d in dates_only:
        dt = d.split("-")
        mn = numToMonth[int(dt[1])]
        dt[1] = dt[0]
        dt[0] = dt[2]
        dt[2] = dt[1]
        dt[1] = mn
        new_d = " ".join(dt)
        dates_sorted.append(new_d)
    return dates_sorted


def finish_date():
    sql = 'select web.actionFinish_date()'
    return s(sql)


def goods():
    sql = "select web.promoGoods_js();"
    goods = s(sql)
    if goods:
        goods = json.loads(goods)
        for g in goods:
            g['final'] = g['цена'] * (1-g['скидка']) * (1 - g['промо'] )
            g['промо'] = "{:,.0%}".format(g['промо'])
            g['скидка_str'] = "{:,.0%}".format(g['скидка'])
            g['цена'] = "{:,.0f}".format(g['цена'])
            g['final'] = "{:,.0f}".format(g['final'])
    return goods


def inv_set(styleid):
    # sql = f"""select  upper(color) color, size, sum(qty) qty from inv.style_colors_sizes_avail ({styleid})
    # group by upper(color), size, sizeid  order by sizeid for json path"""
    sql = f"select inv.inv_set_forJSON({styleid})"
    cursor = cn().cursor()
    result = json.loads(cursor.execute(sql).fetchone()[0])
    cn().commit()
    cn().close()
    return result


# None is for the case loading to product
# else is for the selection of size/quantities
def the_totals(js, product=None):
    mapping = ['модель', 'цвет', 'размер']
    q = 0
    if 'корзина' not in js[0]:
        if product is not None:
            vals = list(product.values())
            # Create new dictionary by iterating over both newkeys and vals
            product = {k: v for k, v in zip(mapping, vals)}
            for j in js:
                f = 0
                for p in product.keys():
                    if j[p] != product[p]:
                        f = 1
                        break
                if f == 0:
                    q = j['количество']
        total = sum([int(j['количество']) for j in js])
        totals = {
            "this": q,
            "total": total
        }
    else:
        totals = {"this": q, "total": 0}
    return totals


def calculate_webOrder(js, products=None):
    """function takes two json lists of dictionaries:
    -- there was a prob with function. It did not round up the price!!! --
    js - list of the latest basket content, product  -   proposed order for payment.
    it removes the first dict from products, relating to user and session
    returns three values :  {'qty': 2, 'amount': 38250.0, 'total': 5}
    qty - pieces in order,
    amount - amount of the order with the discounts,
    total - total number of pieces in basket
    if no product submitted, returns only total
    {'qty': 0, 'amount': 0, 'total': 5}
    """
    # print('js: ', js, '\n')
    # print('products: ', products)
    qty = 0
    amount = 0
    mapping = {
        "styleid": "модель",
        "color": "цвет",
        "size": "размер"
    }
    if products is not None:
        # products = json.loads(products)[1:]
        products = products[1:]
        for product in products:
            print(product)
            product = replace_keys(product, mapping)
            for j in js:
                f = 0
                for k in mapping.items():
                    if str(j[k[1]]) != product[k[1]]:
                        f = 1
                        break
                if f == 0:
                    # print(product['discount'], type(product['discount']))
                    amount += int(int(product['qty']) * int(product['price'])*(1 - float(product['discount']))*(1 - float(product['promo'])))
                    # print("the issue: ",  int(product['qty']) * int(product['price'])*(1 - float(product['discount']))*(1 - float(product['promo'])))
                    qty += int(product['qty'])
    total = sum([int(j['количество']) for j in js])
    amount = int(amount)
    totals = {
        "qty": qty,
        'amount': amount,
        "total": total
    }
    return totals


def key_value(key, my_dict):
    value = [my_dict[b] for b in my_dict if b == key]
    return value[0] if len(value) == 1 else None


def delivery_data(arg):
    result = None
    if arg is not None:
        sql = f"select web.ticket_address_({arg})"
        result = json.loads(s(sql))[0] if s(sql) is not None else None
    return result


def use_pmtSys(arg, args):
    match arg:
        case 'tinkoff':
            link = tinkoff_link(args).get("PaymentURL")
        case 'alfabank':
            link = pmt_link(args).get('formUrl')
        case default:
            link = '/not_found'
    if link is None:
        link = '/not_found'
    return link


if __name__ == '__main__':
    print(finish_date())
