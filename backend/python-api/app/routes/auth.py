from flask import Blueprint, request, jsonify, session
from marshmallow import ValidationError
from app.models.user import User
from app.schemas.user import UserRegisterSchema, UserLoginSchema
from app.utils.otp import generate_otp
from app.utils.email import send_otp_via_email
from app import db

auth = Blueprint('auth', __name__)

# ----------------------
# Registration
# ----------------------
@auth.route('/api/register', methods=['POST'])
def register():
    try:
        data = UserRegisterSchema().load(request.json)
    except ValidationError as err:
        return jsonify(err.messages), 400

    if User.query.filter((User.email == data["email"]) | (User.mobile == data["mobile"])).first():
        return jsonify({"error": "User already exists"}), 400

    user = User(
        username=data["username"],
        email=data["email"],
        mobile=data["mobile"]
    )
    user.set_password(data["password"])
    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "User registered successfully"}), 201

# ----------------------
# Login
# ----------------------
@auth.route('/api/login', methods=['POST'])
def login():
    try:
        data = UserLoginSchema().load(request.json)
    except ValidationError as err:
        return jsonify(err.messages), 400

    identifier = data["identifier"]
    password = data["password"]

    user = User.query.filter((User.email == identifier) | (User.mobile == identifier)).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid credentials"}), 401

    session['user_id'] = user.id
    return jsonify({"message": "Login successful"}), 200

# ----------------------
# Logout
# ----------------------
@auth.route('/api/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({"message": "Logged out successfully"}), 200