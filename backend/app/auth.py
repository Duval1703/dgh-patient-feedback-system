from fastapi import APIRouter, HTTPException, Depends, Request, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from db.models import Doctor, Patient
from db.database import SessionLocal
from jose import jwt, JWTError
from datetime import datetime, timedelta
from passlib.context import CryptContext
from pydantic import BaseModel
from db.models import Doctor, Patient, Admin
from fastapi.security import OAuth2PasswordBearer
import bcrypt as _bcrypt
import os

# ---------------------- Settings ----------------------
SECRET_KEY = os.environ.get("SECRET_KEY", "your_secret_key")
ALGORITHM = os.environ.get("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

# ---------------------- Bcrypt Helper Functions (Python 3.14 Compatible) ----------------------
def hash_password(password: str) -> str:
    """Hash password using bcrypt directly"""
    if isinstance(password, str):
        password = password.encode('utf-8')
    # Truncate to 72 bytes for bcrypt
    if len(password) > 72:
        password = password[:72]
    return _bcrypt.hashpw(password, _bcrypt.gensalt()).decode('utf-8')

def check_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password using bcrypt directly"""
    if isinstance(plain_password, str):
        plain_password = plain_password.encode('utf-8')
    # Truncate to 72 bytes for bcrypt
    if len(plain_password) > 72:
        plain_password = plain_password[:72]
    if isinstance(hashed_password, str):
        hashed_password = hashed_password.encode('utf-8')
    try:
        return _bcrypt.checkpw(plain_password, hashed_password)
    except Exception:
        return False

# ---------------------- Database Dependency ----------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ---------------------- Utility Functions ----------------------
def verify_password(plain_password, hashed_password):
    """Verify password using bcrypt directly (Python 3.14 compatible)"""
    return check_password(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# ---------------------- Schemas ----------------------
class PatientCreate(BaseModel):
    email: str
    password: str
    first_name: str
    last_name: str
    phone_number: str

class LoginRequest(BaseModel):
    email: str
    password: str
    
# ---------------------- Routes ----------------------

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={
            "WWW-Authenticate": "Bearer",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": "true"
        },
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        user_role: str = payload.get("role")
        
        if user_id is None or user_role is None:
            raise credentials_exception
            
        # Find the user based on their role
        if user_role == "admin":
            user = db.query(Admin).filter(Admin.id == int(user_id)).first()
        elif user_role == "doctor":
            user = db.query(Doctor).filter(Doctor.id == int(user_id)).first()
        elif user_role == "patient":
            user = db.query(Patient).filter(Patient.id == int(user_id)).first()
        else:
            raise credentials_exception
            
        if user is None:
            raise credentials_exception
            
        return {"id": user_id, "role": user_role, "user": user}
        
    except JWTError:
        raise credentials_exception
    except Exception:
        raise credentials_exception

@router.post("/token")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    email = data.email
    password = data.password

    user = db.query(Admin).filter(Admin.email == email).first()
    user_role = "admin" if user else None
    
    if not user:
        user = db.query(Doctor).filter(Doctor.email == email).first()
        user_role = "doctor" if user else None
        # Check if doctor is active
        if user and not user.is_active:
            raise HTTPException(status_code=401, detail="Account has been deactivated")
    
    if not user:
        user = db.query(Patient).filter(Patient.email == email).first()
        user_role = "patient" if user else None

    if not user or not verify_password(password, user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    access_token = create_access_token(data={"sub": str(user.id), "role": user_role})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "user_role": user_role,
        "name": getattr(user, "name", None) or getattr(user, "first_name", "") + " " + getattr(user, "last_name", "")
    }

@router.post("/patient")
def register_patient(data: PatientCreate, db: Session = Depends(get_db)):
    existing = db.query(Patient).filter_by(email=data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = hash_password(data.password)

    new_patient = Patient(
        email=data.email,
        password=hashed_password,
        first_name=data.first_name,
        last_name=data.last_name,
        phone_number=data.phone_number,
    )

    try:
        db.add(new_patient)
        db.commit()
        db.refresh(new_patient)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Database error during registration")

    return {
        "message": "Patient registered successfully",
        "patient_id": new_patient.id
    }
