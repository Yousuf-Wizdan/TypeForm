from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
import app.schemas as schemas
import app.crud as crud

router = APIRouter(tags=["Questions"])

@router.post("/forms/{form_id}/questions", response_model=schemas.QuestionResponse)
def add_question(form_id: str, question_in: schemas.QuestionCreate, db: Session = Depends(get_db)):
    q = crud.create_question(db, form_id, question_in)
    if not q:
        raise HTTPException(status_code=404, detail="Form not found")
    return q

@router.put("/questions/{question_id}", response_model=schemas.QuestionResponse)
def update_question_details(question_id: str, question_in: schemas.QuestionUpdate, db: Session = Depends(get_db)):
    q = crud.update_question(db, question_id, question_in)
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    return q

@router.delete("/questions/{question_id}")
def remove_question(question_id: str, db: Session = Depends(get_db)):
    success = crud.delete_question(db, question_id)
    if not success:
        raise HTTPException(status_code=404, detail="Question not found")
    return {"message": "Question deleted successfully"}

@router.post("/forms/{form_id}/questions/reorder", response_model=List[schemas.QuestionResponse])
def reorder_form_questions(form_id: str, payload: schemas.FormReorderQuestions, db: Session = Depends(get_db)):
    return crud.reorder_questions(db, form_id, payload.question_ids)
