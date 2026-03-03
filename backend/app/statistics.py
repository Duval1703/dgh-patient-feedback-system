from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from db.database import get_db
from db.models import Doctor, Patient, Appointment, Feedback
from app.auth import get_current_user
from typing import List, Dict
from pydantic import BaseModel
from sqlalchemy import func
from pathlib import Path
from functools import lru_cache

try:
    from transformers import AutoTokenizer, AutoModelForSequenceClassification
    import torch
except ImportError:  # If not installed, sentiment endpoint will return 503
    AutoTokenizer = None
    AutoModelForSequenceClassification = None
    torch = None

router = APIRouter(prefix="/statistics", tags=["Statistics"])

MODEL_DIR = Path(__file__).resolve().parent.parent / "model"


@lru_cache(maxsize=1)
def get_sentiment_pipeline():
    """Lazy-load sentiment model and tokenizer from the local `model` directory."""
    import logging
    logger = logging.getLogger(__name__)
    
    logger.warning(f"=== get_sentiment_pipeline called ===")
    logger.warning(f"MODEL_DIR: {MODEL_DIR}")
    logger.warning(f"MODEL_DIR exists: {MODEL_DIR.exists()}")
    logger.warning(f"AutoTokenizer: {AutoTokenizer}")
    logger.warning(f"torch: {torch}")
    
    if AutoTokenizer is None or AutoModelForSequenceClassification is None or torch is None:
        logger.error("⚠️ Transformers library not available")
        print("⚠️ Transformers library not available")
        return None
    if not MODEL_DIR.exists():
        logger.error(f"⚠️ Model directory not found: {MODEL_DIR}")
        print(f"⚠️ Model directory not found: {MODEL_DIR}")
        return None

    try:
        logger.warning(f"📦 Loading sentiment model from: {MODEL_DIR}")
        print(f"📦 Loading sentiment model from: {MODEL_DIR}")
        tokenizer = AutoTokenizer.from_pretrained(str(MODEL_DIR))
        logger.warning("✓ Tokenizer loaded")
        model = AutoModelForSequenceClassification.from_pretrained(str(MODEL_DIR))
        model.eval()
        logger.warning("✅ Sentiment model loaded successfully!")
        print("✅ Sentiment model loaded successfully!")
    except Exception as e:
        logger.error(f"❌ Error loading sentiment model: {e}")
        print(f"❌ Error loading sentiment model: {e}")
        import traceback
        traceback.print_exc()
        return None

    def analyze(texts: List[str]) -> List[str]:
        """Return sentiment labels for each text.

        If the underlying model only has 2 classes (e.g. POSITIVE/NEGATIVE),
        we derive a NEUTRAL band based on confidence: low-confidence
        predictions are mapped to NEUTRAL.
        """
        with torch.no_grad():
            inputs = tokenizer(texts, padding=True, truncation=True, max_length=256, return_tensors="pt")
            outputs = model(**inputs)
            probs = torch.softmax(outputs.logits, dim=-1)
            max_probs, label_ids = probs.max(dim=-1)
            labels = label_ids.tolist()

        id2label = getattr(model.config, "id2label", None)

        # Heuristic neutral band for binary models
        if probs.shape[1] == 2:
            mapped: List[str] = []
            for p, idx in zip(max_probs.tolist(), labels):
                if p < 0.6:
                    mapped.append("NEUTRAL")
                else:
                    if id2label:
                        mapped.append(str(id2label.get(idx, "POSITIVE")))
                    else:
                        mapped.append("POSITIVE" if idx == 1 else "NEGATIVE")
            return mapped

        # Multi-class model: prefer its own labels
        if id2label:
            return [str(id2label.get(i, "UNKNOWN")) for i in labels]

        # Fallback: map indices to generic labels
        mapped = []
        for i in labels:
            if i == 0:
                mapped.append("NEGATIVE")
            elif i == 1:
                mapped.append("NEUTRAL")
            else:
                mapped.append("POSITIVE")
        return mapped

    return analyze

class DepartmentStats(BaseModel):
    name: str
    avgRating: float
    patients: int
    doctors: int

class HospitalStats(BaseModel):
    title: str
    value: str
    change: str
    trend: str
    icon: Dict

class DoctorStats(BaseModel):
    totalDoctors: int
    averageRating: float
    topPerformers: List[Dict]
    specialties: List[Dict]

class TreatmentOutcomes(BaseModel):
    name: str
    value: int

class PatientAdmissionsData(BaseModel):
    name: str
    emergency: int
    scheduled: int


class SentimentBreakdown(BaseModel):
    label: str
    count: int
    percentage: float


class SentimentOverview(BaseModel):
    total_feedback: int
    breakdown: List[SentimentBreakdown]


