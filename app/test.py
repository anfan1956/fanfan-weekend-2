


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



# basket = [
#     {'марка': '120% LINO', 'модель': 19628, 'категория': 'РУБАШКА', 'цвет': 'RED', 'размер': 'XL', 'цена': 29325.0, 'скидка': 0.0, 'промо': 0.37, 'количество': 1, 'всего': '', 'наличие': 1, 'photo': '_M3Q9882_c1.jpg'},
#     {'марка': 'JAMES PERSE', 'модель': 13530, 'категория': 'ФУТБОЛКА', 'цвет': 'PLATOON', 'размер': '2', 'цена': 19125.0, 'скидка': 0.0, 'промо': 0.0, 'количество': 1, 'всего': '', 'наличие': 1, 'photo': '_M3Q8887.jpg'},
#     {'марка': 'JAMES PERSE', 'модель': 13530, 'категория': 'ФУТБОЛКА', 'цвет': 'WHITE', 'размер': '3', 'цена': 19125.0, 'скидка': 0.0, 'промо': 0.0, 'количество': 2, 'всего': '', 'наличие': 7, 'photo': '_M3Q8887_4.jpg'}
#     ]
basket = [{"корзина":"Пустая"}]

product = {'styleid': 19628, 'color': 'ANGEL', 'size': 'XXL', 'qty': '1'}

print(the_totals(basket, product))
