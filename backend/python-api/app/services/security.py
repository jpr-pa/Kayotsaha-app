import os
import datetime
from typing import Optional, Dict, Any

import jwt
from werkzeug.security import generate_password_hash, check_password_hash

JWT_SECRET = os.getenv("JWT_SECRET", "change_me")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXP_MINUTES = int(os.getenv("JWT_EXP_MINUTES", 60 * 24))  # default 1 day


def hash_password(raw_password: str) -> str:
    return generate_password_hash(raw_password)


def verify_password(hashed: str, raw_password: str) -> bool:
    return check_password_hash(hashed, raw_password)


def create_jwt(payload: Dict[str, Any], exp_minutes: Optional[int] = None) -> str:
    exp_minutes = exp_minutes or JWT_EXP_MINUTES
    now = datetime.datetime.utcnow()
    payload_copy = payload.copy()
    payload_copy["exp"] = now + datetime.timedelta(minutes=exp_minutes)
    payload_copy["iat"] = now
    token = jwt.encode(payload_copy, JWT_SECRET, algorithm=JWT_ALGORITHM)
    # pyjwt returns bytes in older versions; ensure string
    if isinstance(token, bytes):
        token = token.decode("utf-8")
    return token


def decode_jwt(token: str) -> Dict[str, Any]:
    return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])


# Simple decorator example for Flask routes (if using JWT auth)
from functools import wraps
from flask import request, jsonify


def jwt_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        auth = request.headers.get("Authorization", "")
        if not auth.startswith("Bearer "):
            return jsonify({"error": "Missing or invalid token"}), 401
        token = auth.split(" ", 1)[1]
        try:
            payload = decode_jwt(token)
            # optionally attach to request context
            request.jwt_payload = payload
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except Exception:
            return jsonify({"error": "Invalid token"}), 401
        return fn(*args, **kwargs)
    return wrapper