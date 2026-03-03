from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text, DateTime, Time
from datetime import datetime
from sqlalchemy.orm import relationship

# Support importing this module both as part of the `db` package and as a
# standalone module (e.g. when running initialization scripts directly).
try:
    from db.database import Base
except ModuleNotFoundError:  # pragma: no cover - fallback for direct execution
    from database import Base
class Admin(Base):
    __tablename__ = "admins"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    name = Column(String)

class Doctor(Base):
    __tablename__ = "doctors"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    name = Column(String)
    specialty = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)

class Patient(Base):
    __tablename__ = "patients"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    first_name = Column(String)
    last_name = Column(String)
    phone_number = Column(String)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class FeedbackCategory(Base):
    __tablename__ = "feedback_categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)

class Feedback(Base):
    __tablename__ = "feedback"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    doctor_id = Column(Integer, ForeignKey("doctors.id"))
    category_id = Column(Integer, ForeignKey("feedback_categories.id"))
    rating = Column(Integer)
    comment = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    patient = relationship("Patient")
    doctor = relationship("Doctor")
    category = relationship("FeedbackCategory")
    replies = relationship("FeedbackReply", back_populates="feedback")

class FeedbackReply(Base):
    __tablename__ = "feedback_replies"
    id = Column(Integer, primary_key=True, index=True)
    feedback_id = Column(Integer, ForeignKey("feedback.id"))
    admin_id = Column(Integer, ForeignKey("admins.id"))
    reply_text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    feedback = relationship("Feedback", back_populates="replies")
    admin = relationship("Admin")

class MedicationReminder(Base):
    __tablename__ = "medication_reminders"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    medication = Column(String, nullable=False)
    time = Column(String, nullable=False)  # Store as string in HH:MM format
    frequency = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    patient = relationship("Patient")

# Add new models for appointments and medications
class Appointment(Base):
    __tablename__ = "appointments"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    date = Column(String, nullable=False)  # Store as string in YYYY-MM-DD format
    time = Column(String, nullable=False)  # Store as string in HH:MM format
    category = Column(String)  # Appointment category/type
    description = Column(Text)  # Description or notes
    status = Column(String, default="scheduled")  # scheduled, completed, cancelled
    created_at = Column(DateTime, default=datetime.utcnow)
    patient = relationship("Patient")
    doctor = relationship("Doctor")

class Medication(Base):
    __tablename__ = "medications"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    medication = Column(String, nullable=False)  # Name of medication
    dosage = Column(String, nullable=False)  # Dosage amount
    frequency = Column(String, nullable=False)  # How often to take
    instructions = Column(Text)  # Additional instructions
    start_date = Column(String)  # YYYY-MM-DD format
    end_date = Column(String)  # YYYY-MM-DD format
    created_at = Column(DateTime, default=datetime.utcnow)
    patient = relationship("Patient")
    doctor = relationship("Doctor")