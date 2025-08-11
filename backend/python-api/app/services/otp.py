import os
import random
import time
from typing import Tuple, Optional

from app import db
from app.models.user import User
from app.services.email import send_otp_email

# Configurable via environment variables
OTP_EXPIRY_MINUTES = int(os.getenv("OTP_EXPIRY_MINUTES", 5))
OTP_RESEND_COOLDOWN = int(os.getenv("OTP_RESEND_COOLDOWN", 30))

# In-memory helper stores (suitable for single-instance dev only)
_otp_store = {}  # identifier -> {"otp": str, "expires": float, "last_sent": float}


def _now() -> float:
    return time.time()


def _generate_otp() -> str:
    return f"{random.randint(100000, 999999):06d}"


def can_resend(identifier: str) -> bool:
    entry = _otp_store.get(identifier)
    if not entry:
        return True
    return (_now() - entry["last_sent"]) >= OTP_RESEND_COOLDOWN


def store_otp(identifier: str, otp: str) -> None:
    _otp_store[identifier] = {
        "otp": otp,
        "expires": _now() + (OTP_EXPIRY_MINUTES * 60),
        "last_sent": _now(),
    }


def send_otp(identifier: str, purpose: str = "general") -> Tuple[bool, str]:
    """
    Sends OTP for given identifier.
    purpose: "registration" | "reset" | "general"
    Returns (success, message)
    """
    # basic validation depending on purpose
    if purpose == "reset":
        user = User.query.filter((User.email == identifier) | (User.mobile == identifier)).first()
        if not user:
            return False, "User not found"
    elif purpose == "registration":
        if User.query.filter((User.email == identifier) | (User.mobile == identifier)).first():
            return False, "User already exists"

    if not can_resend(identifier):
        return False, f"Please wait before requesting another OTP (cooldown {OTP_RESEND_COOLDOWN}s)"

    otp = _generate_otp()

    # Prefer DB-backed storage when user exists
    user = User.query.filter((User.email == identifier) | (User.mobile == identifier)).first()
    if user:
        user.set_otp(otp, expiry_minutes=OTP_EXPIRY_MINUTES)
        db.session.commit()
    else:
        # store in-memory for registration flows (user not created yet)
        store_otp(identifier, otp)

    # Send OTP via email; if identifier looks like phone, you may send SMS instead
    try:
        send_otp_email(identifier, otp)
    except Exception:
        # Do not leak internal errors to caller; log and return generic message
        print("[otp] warning: failed to send OTP email")

    return True, "OTP sent successfully"


def resend_otp(identifier: str) -> Tuple[bool, str]:
    if not can_resend(identifier):
        return False, "Please wait before requesting another OTP"
    otp = _generate_otp()
    user = User.query.filter((User.email == identifier) | (User.mobile == identifier)).first()
    if user:
        user.set_otp(otp, expiry_minutes=OTP_EXPIRY_MINUTES)
        db.session.commit()
    else:
        store_otp(identifier, otp)

    try:
        send_otp_email(identifier, otp)
    except Exception:
        print("[otp] warning: failed to send OTP email")

    return True, "OTP resent successfully"


def verify_otp(identifier: str, otp_code: str) -> Tuple[bool, str]:
    # Check DB first
    user = User.query.filter((User.email == identifier) | (User.mobile == identifier)).first()
    if user:
        if user.verify_otp(otp_code):
            user.clear_otp()
            db.session.commit()
            return True, "OTP verified"
        # If explicit DB OTP exists but didn't match, return invalid/expired accordingly
        if user.reset_otp_expiry and user.reset_otp_expiry < db.func.now():
            return False, "OTP expired"
        return False, "Invalid OTP"

    # Fallback to in-memory store
    entry = _otp_store.get(identifier)
    if not entry:
        return False, "No OTP found. Please request a new one."

    if _now() > entry["expires"]:
        del _otp_store[identifier]
        return False, "OTP expired. Please request a new one."

    if entry["otp"] != otp_code:
        return False, "Invalid OTP"

    # OK - verified, remove from store
    del _otp_store[identifier]
    return True, "OTP verified"