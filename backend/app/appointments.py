from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from db.database import get_db
from db.models import Appointment, Doctor, Patient
from app.auth import get_current_user
from datetime import datetime

router = APIRouter()
public_router = APIRouter()

class AppointmentBase(BaseModel):
    patient_id: int
    doctor_id: int
    date: str
    time: str
    category: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = "scheduled"

class AppointmentCreate(AppointmentBase):
    pass

class AppointmentResponse(AppointmentBase):
    id: int
    created_at: datetime
    doctor_name: Optional[str] = None
    patient_name: Optional[str] = None
    
    class Config:
        orm_mode = True

@router.post("/", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
def create_appointment(appointment: AppointmentCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """Create a new appointment"""
    
    # Verify patient and doctor exist
    patient = db.query(Patient).filter(Patient.id == appointment.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail=f"Patient with ID {appointment.patient_id} not found")
    
    doctor = db.query(Doctor).filter(Doctor.id == appointment.doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail=f"Doctor with ID {appointment.doctor_id} not found")
    
    # Validate appointment date is not in the past
    current_date = datetime.now().strftime("%Y-%m-%d")
    if appointment.date < current_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot schedule appointments for past dates"
        )
    
    # Create appointment
    db_appointment = Appointment(
        patient_id=appointment.patient_id,
        doctor_id=appointment.doctor_id,
        date=appointment.date,
        time=appointment.time,
        category=appointment.category,
        description=appointment.description,
        status=appointment.status
    )
    
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    
    # Add doctor and patient names for the response
    db_appointment.doctor_name = doctor.name
    db_appointment.patient_name = f"{patient.first_name} {patient.last_name}"
    
    return db_appointment

@router.get("/", response_model=List[AppointmentResponse])
def get_appointments(
    doctor_id: Optional[int] = None, 
    date: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get appointments for the authenticated user (patient or doctor), with optional filters"""
    
    query = db.query(Appointment)
    
    # Filter based on user role
    if current_user["role"] == "patient":
        # For patients, filter by their ID
        query = query.filter(Appointment.patient_id == current_user["id"])
    elif current_user["role"] == "doctor":
        # For doctors, filter by their doctor ID
        query = query.filter(Appointment.doctor_id == current_user["id"])
    
    # Apply additional filters if provided
    if doctor_id:
        query = query.filter(Appointment.doctor_id == doctor_id)
        
    if date:
        query = query.filter(Appointment.date == date)
        
    if status:
        query = query.filter(Appointment.status == status)
    
    # Get appointments
    appointments = query.all()
    
    # Add doctor and patient names for the response
    for appointment in appointments:
        doctor = db.query(Doctor).filter(Doctor.id == appointment.doctor_id).first()
        patient = db.query(Patient).filter(Patient.id == appointment.patient_id).first()
        
        if doctor:
            appointment.doctor_name = doctor.name
        
        if patient:
            appointment.patient_name = f"{patient.first_name} {patient.last_name}"
    
    return appointments

@public_router.get("/all", response_model=List[AppointmentResponse])
def get_appointments_public(
    patient_id: Optional[int] = None,
    doctor_id: Optional[int] = None,
    date: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get appointments with optional filters - public endpoint without authentication"""
    
    query = db.query(Appointment)
    
    # Apply filters if provided
    if patient_id:
        query = query.filter(Appointment.patient_id == patient_id)
    
    if doctor_id:
        query = query.filter(Appointment.doctor_id == doctor_id)
        
    if date:
        query = query.filter(Appointment.date == date)
        
    if status:
        query = query.filter(Appointment.status == status)
    
    # Get appointments
    appointments = query.all()
    
    # Add doctor and patient names for the response
    for appointment in appointments:
        doctor = db.query(Doctor).filter(Doctor.id == appointment.doctor_id).first()
        patient = db.query(Patient).filter(Patient.id == appointment.patient_id).first()
        
        if doctor:
            appointment.doctor_name = doctor.name
        
        if patient:
            appointment.patient_name = f"{patient.first_name} {patient.last_name}"
    
    return appointments


@router.get("/all", response_model=List[AppointmentResponse])
def get_all_appointments_for_admin(
    patient_id: Optional[int] = None,
    doctor_id: Optional[int] = None,
    date: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Admin endpoint: get all appointments with optional filters.

    This is the endpoint used by the admin analytics calendar.
    """
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin can view all appointments",
        )

    query = db.query(Appointment)

    if patient_id:
        query = query.filter(Appointment.patient_id == patient_id)
    if doctor_id:
        query = query.filter(Appointment.doctor_id == doctor_id)
    if date:
        query = query.filter(Appointment.date == date)
    if status:
        query = query.filter(Appointment.status == status)

    appointments = query.all()

    for appointment in appointments:
        doctor = db.query(Doctor).filter(Doctor.id == appointment.doctor_id).first()
        patient = db.query(Patient).filter(Patient.id == appointment.patient_id).first()

        if doctor:
            appointment.doctor_name = doctor.name
        if patient:
            appointment.patient_name = f"{patient.first_name} {patient.last_name}"

    return appointments

@router.put("/{appointment_id}", response_model=AppointmentResponse)
def update_appointment(
    appointment_id: int, 
    appointment: AppointmentCreate, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update an existing appointment"""
    
    db_appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    
    if not db_appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Appointment with ID {appointment_id} not found"
        )
    
    # Update appointment fields
    for key, value in appointment.dict().items():
        setattr(db_appointment, key, value)
    
    db.commit()
    db.refresh(db_appointment)
    
    # Add doctor and patient names for the response
    doctor = db.query(Doctor).filter(Doctor.id == db_appointment.doctor_id).first()
    patient = db.query(Patient).filter(Patient.id == db_appointment.patient_id).first()
    
    if doctor:
        db_appointment.doctor_name = doctor.name
    
    if patient:
        db_appointment.patient_name = f"{patient.first_name} {patient.last_name}"
    
    return db_appointment

@router.delete("/{appointment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_appointment(
    appointment_id: int, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Delete an appointment"""
    
    db_appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    
    if not db_appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Appointment with ID {appointment_id} not found"
        )
    
    db.delete(db_appointment)
    db.commit()
    
    return None