import smtplib
import os
import sys
from email.message import EmailMessage
import json


def send_mail(args):    #
    args = json.loads(args)
    FROM = 'alexander.n.fedorov@gmail.com'
    # smtp_pass = os.environ.get('smtp_pass')
    TO = 'af.fanfan.2012@gmail.com'
    msg = EmailMessage()
    msg['Subject'] = args['subject']
    msg['From'] = FROM
    msg['To'] = TO
    msg.set_content(args['body'])
    smtp_pass = 'fwuxopyytwymwqtn'
    with smtplib.SMTP('smtp.gmail.com', 587) as smtp:
        smtp.ehlo()
        smtp.starttls()
        smtp.ehlo()
        smtp.login(FROM, smtp_pass)
        smtp.send_message(msg)
        smtp.quit()


SUBJECT = 'testing mail module'
BODY = "message # 7"

message = {"subject": f"{SUBJECT}", "body": f"{BODY}"}
message = json.dumps(message)

if len(sys.argv) > 1:
    message = sys.argv[1]

if __name__ == '__main__':
    send_mail(message)



