from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
import app.schemas as schemas
import app.crud as crud

router = APIRouter(prefix="/forms", tags=["Forms"])


@router.get("", response_model=List[schemas.FormResponse])
def list_forms(creator_id: str = "default_creator", db: Session = Depends(get_db)):
    return crud.get_forms(db, creator_id=creator_id)


@router.post("", response_model=schemas.FormResponse)
def create_new_form(form_in: schemas.FormCreate, db: Session = Depends(get_db)):
    return crud.create_form(db, form_in)


@router.get("/{form_id}", response_model=schemas.FormResponse)
def get_form_details(form_id: str, db: Session = Depends(get_db)):
    form = crud.get_form(db, form_id)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    return form


@router.put("/{form_id}", response_model=schemas.FormResponse)
def update_form_settings(form_id: str, form_in: schemas.FormUpdate, db: Session = Depends(get_db)):
    form = crud.update_form(db, form_id, form_in)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    return form


@router.delete("/{form_id}")
def remove_form(form_id: str, db: Session = Depends(get_db)):
    success = crud.delete_form(db, form_id)
    if not success:
        raise HTTPException(status_code=404, detail="Form not found")
    return {"message": "Form deleted successfully"}


@router.post("/{form_id}/duplicate", response_model=schemas.FormResponse)
def duplicate_existing_form(form_id: str, db: Session = Depends(get_db)):
    form = crud.duplicate_form(db, form_id)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    return form


@router.post("/{form_id}/publish", response_model=schemas.FormResponse)
def publish_toggle_form(form_id: str, db: Session = Depends(get_db)):
    form = crud.toggle_publish_form(db, form_id)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    return form