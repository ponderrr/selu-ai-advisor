from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.dependencies import get_db
from app.schemas.academic import MajorOut, ConcentrationOut
from app.models.major import Major
from app.models.concentration import Concentration

academic_router = APIRouter(prefix="/academic", tags=["academic"])

@academic_router.get("/majors", response_model=list[MajorOut])
def list_majors(db: Session = Depends(get_db)):
    return db.query(Major).order_by(Major.name).all()

@academic_router.get("/concentrations", response_model=list[ConcentrationOut])
def list_concentrations(major_id: int, db: Session = Depends(get_db)):
    if not db.get(Major, major_id):
        raise HTTPException(404, "Major not found")
    return (
        db.query(Concentration)
        .filter(Concentration.major_id == major_id)
        .order_by(Concentration.name)
        .all()
    )
