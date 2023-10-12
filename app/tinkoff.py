"""
    ниже приведен код запроса для создания запроса
    на языке Python
    в следущем разделе будет распечатка ответа
"""
import requests
import hashlib

PaymentURL = "https://securepay.tinkoff.ru/v2/Init"
TerminalKey = "1696935466962DEMO"
password = "5ziy1yt2s68alujs"
orderid = "21090"
total = 1000
email = "alexander.n.fedorov@gmail.com"
phone = "+79637633465"
custid = "17448"
headers = {"Content-Type": "application/json; charset=utf-8"}
duedate = "2023-10-12T12:28:00+03:00"


tokenData = {
    "Amount": total,
    "OrderId": orderid,
    "Password": password,
    "TerminalKey": TerminalKey
}
tokenValues = ''.join(str(val) for val in tokenData.values())
encoded = tokenValues.encode()
Token = hashlib.sha256(encoded).hexdigest()



Items = [
    {
        "Name": "брюки",
        "Price": 500,
        "Quantity": 2,
        "Amount": 1000,
        "Tax": "none",
        "PaymentMethod": "prepayment",
        "PaymentObject": "commodity",
        "MeasurementUnit": "шт"
    }
]

Receipt = {
    "FfdVersion": "1.2",
    "Taxation": "usn_income",
    "Phone": phone,
    "Email": email,
    "Items": Items
}


data = {
    "TerminalKey": TerminalKey,
    "Amount": total,
    "OrderId": orderid,
    "Token": Token
    # "Receipt": Receipt,
}

response = requests.post(PaymentURL, headers=headers, json=data)

print(data)
print("Status Code", response.status_code)
print("JSON Response ", response.content)
