from app import db
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    mobile = db.Column(db.String(15), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)

    # For password reset OTP
    reset_otp = db.Column(db.String(6), nullable=True)
    reset_otp_expiry = db.Column(db.DateTime, nullable=True)

    # Metadata
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # ----------------------
    # Password Methods
    # ----------------------
    def set_password(self, raw_password: str):
        """Hashes and stores a password."""
        self.password = generate_password_hash(raw_password)

    def check_password(self, raw_password: str) -> bool:
        """Verifies a password."""
        return check_password_hash(self.password, raw_password)

    # ----------------------
    # OTP Methods
    # ----------------------
    def set_otp(self, otp_code: str, expiry_minutes: int = 5):
        """Stores an OTP with an expiry time."""
        self.reset_otp = otp_code
        self.reset_otp_expiry = datetime.utcnow() + timedelta(minutes=expiry_minutes)

    def verify_otp(self, otp_code: str) -> bool:
        """Verifies OTP correctness and expiry."""
        if not self.reset_otp or not self.reset_otp_expiry:
            return False
        if datetime.utcnow() > self.reset_otp_expiry:
            return False
        return self.reset_otp == otp_code

    def clear_otp(self):
        """Removes OTP after verification."""
        self.reset_otp = None
        self.reset_otp_expiry = None

    def __repr__(self):
        return f"<User {self.username}>"