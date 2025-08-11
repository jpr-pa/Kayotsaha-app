import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
FROM_EMAIL = os.getenv("FROM_EMAIL", SMTP_USER)


def send_email(to_email: str, subject: str, body: str) -> bool:
    """Generic function to send an email."""
    try:
        msg = MIMEMultipart()
        msg["From"] = FROM_EMAIL
        msg["To"] = to_email
        msg["Subject"] = subject

        msg.attach(MIMEText(body, "html"))

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(FROM_EMAIL, to_email, msg.as_string())

        return True
    except Exception as e:
        print(f"❌ Email sending failed: {e}")
        return False


def send_otp_email(to_email: str, otp: str) -> bool:
    """Send a styled OTP email."""
    subject = "Your Kayotsaha OTP Code"
    body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        <div style="max-width: 500px; background: #fff; padding: 20px; border-radius: 8px; text-align: center;">
            <h2 style="color: #4CAF50;">Kayotsaha OTP Verification</h2>
            <p style="font-size: 16px;">Use the OTP below to complete your action:</p>
            <h1 style="color: #333; letter-spacing: 3px;">{otp}</h1>
            <p style="font-size: 14px; color: #555;">This OTP is valid for 5 minutes. Do not share it with anyone.</p>
        </div>
    </body>
    </html>
    """
    return send_email(to_email, subject, body)