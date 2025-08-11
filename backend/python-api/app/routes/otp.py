from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from app.models.user import User
from app.schemas.user import OTPRequestSchema, OTPVerifySchema
from app.utils.otp import generate_otp, store_otp, can_resend, verify_otp
from app.utils.email import send_otp_via_email

otp_bp = Blueprint("otp", __name__)

@otp_bp.route("/api/send-otp", methods=["POST"])
def send_otp():
    try:
        data = OTPRequestSchema().load(request.json)
    except ValidationError as err:
        return jsonify(err.messages), 400

    identifier = data["identifier"]
    purpose = data["purpose"]

    if purpose == "reset":
        if not User.query.filter((User.email == identifier) | (User.mobile == identifier)).first():
            return jsonify({"error": "User not found"}), 404

    if purpose == "registration":
        if User.query.filter((User.email == identifier) | (User.mobile == identifier)).first():
            return jsonify({"error": "User already exists"}), 400

    if not can_resend(identifier):
        return jsonify({"error": "Please wait before requesting another OTP"}), 429

    otp = generate_otp()
    store_otp(identifier, otp)
    send_otp_via_email(identifier, otp)

    return jsonify({"message": "OTP sent successfully"}), 200


@otp_bp.route("/api/verify-otp", methods=["POST"])
def verify_otp_route():
    try:
        data = OTPVerifySchema().load(request.json)
    except ValidationError as err:
        return jsonify(err.messages), 400

    identifier = data["identifier"]
    otp_code = data["otp"]

    valid, message = verify_otp(identifier, otp_code)
    if not valid:
        return jsonify({"error": message}), 400

    return jsonify({"message": message}), 200
