import smtplib
import ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
import os, sys
import json


def fanfan_send_mail(args):
    if len(sys.argv) > 1:
        arg = args.split(",")
        args_dict = {a.split(": ")[0]: a.split(": ")[1] for a in arg}
        # for key in args_dict:
        #     print(key, ": ", args_dict[key])
    else:
        args_dict = json.loads(args)

    # print(args_dict, type(args_dict))
    smtp_server = 'smtp.gmail.com'
    smtp_port = 587
    smtp_pass = os.environ.get('fanfan_smtp')
    # smtp_pass = 'shzbalwjuqgbuwce'
    gmail = 'fanfan.weekend@gmail.com'
    message = MIMEMultipart('mixed')
    message['From'] = 'fanfan.sales <{sender}>'.format(sender=gmail)
    for i in range(2):
        prop = list(args_dict.items())[i][0]
        message[prop] = args_dict[prop]
        # print(f' i = {i}, {message[prop]}')

    # print(args_dict['msg_content'])
    msg_content = args_dict['msg_content']

    body = MIMEText(msg_content, 'html')
    message.attach(body)
    attachmentPath = args_dict['attachmentPath']

    try:
        with open(attachmentPath, "rb") as attachment:
            p = MIMEApplication(attachment.read(), _subtype="pdf")
            p.add_header('Content-Disposition', "attachment; filename= %s" % attachmentPath.split("\\")[-1])
            message.attach(p)
    except Exception as e:
        print(str(e))

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


if len(sys.argv) == 1:
    subject = 'emailing actual order 5'
    content = '<h2>Hello there! <br></h2><p>I am testing real pdf files</p>\n'
    sPath = "Z:\\Управление предприятием\\accounting\\web_sales\\77769.pdf"
    argv = {
        'To': 'af.fanfan.2012@gmail.com',
        # 'CC': None,
        'Subject': subject,
        'msg_content': content,
        'attachmentPath': sPath
        }
    argv = json.dumps(argv)
else:
    argv = sys.argv[1]

if __name__ == '__main__':
    # print(argv, type(argv))
    print(fanfan_send_mail(argv))
