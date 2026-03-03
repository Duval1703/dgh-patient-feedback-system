from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List
import os
from db.database import SessionLocal
from db.models import MedicationReminder, Patient
from app.schemas import MedicationReminderCreate, MedicationReminderResponse
from twilio.rest import Client

router = APIRouter()

# Initialize Twilio client - MUST be configured via environment variables
twilio_account_sid = os.environ.get("TWILIO_ACCOUNT_SID")
twilio_auth_token = os.environ.get("TWILIO_AUTH_TOKEN")
twilio_phone_number = os.environ.get("TWILIO_PHONE_NUMBER")

# Only create client if all credentials are provided
client = Client(twilio_account_sid, twilio_auth_token) if (twilio_account_sid and twilio_auth_token) else None

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def send_sms_reminder(to_phone: str, message: str):
    """Send SMS reminder using Twilio"""
    try:
        if client:
            message = client.messages.create(
                body=message,
                from_=twilio_phone_number,
                to=to_phone
            )
            print(f"Message sent with SID: {message.sid}")
            return True
        else:
            print("Twilio client not configured. SMS not sent.")
            return False
    except Exception as e:
        print(f"Failed to send SMS: {str(e)}")
        return False

@router.post("/", response_model=MedicationReminderResponse, status_code=status.HTTP_201_CREATED)
async def create_reminder(
    reminder: MedicationReminderCreate, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Create a new medication reminder"""
    try:
        # Check if patient exists
        patient = db.query(Patient).filter(Patient.id == reminder.patient_id).first()
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        # Create reminder
        new_reminder = MedicationReminder(
            patient_id=reminder.patient_id,
            medication=reminder.medication,
            time=reminder.time,
            frequency=reminder.frequency
        )
        
        db.add(new_reminder)
        db.commit()
        db.refresh(new_reminder)
        
        # Send SMS reminder if phone number exists
        if patient.phone_number:
            message = f"Reminder: Take your {reminder.medication} at {reminder.time} ({reminder.frequency}). - Douala General Hospital"
            background_tasks.add_task(send_sms_reminder, patient.phone_number, message)
        
        return MedicationReminderResponse(
            id=new_reminder.id,
            patient_id=new_reminder.patient_id,
            medication=new_reminder.medication,
            time=new_reminder.time,
            frequency=new_reminder.frequency,
            is_active=new_reminder.is_active,
            created_at=new_reminder.created_at.isoformat()
        )
        
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Database error during reminder creation")
    except Exception as e:
        db.rollback()
        print(f"Error creating reminder: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create reminder: {str(e)}")

@router.get("/", response_model=List[MedicationReminderResponse])
async def get_patient_reminders(patient_id: int, db: Session = Depends(get_db)):
    """Get all reminders for a patient"""
    try:
        # Check if patient exists
        patient = db.query(Patient).filter(Patient.id == patient_id).first()
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        reminders = db.query(MedicationReminder).filter(
            MedicationReminder.patient_id == patient_id,
            MedicationReminder.is_active == True
        ).all()
        
        return [
            MedicationReminderResponse(
                id=reminder.id,
                patient_id=reminder.patient_id,
                medication=reminder.medication,
                time=reminder.time,
                frequency=reminder.frequency,
                is_active=reminder.is_active,
                created_at=reminder.created_at.isoformat()
            )
            for reminder in reminders
        ]
    except Exception as e:
        print(f"Error fetching reminders: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch reminders: {str(e)}")

@router.delete("/{reminder_id}", status_code=status.HTTP_200_OK)
async def delete_reminder(reminder_id: int, db: Session = Depends(get_db)):
    """Delete a medication reminder"""
    try:
        reminder = db.query(MedicationReminder).filter(MedicationReminder.id == reminder_id).first()
        if not reminder:
            raise HTTPException(status_code=404, detail="Reminder not found")
        
        # Soft delete
        reminder.is_active = False
        db.commit()
        
        return {"detail": "Reminder successfully deleted"}
    except Exception as e:
        db.rollback()
        print(f"Error deleting reminder: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete reminder: {str(e)}")