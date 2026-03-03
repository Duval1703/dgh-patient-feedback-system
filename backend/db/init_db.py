try:
    # When run in the context of the FastAPI app (e.g. `uvicorn app.main:app`)
    from db.database import Base, engine
    import db.models  # noqa: F401 - ensure models are imported so tables are registered
except ModuleNotFoundError:
    # When run directly as `python init_db.py` from the `backend/db` folder
    from database import Base, engine
    import models  # noqa: F401

if __name__ == "__main__":
    print("Creating all tables in the DGH database...")
    Base.metadata.create_all(bind=engine)
    print("Done.")