class FeedbackSentiment(BaseModel):
    feedback_id: int
    sentiment: str


@router.get("/sentiment/details", response_model=List[FeedbackSentiment])
def get_feedback_sentiments(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """Get sentiment for each individual feedback item.
    
    Returns a list of feedback IDs with their corresponding sentiment labels.
    """
    import logging
    logger = logging.getLogger(__name__)
    logger.warning("=== /sentiment/details endpoint called ===")
    
    # Restrict to admin for this analytics endpoint
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Only admin can view sentiment analysis",
            headers={"Access-Control-Allow-Origin": "*"}
        )

    logger.warning("Calling get_sentiment_pipeline()...")
    analyze = get_sentiment_pipeline()
    
    if analyze is None:
        logger.error("Pipeline returned None - returning empty data")
        return []

    # Get all feedback comments (non-empty)
    feedback_rows = db.query(Feedback).filter(Feedback.comment.isnot(None)).all()
    feedback_rows = [fb for fb in feedback_rows if fb.comment and fb.comment.strip()]
    
    if len(feedback_rows) == 0:
        return []

    comments = [fb.comment for fb in feedback_rows]
    
    # Run model (batch for efficiency)
    base_labels: List[str] = []
    batch_size = 16
    for i in range(0, len(comments), batch_size):
        batch = comments[i : i + batch_size]
        base_labels.extend(analyze(batch))

    # Combine model output with rating to derive final labels
    result = []
    for fb, lbl in zip(feedback_rows, base_labels):
        # Use rating as an extra signal for neutrality
        if fb.rating is not None and fb.rating == 3:
            final_sentiment = "NEUTRAL"
        else:
            final_sentiment = lbl.upper()
        
        result.append(FeedbackSentiment(
            feedback_id=fb.id,
            sentiment=final_sentiment
        ))

    logger.warning(f"Returning {len(result)} feedback sentiments")
    return result


@router.get("/sentiment", response_model=SentimentOverview)
def get_sentiment_statistics(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """Compute sentiment distribution over patient feedback comments using the local model.

    Visible in the admin "Analyses" tab.
    """
    import logging
    logger = logging.getLogger(__name__)
    logger.warning("=== /sentiment endpoint called ===")
    
    # Restrict to admin for this analytics endpoint
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Only admin can view sentiment analysis",
            headers={"Access-Control-Allow-Origin": "*"}
        )

    logger.warning("Calling get_sentiment_pipeline()...")
    analyze = get_sentiment_pipeline()
    logger.warning(f"Pipeline result: {analyze}")
    
    if analyze is None:
        logger.error("Pipeline returned None - returning empty data")
        # Return empty data instead of error to prevent CORS issues
        return SentimentOverview(total_feedback=0, breakdown=[])

    # Get all feedback comments (non-empty)
    feedback_rows = db.query(Feedback).filter(Feedback.comment.isnot(None)).all()
    feedback_rows = [fb for fb in feedback_rows if fb.comment and fb.comment.strip()]
    comments = [fb.comment for fb in feedback_rows]
    total = len(comments)

    if total == 0:
        return SentimentOverview(total_feedback=0, breakdown=[])

    # Run model (batch for efficiency)
    base_labels: List[str] = []
    batch_size = 16
    for i in range(0, total, batch_size):
        batch = comments[i : i + batch_size]
        base_labels.extend(analyze(batch))

    # Combine model output with rating to derive final labels
    final_labels: List[str] = []
    for fb, lbl in zip(feedback_rows, base_labels):
        # Use rating as an extra signal for neutrality
        if fb.rating is not None and fb.rating == 3:
            final_labels.append("NEUTRAL")
        else:
            final_labels.append(lbl)

    # Aggregate counts
    counts: Dict[str, int] = {}
    for lbl in final_labels:
        key = (lbl or "UNKNOWN").upper()
        counts[key] = counts.get(key, 0) + 1

    breakdown = [
        SentimentBreakdown(
            label=label,
            count=count,
            percentage=round((count / total) * 100, 1),
        )
        for label, count in counts.items()
    ]

    return SentimentOverview(total_feedback=total, breakdown=breakdown)


