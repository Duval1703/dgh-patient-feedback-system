from pydantic import BaseModel
from typing import Optional

class DoctorBase(BaseModel):
    name: str
    is_active: Optional[bool] = True

class DoctorResponse(DoctorBase):
    id: int
    specialty: str
    email: str
    
    class Config:
        from_attributes = True

class DoctorCreate(BaseModel):
    name: str
    specialty: str
    email: str
    password: str

class PatientBase(BaseModel):
    name: str

class PatientResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    phone_number: str
    created_at: str
    is_active: bool
    class Config:
        from_attributes = True

class FeedbackCategoryResponse(BaseModel):
    id: int
    name: str
    class Config:
        from_attributes = True

class FeedbackBase(BaseModel):
    patient_id: int
    doctor_id: int
    category_id: int
    rating: int
    comment: str

class FeedbackResponse(FeedbackBase):
    id: int
    created_at: str
    patient: PatientResponse
    doctor: DoctorResponse
    category: FeedbackCategoryResponse
    class Config:
        from_attributes = True

class MedicationReminderBase(BaseModel):
    medication: str
    time: str
    frequency: str

class MedicationReminderCreate(MedicationReminderBase):
    patient_id: int

class MedicationReminderResponse(MedicationReminderBase):
    id: int
    patient_id: int
    is_active: bool
    created_at: str
    class Config:
        from_attributes = True