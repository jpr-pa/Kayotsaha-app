from flask import Blueprint, jsonify, request
from marshmallow import ValidationError
from app.models.user import User
from app.schemas.user import PasswordResetSchema
from app.utils.otp import verify_otp
from app import db

reset_bp = Blueprint("reset", __name__)

@reset_bp.route("/api/reset-password", methods=["POST"])
def reset_password():
    try:
        data = PasswordResetSchema().load(request.json)
    except ValidationError as err:
        return jsonify(err.messages), 400

    identifier = data["identifier"]
    otp_code = data["otp"]
    new_password = data["newPassword"]

    valid, message = verify_otp(identifier, otp_code)
    if not valid:
        return jsonify({"error": message}), 400

    user = User.query.filter((User.email == identifier) | (User.mobile == identifier)).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    user.set_password(new_password)
    user.clear_otp()
    db.session.commit()

    return jsonify({"message": "Password reset successful"}), 200