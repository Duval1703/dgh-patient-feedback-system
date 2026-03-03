from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from db.database import get_db
from db.models import Doctor
from app.auth import get_current_user, pwd_context

router = APIRouter()

class DoctorBase(BaseModel):
    name: str
    specialty: str
    email: str

class DoctorCreate(DoctorBase):
    password: Optional[str] = None
    is_active: Optional[bool] = True

class DoctorUpdate(BaseModel):
    name: Optional[str] = None
    specialty: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None

class DoctorStatusUpdate(BaseModel):
    is_active: bool

class DoctorResponse(DoctorBase):
    id: int
    is_active: bool = True
    created_at: Optional[str] = None
    patientCount: Optional[int] = 0
    averageRating: Optional[float] = 0.0
    
    class Config:
        from_attributes = True

@router.post("", response_model=DoctorResponse, status_code=status.HTTP_201_CREATED)
def create_doctor(doctor: DoctorCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """Create a new doctor record"""
    
    # Only admin can create doctors
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admins can create doctors")
    
    # Check if email already exists
    existing_doctor = db.query(Doctor).filter(Doctor.email == doctor.email).first()
    if existing_doctor:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password if provided
    hashed_password = None
    if doctor.password:
        hashed_password = pwd_context.hash(doctor.password)
    else:
        raise HTTPException(status_code=400, detail="Password is required")
    
    # Create doctor record
    db_doctor = Doctor(
        name=doctor.name,
        specialty=doctor.specialty,
        email=doctor.email,
        password=hashed_password,
        is_active=doctor.is_active if doctor.is_active is not None else True
    )
    
    db.add(db_doctor)
    db.commit()
    db.refresh(db_doctor)
    
    # Convert to response model explicitly to avoid serialization issues
    return DoctorResponse(
        id=db_doctor.id,
        name=db_doctor.name,
        specialty=db_doctor.specialty,
        email=db_doctor.email,
        is_active=db_doctor.is_active,
        created_at=db_doctor.created_at.isoformat() if db_doctor.created_at else None,
        patientCount=0,
        averageRating=0.0
    )

@router.get("/profile", response_model=DoctorResponse)
def get_doctor_profile(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """Get the profile of the authenticated doctor"""
    
    # Use current_user["id"] to fetch the doctor (no role check to avoid deactivation issues)
    doctor = db.query(Doctor).filter(Doctor.id == current_user["id"]).first()
    if not doctor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")
    
    # Return explicitly converted response model
    return DoctorResponse(
        id=doctor.id,
        name=doctor.name,
        specialty=doctor.specialty,
        email=doctor.email,
        is_active=doctor.is_active,
        created_at=doctor.created_at.isoformat() if doctor.created_at else None,
        patientCount=0,
        averageRating=0.0
    )

@router.get("", response_model=List[DoctorResponse])
def get_all_doctors(specialty: Optional[str] = None, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """Get all doctors, optionally filtered by specialty"""
    
    query = db.query(Doctor)
    if specialty:
        query = query.filter(Doctor.specialty == specialty)
    
    doctors = query.all()
    
    # Transform to response format
    return [
        DoctorResponse(
            id=doctor.id,
            name=doctor.name,
            specialty=doctor.specialty,
            email=doctor.email,
            is_active=doctor.is_active,
            created_at=doctor.created_at.isoformat() if doctor.created_at else None,
            patientCount=0,  # TODO: Calculate from appointments/patients
            averageRating=0.0  # TODO: Calculate from feedback
        )
        for doctor in doctors
    ]

@router.get("/{doctor_id}", response_model=DoctorResponse)
def get_doctor(doctor_id: int, db: Session = Depends(get_db)):
    """Get a specific doctor by ID"""
    
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")
    
    # Return explicitly converted response model to avoid serialization issues
    return DoctorResponse(
        id=doctor.id,
        name=doctor.name,
        specialty=doctor.specialty,
        email=doctor.email,
        is_active=doctor.is_active,
        created_at=doctor.created_at.isoformat() if doctor.created_at else None,
        patientCount=0,
        averageRating=0.0
    )

@router.put("/{doctor_id}", response_model=DoctorResponse)
def update_doctor(doctor_id: int, doctor: DoctorUpdate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """Update an existing doctor"""
    
    # Only admin or the doctor themselves can update
    if current_user["role"] != "admin" and current_user["id"] != str(doctor_id):
        raise HTTPException(status_code=403, detail="Not authorized to update this doctor")
    
    db_doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not db_doctor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")
    
    # Check if email is already taken by another doctor
    if doctor.email and doctor.email != db_doctor.email:
        existing_doctor = db.query(Doctor).filter(Doctor.email == doctor.email, Doctor.id != doctor_id).first()
        if existing_doctor:
            raise HTTPException(status_code=400, detail="Email already registered")
    
    # Update doctor fields
    update_data = doctor.dict(exclude_unset=True)
    if "password" in update_data and update_data["password"]:
        update_data["password"] = pwd_context.hash(update_data["password"])
    elif "password" in update_data and not update_data["password"]:
        del update_data["password"]
    
    for key, value in update_data.items():
        setattr(db_doctor, key, value)
    
    db.commit()
    db.refresh(db_doctor)
    
    # Return explicitly converted response model to avoid serialization issues
    return DoctorResponse(
        id=db_doctor.id,
        name=db_doctor.name,
        specialty=db_doctor.specialty,
        email=db_doctor.email,
        is_active=db_doctor.is_active,
        created_at=db_doctor.created_at.isoformat() if db_doctor.created_at else None,
        patientCount=0,
        averageRating=0.0
    )
@router.patch("/{doctor_id}/status", response_model=DoctorResponse)
def update_doctor_status(doctor_id: int, status_data: DoctorStatusUpdate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """Update the active status of a doctor"""
    
    # Only admin can update doctor status
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admins can update doctor status")
    
    db_doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not db_doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    db_doctor.is_active = status_data.is_active
    db.commit()
    db.refresh(db_doctor)
    
    # Return explicitly converted response model to avoid serialization issues
    return DoctorResponse(
        id=db_doctor.id,
        name=db_doctor.name,
        specialty=db_doctor.specialty,
        email=db_doctor.email,
        is_active=db_doctor.is_active,
        created_at=db_doctor.created_at.isoformat() if db_doctor.created_at else None,
        patientCount=0,
        averageRating=0.0
    )

@router.delete("/{doctor_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_doctor(doctor_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """Delete a doctor"""
    
    db_doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not db_doctor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")
    
    db.delete(db_doctor)
    db.commit()
    
    return None