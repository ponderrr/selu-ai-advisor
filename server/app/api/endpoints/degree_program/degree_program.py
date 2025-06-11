from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_db
from app.models.degree_program import DegreeProgram
from app.schemas.degree_program import ProgramRequirements

degree_program_module = APIRouter(prefix="/degree-programs", tags=["degree-programs"])

@degree_program_module.get("/{program_id}/requirements", response_model=ProgramRequirements)
def get_program_requirements(program_id: int, db: Session = Depends(get_db)):
    """Get the program structure and requirements for a specific degree program."""
    program = db.query(DegreeProgram).filter(DegreeProgram.id == program_id).first()
    if not program:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Degree program with id {program_id} not found"
        )
    return program 