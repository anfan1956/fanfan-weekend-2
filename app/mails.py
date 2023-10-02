import smtplib
import ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import os, sys
import json
from random import randint


smtp_server = 'smtp.gmail.com'
smtp_port = 587
smtp_pass = os.environ.get('fanfan_smtp')
gmail = 'fanfan.weekend@gmail.com'


def fanfan_send_mail(**args):
    message = MIMEMultipart('mixed')
    message['From'] = 'fanfan.sales <{sender}>'.format(sender=gmail)
    message['Subject'] = 'подтверждение адреса email'
    message['To'] = args['To']
    code = args['code']
    msg_content = f'<h2>введите в браузере следующий код: <br></h2><h1>{code}</h1>\n'

    body = MIMEText(msg_content, 'html')
    message.attach(body)

    msg_full = message.as_string()
    context = ssl.create_default_context()

    with smtplib.SMTP(smtp_server, smtp_port) as server:
        server.ehlo()
        server.starttls(context=context)
        server.ehlo()
        server.login(gmail, smtp_pass)
        server.sendmail(gmail,
                        message['TO'].split(";") +
                        (message['CC'].split(";") if message['CC'] else []),
                        msg_full)
        server.quit()
        return "email sent successfully"


def mail_sales_receipt(**args):
    message = MIMEMultipart('mixed')
    message['From'] = 'fanfan.sales <{sender}>'.format(sender=gmail)
    message['Subject'] = 'чек по операции'
    message['To'] = args['To']
    msg_content = f"<p>{args['content']}</p> <br> <p>" \
                  f"orderid: {args['orderid']} <br>" \
                  f"fiscal num: {args['fiscal num']}" \
                  f"</p>"

    body = MIMEText(msg_content, 'html')
    message.attach(body)

    msg_full = message.as_string()
    context = ssl.create_default_context()
    with smtplib.SMTP(smtp_server, smtp_port) as server:
        server.ehlo()
        server.starttls(context=context)
        server.ehlo()
        server.login(gmail, smtp_pass)
        server.sendmail(gmail,
                        message['TO'].split(";") +
                        (message['CC'].split(";") if message['CC'] else []),
                        msg_full)
        server.quit()
        return "email sent successfully"


def mail_pmt_link(**args):
    message = MIMEMultipart('mixed')
    message['From'] = 'fanfan.sales <{sender}>'.format(sender=gmail)
    message['Subject'] = 'ссылка на оплату заказа'
    message['To'] = args['To']
    orderid = args['orderid']
    msg_content = f"№ заказа {orderid}: ссылка на оплату {args['link']}"
    body = MIMEText(msg_content, 'html')
    message.attach(body)

    msg_full = message.as_string()
    context = ssl.create_default_context()
    with smtplib.SMTP(smtp_server, smtp_port) as server:
        server.ehlo()
        server.starttls(context=context)
        server.ehlo()
        server.login(gmail, smtp_pass)
        server.sendmail(gmail,
                        message['TO'].split(";") +
                        (message['CC'].split(";") if message['CC'] else []),
                        msg_full)
        server.quit()
        return "email sent successfully"


if __name__ == '__main__':
    content = 'Сумма: to be defined'
    to = 'buh@fanfan.pro'
    orderid = 38745

    argv = {
        'orderid': orderid,
        'To': to,
        'content': content,
        'fiscal num': 124545
    }
    # response = mail_pmt_link(**argv)
    response = mail_sales_receipt(**argv)
    print(response)

