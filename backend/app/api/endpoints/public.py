from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.core.database import get_db
import app.schemas as schemas
import app.crud as crud

router = APIRouter(prefix="/public", tags=["Public Respondent"])

limiter = Limiter(key_func=get_remote_address)


@router.get("/forms/{share_id}", response_model=schemas.PublicFormResponse)
def get_public_form(share_id: str, request: Request, db: Session = Depends(get_db)):
    f = crud.get_form_by_share_id(db, share_id)
    if not f:
        raise HTTPException(status_code=404, detail="Public form not found or has been removed.")
    return f


@router.post("/forms/{share_id}/responses")
@limiter.limit("10/minute")
def submit_public_response(share_id: str, resp_in: schemas.ResponseSubmit, request: Request, db: Session = Depends(get_db)):
    try:
        return crud.submit_response(db, share_id, resp_in)
    except ValueError as err:
        raise HTTPException(status_code=400, detail=str(err))
    except Exception as err:
        raise HTTPException(status_code=500, detail="Submission failed. Please try again.")