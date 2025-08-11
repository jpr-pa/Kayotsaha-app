from marshmallow import Schema, fields, validate, validates, ValidationError

# ----------------------
# Base User Schema
# ----------------------
class UserBaseSchema(Schema):
    username = fields.Str(required=True, validate=validate.Length(min=3, max=100))
    email = fields.Email(required=True)
    mobile = fields.Str(required=True, validate=validate.Length(min=10, max=15))

# ----------------------
# Registration Schema
# ----------------------
class UserRegisterSchema(UserBaseSchema):
    password = fields.Str(
        required=True,
        validate=validate.Length(min=6, max=50),
        load_only=True  # Don't expose password in dumps
    )

# ----------------------
# Login Schema
# ----------------------
class UserLoginSchema(Schema):
    identifier = fields.Str(required=True)  # Can be email or mobile
    password = fields.Str(required=True, load_only=True)

# ----------------------
# Response Schema (Hide Password)
# ----------------------
class UserResponseSchema(Schema):
    id = fields.Int()
    username = fields.Str()
    email = fields.Email()
    mobile = fields.Str()
    created_at = fields.DateTime()
    updated_at = fields.DateTime()

# ----------------------
# OTP Request Schema
# ----------------------
class OTPRequestSchema(Schema):
    identifier = fields.Str(required=True)
    purpose = fields.Str(required=True, validate=validate.OneOf(["registration", "reset"]))

# ----------------------
# OTP Verification Schema
# ----------------------
class OTPVerifySchema(Schema):
    identifier = fields.Str(required=True)
    otp = fields.Str(required=True, validate=validate.Length(equal=6))

# ----------------------
# Password Reset Schema
# ----------------------
class PasswordResetSchema(Schema):
    identifier = fields.Str(required=True)
    otp = fields.Str(required=True, validate=validate.Length(equal=6))
    newPassword = fields.Str(required=True, validate=validate.Length(min=6, max=50))