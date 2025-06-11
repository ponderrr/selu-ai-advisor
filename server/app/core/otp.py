import random
import string
import time

otp_store = {}

OTP_EXPIRATION_SECONDS = 300

def generate_otp(length=6):
    return ''.join(random.choices(string.digits, k=length))

def set_otp(email: str):
    otp = generate_otp()
    expiry = time.time() + OTP_EXPIRATION_SECONDS
    otp_store[email] = (otp, expiry)
    print(f"[OTP] Sent OTP {otp} to {email}")
    return otp

def verify_otp(email: str, submitted_otp: str) -> bool:
    entry = otp_store.get(email)
    if not entry:
        return False
    otp, expiry = entry
    if time.time() > expiry:
        del otp_store[email]
        return False
    if submitted_otp != otp:
        return False
    del otp_store[email]
    return True
