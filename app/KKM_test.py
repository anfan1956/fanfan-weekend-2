from libfptr10 import IFptr

my_path = r"Z:\Управление предприятием\accounting\Prop_soft"
my_file = r"temp.txt"
my_path += "\\" + my_file
# print(my_path, ", ", my_file)
fptr = IFptr(r"C:\Program Files\ATOL\Drivers10\KKT\bin")
fptr.open()
isOpened = fptr.isOpened()

# Установка параметров для порта
settings = {
    IFptr.LIBFPTR_SETTING_MODEL: IFptr.LIBFPTR_MODEL_ATOL_27F,
    IFptr.LIBFPTR_SETTING_PORT: IFptr.LIBFPTR_PORT_COM,
    IFptr.LIBFPTR_SETTING_COM_FILE: "COM4",
    IFptr.LIBFPTR_SETTING_BAUDRATE: IFptr.LIBFPTR_PORT_BR_115200
}
fptr.setSettings(settings)


def conn_check():
    is_opened = fptr.isOpened()
    print(is_opened)
    with open(my_path, 'w') as f:
        f.write(str(is_opened))
    fptr.beep()


def shift_open(operator):
    fptr.setParam(1021, operator)
    fptr.operatorLogin()
    fptr.openShift()
    fptr.report()


def shift_close(operator):
    fptr.setParam(1021, operator)
    fptr.operatorLogin()
    fptr.setParam(IFptr.LIBFPTR_PARAM_REPORT_TYPE, IFptr.LIBFPTR_RT_CLOSE_SHIFT)
    fptr.report()


def receipt(operator, products, card_payment, is_return):
    fptr.setParam(1021, operator)
    fptr.operatorLogin()
    print(f'is_return = {is_return}')
    if is_return == 'sale':
        fptr.setParam(IFptr.LIBFPTR_PARAM_RECEIPT_TYPE, IFptr.LIBFPTR_RT_SELL)
        print(f'is return : NOT RETURN, param: {IFptr.LIBFPTR_RT_SELL}')
    elif is_return == 'return':
        fptr.setParam(IFptr.LIBFPTR_PARAM_RECEIPT_TYPE, IFptr.LIBFPTR_RT_SELL_RETURN)
        print(f'is return : RETURN', {IFptr.LIBFPTR_RT_SELL_RETURN})
    fptr.openReceipt()
    l = products.split(';')
    for el in l:
        product = list(el.split(','))
        barcodeid = "id: " + str(product[0])
        category = product[1]
        price = product[2]
        fptr.setParam(IFptr.LIBFPTR_PARAM_COMMODITY_NAME, category)
        fptr.setParam(IFptr.LIBFPTR_PARAM_PRICE, price)
        fptr.setParam(IFptr.LIBFPTR_PARAM_QUANTITY, 1)
        fptr.setParam(IFptr.LIBFPTR_PARAM_TAX_TYPE, IFptr.LIBFPTR_TAX_VAT0)
        fptr.setParam(1191, barcodeid)
        fptr.registration()
        # if len(sys.argv) == 1:
        print(f'product: {product},  is_return: {is_return}')
    fptr.receiptTotal()
    # payment():
    if card_payment > 0:
        fptr.setParam(IFptr.LIBFPTR_PARAM_PAYMENT_TYPE, IFptr.LIBFPTR_PT_ELECTRONICALLY)
        fptr.setParam(IFptr.LIBFPTR_PARAM_PAYMENT_SUM, card_payment)
    fptr.payment()
    fptr.closeReceipt()
    fptr.report()


def last_document_info():
    fptr.setParam(IFptr.LIBFPTR_PARAM_FN_DATA_TYPE, IFptr.LIBFPTR_FNDT_LAST_DOCUMENT)
    fptr.fnQueryData()
    document_number = fptr.getParamInt(IFptr.LIBFPTR_PARAM_DOCUMENT_NUMBER)
    fiscal_sign = fptr.getParamString(IFptr.LIBFPTR_PARAM_FISCAL_SIGN)
    datetime = fptr.getParamDateTime(IFptr.LIBFPTR_PARAM_DATE_TIME)
    print(f'doc.num: {document_number}, fiscal sign: {fiscal_sign}, date & time: {datetime}')
    # return "(" + str(document_number) + ", '" + str(fiscal_sign) + "')"
    return document_number, fiscal_sign


def pictures_info():
    fptr.setParam(IFptr.LIBFPTR_PARAM_DATA_TYPE, IFptr.LIBFPTR_DT_PICTURES_ARRAY_INFO)
    fptr.queryData()
    count = fptr.getParamInt(IFptr.LIBFPTR_PARAM_COUNT)
    print(f'number of pictures loaded: {count}')
    fptr.setParam(IFptr.LIBFPTR_PARAM_DATA_TYPE, IFptr.LIBFPTR_DT_PICTURE_INFO)
    fptr.setParam(IFptr.LIBFPTR_PARAM_PICTURE_NUMBER, 1)
    fptr.queryData()
    width = fptr.getParamInt(IFptr.LIBFPTR_PARAM_WIDTH)
    height = fptr.getParamInt(IFptr.LIBFPTR_PARAM_HEIGHT)
    print(f'width: {width}, height: {height}')
