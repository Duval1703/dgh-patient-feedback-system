from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from db.database import SessionLocal
from db.models import Feedback, FeedbackCategory, Doctor, Patient, FeedbackReply, Admin
from app.schemas import FeedbackResponse, FeedbackBase, FeedbackCategoryResponse, DoctorResponse
from app.auth import get_current_user
from pydantic import BaseModel
import traceback
from datetime import datetime
from typing import Optional, List

router = APIRouter(redirect_slashes=False)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class FeedbackBase(BaseModel):
    doctor_id: Optional[int] = None
    category_id: int
    rating: int
    comment: str

class FeedbackReplyCreate(BaseModel):
    reply_text: str

class FeedbackReplyResponse(BaseModel):
    id: int
    reply_text: str
    created_at: str
    admin_name: Optional[str] = "Hospital Administration"
    
    class Config:
        from_attributes = True

class FeedbackResponse(FeedbackBase):
    id: int
    created_at: str
    patient_id: Optional[int] = None
    patient_name: Optional[str] = None
    category: FeedbackCategoryResponse
    doctor: Optional[DoctorResponse]
    replies: Optional[List[FeedbackReplyResponse]] = []
    class Config:
        from_attributes = True

@router.get("/feedback_categories", response_model=list[FeedbackCategoryResponse])
def list_categories(db: Session = Depends(get_db)):
    """Return a list of feedback categories"""
    categories = db.query(FeedbackCategory).all()
    if not categories:
        raise HTTPException(status_code=404, detail="No categories found")
    return [
        FeedbackCategoryResponse(
            id=cat.id,
            name=cat.name
        )
        for cat in categories
    ]

@router.get("", response_model=list[FeedbackResponse])
def list_feedback(doctor_id: Optional[int] = None, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """Return a list of feedback - all feedback for admin, patient's own feedback for patients, doctor-related feedback for doctors"""
    
    query = db.query(Feedback)
    
    # Filter based on user role
    if current_user["role"] == "patient":
        # Patients can only see their own feedback
        patient_id = current_user["id"]
        query = query.filter(Feedback.patient_id == patient_id)
    elif current_user["role"] == "doctor":
        # Doctors can only see feedback about them
        doctor_id_filter = current_user["id"]
        query = query.filter(Feedback.doctor_id == doctor_id_filter)
    # Admin can see all feedback (no additional filtering)
    
    # Additional doctor_id filter from query parameter (for admin use)
    if doctor_id and current_user["role"] == "admin":
        query = query.filter(Feedback.doctor_id == doctor_id)
    
    feedback = query.all()

    # Build response list, anonymizing patient identity for non-patient viewers
    responses: list[FeedbackResponse] = []
    for fb in feedback:
        # Determine what to expose about the patient
        if current_user["role"] == "patient":
            # Patient viewing their own feedback – show real identity
            exposed_patient_id = fb.patient_id
            exposed_patient_name = (
                f"{fb.patient.first_name} {fb.patient.last_name}"
                if fb.patient and fb.patient.first_name
                else f"Patient {fb.patient_id}"
            )
        else:
            # Doctors and admins should not see the patient identity
            exposed_patient_id = None
            exposed_patient_name = "Anonymous"

        responses.append(
            FeedbackResponse(
                id=fb.id,
                doctor_id=fb.doctor_id,
                category_id=fb.category_id,
                rating=fb.rating,
                comment=fb.comment,
                created_at=fb.created_at.isoformat(),
                patient_id=exposed_patient_id,
                patient_name=exposed_patient_name,
                category=FeedbackCategoryResponse(id=fb.category.id, name=fb.category.name),
                doctor=DoctorResponse(
                    id=fb.doctor.id if fb.doctor else None,
                    name=fb.doctor.name or "Unknown" if fb.doctor else None,
                    specialty=fb.doctor.specialty or "N/A" if fb.doctor else None,
                    email=fb.doctor.email or "N/A" if fb.doctor else None,
                    is_active=fb.doctor.is_active if fb.doctor and fb.doctor.is_active is not None else True,
                    patientCount=0,
                    averageRating=0.0
                ) if fb.doctor else None,
                replies=[
                    FeedbackReplyResponse(
                        id=reply.id,
                        reply_text=reply.reply_text,
                        created_at=reply.created_at.isoformat(),
                        admin_name=reply.admin.name if reply.admin and reply.admin.name else "Hospital Administration"
                    )
                    for reply in fb.replies
                ] if fb.replies else []
            )
        )

    return responses

@router.post("", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED)
def create_feedback(data: FeedbackBase, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """Create a new feedback entry for the authenticated patient"""
    # Validate doctor_id
    doctor = None
    if data.doctor_id:
        doctor = db.query(Doctor).filter(Doctor.id == data.doctor_id).first()
        if not doctor:
            raise HTTPException(status_code=404, detail="Doctor not found")
    
    # Validate patient_id from current_user
    patient = db.query(Patient).filter(Patient.id == current_user["id"]).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Validate category_id
    category = db.query(FeedbackCategory).filter(FeedbackCategory.id == data.category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Feedback category not found")

    # Create feedback with patient_id from current_user
    new_feedback = Feedback(
        patient_id=current_user["id"],
        doctor_id=data.doctor_id,
        category_id=data.category_id,
        rating=data.rating,
        comment=data.comment
    )
    try:
        db.add(new_feedback)
        db.commit()
        db.refresh(new_feedback)
    except Exception as e:
        db.rollback()
        print("Error creating feedback:", traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to create feedback: {str(e)}") 
    return FeedbackResponse(
        id=new_feedback.id,
        doctor_id=new_feedback.doctor_id,
        category_id=new_feedback.category_id,
        rating=new_feedback.rating,
        comment=new_feedback.comment,
        created_at=new_feedback.created_at.isoformat(),
        category=FeedbackCategoryResponse(id=category.id, name=category.name),
        doctor=DoctorResponse(
            id=doctor.id if doctor else None,
            name=doctor.name or "Unknown" if doctor else None,
            specialty=doctor.specialty or "N/A" if doctor else None,
            email=doctor.email or "N/A" if doctor else None,
            is_active=doctor.is_active if doctor and doctor.is_active is not None else True,
            patientCount=0,
            averageRating=0.0
        ) if doctor else None
    )

@router.post("/{feedback_id}/reply", response_model=FeedbackReplyResponse, status_code=status.HTTP_201_CREATED)
def create_feedback_reply(feedback_id: int, reply_data: FeedbackReplyCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """Create a reply to feedback - admin only"""
    
    # Only admins can reply to feedback
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admins can reply to feedback")
    
    # Check if feedback exists
    feedback = db.query(Feedback).filter(Feedback.id == feedback_id).first()
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    # Create reply
    new_reply = FeedbackReply(
        feedback_id=feedback_id,
        admin_id=current_user["id"],
        reply_text=reply_data.reply_text
    )
    
    try:
        db.add(new_reply)
        db.commit()
        db.refresh(new_reply)
        
        # Get admin info for response
        admin = db.query(Admin).filter(Admin.id == current_user["id"]).first()
        admin_name = admin.name if admin and admin.name else "Hospital Administration"
        
        return FeedbackReplyResponse(
            id=new_reply.id,
            reply_text=new_reply.reply_text,
            created_at=new_reply.created_at.isoformat(),
            admin_name=admin_name
        )
    except Exception as e:
        db.rollback()
        print("Error creating feedback reply:", traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to create reply: {str(e)}")
