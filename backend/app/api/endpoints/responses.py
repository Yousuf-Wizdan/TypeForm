from typing import List
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
import app.schemas as schemas
import app.crud as crud

router = APIRouter(prefix="/forms", tags=["Responses & Analytics"])


@router.get("/{form_id}/responses", response_model=List[schemas.ResponseDetail])
def list_form_responses(form_id: str, db: Session = Depends(get_db)):
    return crud.get_responses(db, form_id)


@router.get("/{form_id}/responses/summary", response_model=schemas.FormSummaryResponse)
def get_form_summary_analytics(form_id: str, db: Session = Depends(get_db)):
    try:
        return crud.get_form_summary(db, form_id)
    except ValueError as err:
        raise HTTPException(status_code=404, detail=str(err))


@router.get("/{form_id}/responses/export")
def export_csv(form_id: str, db: Session = Depends(get_db)):
    try:
        csv_data = crud.export_responses_csv(db, form_id)
        return PlainTextResponse(
            content=csv_data,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=form_{form_id}_responses.csv"}
        )
    except ValueError as err:
        raise HTTPException(status_code=404, detail=str(err))