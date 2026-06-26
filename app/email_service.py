import smtplib
from email.message import EmailMessage
import os
from dotenv import load_dotenv

load_dotenv()

SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SENDER_EMAIL = os.getenv("EMAIL_USER")
SENDER_PASSWORD = os.getenv("EMAIL_PASS")

def send_otp_email(recipient_email: str, otp: str):
    print(f"==========================================")
    print(f"ATTEMPTING TO SEND EMAIL TO: {recipient_email}")
    print(f"YOUR OTP IS: {otp}")
    print(f"==========================================")

    if not SENDER_EMAIL or not SENDER_PASSWORD:
        print("Error: EMAIL_USER and EMAIL_PASS environment variables are not set.")
        return

    try:
        msg = EmailMessage()
        
        body = f"""Hello,

This is your One-Time Password (OTP) to securely log into your Todo App account.

OTP: {otp}

This OTP is valid for 2 minutes and will expire afterwards. If you did not request this OTP, please ignore this email.

Best regards,
Todo App Team
"""
        msg.set_content(body)
        msg['Subject'] = "Todo App - Login OTP"
        msg['From'] = SENDER_EMAIL
        msg['To'] = recipient_email
        
        from email.utils import make_msgid, formatdate
        msg['Message-ID'] = make_msgid()
        msg['Date'] = formatdate(localtime=True)

        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        server.send_message(msg)
        server.quit()
        print("Real email sent successfully!")
    except Exception as e:
        print(f"Failed to send real email: {e}")
