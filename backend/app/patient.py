from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from db.database import SessionLocal
from db.models import Patient
from app.schemas import PatientResponse
from app.auth import get_current_user

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("", response_model=list[PatientResponse])
def list_patients(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """Return a list of all patients"""
    try:
        patients = db.query(Patient).all()
        return [
            PatientResponse(
                id=patient.id,
                first_name=patient.first_name or "Unknown",
                last_name=patient.last_name or "Unknown",
                email=patient.email or "N/A",
                phone_number=patient.phone_number or "N/A",
                created_at=patient.created_at.isoformat() if patient.created_at else datetime.utcnow().isoformat(),
                is_active=patient.is_active if patient.is_active is not None else True
            )
            for patient in patients
        ]
    except Exception as e:
        print(f"Error fetching patients: {str(e)}")  # Log to console for debugging
        raise HTTPException(status_code=500, detail=f"Failed to fetch patients: {str(e)}")

@router.get("/search", response_model=list[PatientResponse])
def search_patients(name: str = None, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """Search patients by name"""
    try:
        query = db.query(Patient)
        if name:
            # Search in both first_name and last_name
            query = query.filter(
                (Patient.first_name.ilike(f"%{name}%")) | 
                (Patient.last_name.ilike(f"%{name}%"))
            )
        
        patients = query.all()
        return [
            PatientResponse(
                id=patient.id,
                first_name=patient.first_name or "Unknown",
                last_name=patient.last_name or "Unknown",
                email=patient.email or "N/A",
                phone_number=patient.phone_number or "N/A",
                created_at=patient.created_at.isoformat() if patient.created_at else datetime.utcnow().isoformat(),
                is_active=patient.is_active if patient.is_active is not None else True
            )
            for patient in patients
        ]
    except Exception as e:
        print(f"Error searching patients: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to search patients: {str(e)}")

@router.get("/{patient_id}", response_model=PatientResponse)
def get_patient(patient_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """Get a specific patient by ID"""
    try:
        patient = db.query(Patient).filter(Patient.id == patient_id).first()
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        return PatientResponse(
            id=patient.id,
            first_name=patient.first_name or "Unknown",
            last_name=patient.last_name or "Unknown",
            email=patient.email or "N/A",
            phone_number=patient.phone_number or "N/A",
            created_at=patient.created_at.isoformat() if patient.created_at else datetime.utcnow().isoformat(),
            is_active=patient.is_active if patient.is_active is not None else True
        )
    except Exception as e:
        print(f"Error fetching patient {patient_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch patient: {str(e)}")

@router.patch("/{patient_id}/status", response_model=PatientResponse, status_code=status.HTTP_200_OK)
def update_patient_status(patient_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """Toggle the active status of a patient"""
    try:
        patient = db.query(Patient).filter(Patient.id == patient_id).first()
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")

        patient.is_active = not patient.is_active
        db.commit()
        db.refresh(patient)
        return PatientResponse(
            id=patient.id,
            first_name=patient.first_name or "Unknown",
            last_name=patient.last_name or "Unknown",
            email=patient.email or "N/A",
            phone_number=patient.phone_number or "N/A",
            created_at=patient.created_at.isoformat() if patient.created_at else datetime.utcnow().isoformat(),
            is_active=patient.is_active
        )
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Database error during status update")
    except Exception as e:
        db.rollback()
        print(f"Error updating patient status: {str(e)}")  # Log to console
        raise HTTPException(status_code=500, detail=f"Failed to update patient status: {str(e)}")