@router.get("/departments", response_model=List[DepartmentStats])
def get_department_stats(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """Get department performance statistics"""
    # Get all doctors grouped by specialty
    specialties = db.query(Doctor.specialty, func.count(Doctor.id)).group_by(Doctor.specialty).all()
    
    # For now, we'll create mock data based on specialties since we don't have a departments table
    departments = []
    for specialty, count in specialties:
        # Get average rating for doctors in this specialty from feedback
        avg_rating = db.query(func.avg(Feedback.rating)).join(Doctor).filter(Doctor.specialty == specialty).scalar()
        if avg_rating is None:
            avg_rating = 0.0
        else:
            avg_rating = float(avg_rating)
        
        # Get number of patients who had appointments with doctors in this specialty
        patient_count = db.query(func.count(Appointment.patient_id.distinct())).join(Doctor).filter(Doctor.specialty == specialty).scalar()
        
        departments.append({
            "name": specialty,
            "avgRating": round(avg_rating, 1),
            "patients": patient_count,
            "doctors": count
        })
    
    return departments

@router.get("/hospital", response_model=List[HospitalStats])
def get_hospital_stats(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """Get overall hospital statistics"""
    # Get total patients
    total_patients = db.query(func.count(Patient.id)).scalar()
    
    # Get total appointments
    total_appointments = db.query(func.count(Appointment.id)).scalar()
    
    # Get average feedback rating
    avg_rating = db.query(func.avg(Feedback.rating)).scalar()
    if avg_rating is None:
        avg_rating = 0.0
    else:
        avg_rating = float(avg_rating)
    
    stats = [
        {
            "title": "Total Patients",
            "value": f"{total_patients:,}",
            "change": "+0%",
            "trend": "up",
            "icon": {
                "path": "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
                "bgColor": "bg-blue-500"
            }
        },
        {
            "title": "Appointments",
            "value": f"{total_appointments:,}",
            "change": "+0%",
            "trend": "up",
            "icon": {
                "path": "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
                "bgColor": "bg-green-500"
            }
        },
        {
            "title": "Average Stay",
            "value": "3.2 days",
            "change": "-0.5 days",
            "trend": "up",
            "icon": {
                "path": "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
                "bgColor": "bg-purple-500"
            }
        },
        {
            "title": "Patient Satisfaction",
            "value": f"{round(avg_rating * 20, 1)}%",  # Convert 5-point scale to percentage
            "change": "+0%",
            "trend": "up",
            "icon": {
                "path": "M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
                "bgColor": "bg-indigo-500"
            }
        }
    ]
    
    return stats

@router.get("/doctors", response_model=DoctorStats)
def get_doctor_stats(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """Get doctor statistics"""
    # Get total doctors
    total_doctors = db.query(func.count(Doctor.id)).scalar()
    
    # Get average rating from feedback
    avg_rating = db.query(func.avg(Feedback.rating)).scalar()
    if avg_rating is None:
        avg_rating = 0.0
    else:
        avg_rating = float(avg_rating)
    
    # Get top performers (doctors with highest average ratings)
    top_performers_query = db.query(
        Doctor.name,
        Doctor.specialty,
        func.avg(Feedback.rating).label('avg_rating')
    ).join(Feedback, Feedback.doctor_id == Doctor.id).group_by(Doctor.id).order_by(func.avg(Feedback.rating).desc()).limit(3)
    
    top_performers = []
    for doctor in top_performers_query:
        top_performers.append({
            "name": doctor.name,
            "specialty": doctor.specialty,
            "rating": round(float(doctor.avg_rating), 1)
        })
    
    # Get specialties count
    specialties_query = db.query(Doctor.specialty, func.count(Doctor.id)).group_by(Doctor.specialty).all()
    specialties = [{"name": specialty, "count": count} for specialty, count in specialties_query]
    
    return {
        "totalDoctors": total_doctors,
        "averageRating": round(avg_rating, 1),
        "topPerformers": top_performers,
        "specialties": specialties
    }

@router.get("/treatment-outcomes", response_model=List[TreatmentOutcomes])
def get_treatment_outcomes(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """Get treatment outcomes statistics"""
    # For now, we'll create mock data since we don't have treatment outcome tracking
    outcomes = [
        {"name": "Successful", "value": 76},
        {"name": "Partial Improvement", "value": 15},
        {"name": "No Change", "value": 6},
        {"name": "Complications", "value": 3}
    ]
    
    return outcomes

@router.get("/admissions", response_model=List[PatientAdmissionsData])
def get_patient_admissions(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """Get patient admissions data"""
    # For now, we'll create mock data since we don't have monthly admission tracking
    admissions_data = [
        {"name": "Jan", "emergency": 124, "scheduled": 185},
        {"name": "Feb", "emergency": 115, "scheduled": 178},
        {"name": "Mar", "emergency": 135, "scheduled": 189},
        {"name": "Apr", "emergency": 128, "scheduled": 195},
        {"name": "May", "emergency": 144, "scheduled": 203},
        {"name": "Jun", "emergency": 155, "scheduled": 211},
        {"name": "Jul", "emergency": 138, "scheduled": 204}
    ]
    
    return admissions_data