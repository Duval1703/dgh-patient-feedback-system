from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from db.database import get_db
from db.models import Medication, Doctor, Patient
from app.auth import get_current_user
from datetime import datetime

router = APIRouter()

class MedicationBase(BaseModel):
    patient_id: int
    doctor_id: int
    medication: str
    dosage: str
    frequency: str
    instructions: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None

class MedicationCreate(MedicationBase):
    pass

class MedicationResponse(MedicationBase):
    id: int
    created_at: datetime
    doctor_name: Optional[str] = None
    patient_name: Optional[str] = None
    
    class Config:
        orm_mode = True

@router.post("/", response_model=MedicationResponse, status_code=status.HTTP_201_CREATED)
@router.post("", response_model=MedicationResponse, status_code=status.HTTP_201_CREATED)
def create_medication(medication: MedicationCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """Create a new medication record"""
    
    # Verify patient and doctor exist
    patient = db.query(Patient).filter(Patient.id == medication.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail=f"Patient with ID {medication.patient_id} not found")
    
    doctor = db.query(Doctor).filter(Doctor.id == medication.doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail=f"Doctor with ID {medication.doctor_id} not found")
    
    # Create medication record
    db_medication = Medication(
        patient_id=medication.patient_id,
        doctor_id=medication.doctor_id,
        medication=medication.medication,
        dosage=medication.dosage,
        frequency=medication.frequency,
        instructions=medication.instructions,
        start_date=medication.start_date,
        end_date=medication.end_date
    )
    
    db.add(db_medication)
    db.commit()
    db.refresh(db_medication)
    
    # Add doctor and patient names for the response
    db_medication.doctor_name = doctor.name
    db_medication.patient_name = f"{patient.first_name} {patient.last_name}"
    
    return db_medication

@router.get("/", response_model=List[MedicationResponse])
@router.get("", response_model=List[MedicationResponse])
def get_medications(
    doctor_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get medications based on user role: for patients by patient_id, for doctors by doctor_id"""
    
    query = db.query(Medication)
    
    # Determine user role and apply appropriate filter
    role = current_user.get("role", "patient")  # Default to patient if role not specified
    if role == "doctor":
        # Filter by the authenticated doctor's ID
        query = query.filter(Medication.doctor_id == current_user["id"])
    else:
        # Filter by the authenticated patient's ID
        query = query.filter(Medication.patient_id == current_user["id"])
    
    # Apply additional doctor_id filter if provided (for compatibility)
    if doctor_id:
        query = query.filter(Medication.doctor_id == doctor_id)
    
    # Get medications
    medications = query.all()
    
    # Add doctor and patient names for the response
    for medication in medications:
        doctor = db.query(Doctor).filter(Doctor.id == medication.doctor_id).first()
        patient = db.query(Patient).filter(Patient.id == medication.patient_id).first()
        
        if doctor:
            medication.doctor_name = doctor.name
        
        if patient:
            medication.patient_name = f"{patient.first_name} {patient.last_name}"
    
    return medications

@router.get("/{medication_id}", response_model=MedicationResponse)
def get_medication(
    medication_id: int, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get a specific medication by ID"""
    
    medication = db.query(Medication).filter(Medication.id == medication_id).first()
    
    if not medication:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Medication with ID {medication_id} not found"
        )
    
    # Add doctor and patient names for the response
    doctor = db.query(Doctor).filter(Doctor.id == medication.doctor_id).first()
    patient = db.query(Patient).filter(Patient.id == medication.patient_id).first()
    
    if doctor:
        medication.doctor_name = doctor.name
    
    if patient:
        medication.patient_name = f"{patient.first_name} {patient.last_name}"
    
    return medication

@router.put("/{medication_id}", response_model=MedicationResponse)
def update_medication(
    medication_id: int, 
    medication: MedicationCreate, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update an existing medication"""
    
    db_medication = db.query(Medication).filter(Medication.id == medication_id).first()
    
    if not db_medication:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Medication with ID {medication_id} not found"
        )
    
    # Update medication fields
    for key, value in medication.dict().items():
        setattr(db_medication, key, value)
    
    db.commit()
    db.refresh(db_medication)
    
    # Add doctor and patient names for the response
    doctor = db.query(Doctor).filter(Doctor.id == db_medication.doctor_id).first()
    patient = db.query(Patient).filter(Patient.id == db_medication.patient_id).first()
    
    if doctor:
        db_medication.doctor_name = doctor.name
    
    if patient:
        db_medication.patient_name = f"{patient.first_name} {patient.last_name}"
    
    return db_medication

@router.delete("/{medication_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_medication(
    medication_id: int, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Delete a medication"""
    
    db_medication = db.query(Medication).filter(Medication.id == medication_id).first()
    
    if not db_medication:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Medication with ID {medication_id} not found"
        )
    
    db.delete(db_medication)
    db.commit()
    
    return None