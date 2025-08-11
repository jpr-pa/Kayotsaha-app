from fastapi import FastAPI
from app.routes import auth, otp, reset

app = FastAPI()

# Routes
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(otp.router, prefix="/otp", tags=["otp"])
app.include_router(reset.router, prefix="/reset", tags=["password"])

