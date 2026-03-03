from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from db.database import Base, engine, SessionLocal
from db.models import FeedbackCategory, Admin
from passlib.context import CryptContext
from app.doctor import router as doctor_router
from app.patient import router as patient_router
from app.feedback import router as feedback_router
from app.auth import router as auth_router
from app.reminders import router as reminders_router
from app.appointments import router as appointments_router, public_router as appointments_public_router
from app.medications import router as medications_router
from app.statistics import router as statistics_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    db = SessionLocal()
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    try:
        # Initialize feedback categories only if none exist
        existing_categories = db.query(FeedbackCategory).count()
        if existing_categories == 0:
            categories = ["Service Quality", "Doctor Consultation", "Wait Time", "Staff Behavior", "Facilities", "Overall Experience"]
            for name in categories:
                db.add(FeedbackCategory(name=name))
            db.commit()
        
        # Create default admin user if none exist, or ensure the existing one works
        existing_admin = db.query(Admin).filter(Admin.email == "admin@gmail.com").first()
        if not existing_admin:
            # Check if any admin exists
            existing_admins = db.query(Admin).count()
            if existing_admins == 0:
                # Create new admin
                default_admin = Admin(
                    email="admin@gmail.com",
                    password=pwd_context.hash("admin"),
                    name="System Administrator"
                )
                db.add(default_admin)
                db.commit()
                print("Created default admin user: admin@gmail.com / admin")
        else:
            print(f"Existing admin found: {existing_admin.email}")
        
        yield
    finally:
        db.close()

app = FastAPI(
    title="DGH Care API", 
    version="1.0.0", 
    lifespan=lifespan,
    redirect_slashes=False
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "https://sparkling-sprinkles-24d64b.netlify.app",
        "https://*.netlify.app",
        "*"  # Allow all origins
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)
Base.metadata.create_all(bind=engine)

app.include_router(doctor_router, prefix="/doctor", tags=["Doctors"])
app.include_router(patient_router, prefix="/patients", tags=["Patients"])
app.include_router(feedback_router, prefix="/feedback", tags=["Feedback"])
app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(reminders_router, prefix="/reminders", tags=["Reminders"])
app.include_router(appointments_router, prefix="/appointments", tags=["Appointments"])
app.include_router(appointments_public_router, prefix="/appointments/public", tags=["Appointments Public"])
app.include_router(medications_router, prefix="/medications", tags=["Medications"])
app.include_router(statistics_router)

@app.get("/")
def root():
    return {"message": "DGH Care API", "status": "running", "health_endpoint": "/health"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "DGH Care API"}

@app.options("/{path:path}")
def handle_options(path: str):
    return {"message": "OK"}
