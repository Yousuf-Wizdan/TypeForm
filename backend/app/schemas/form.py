from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime
from app.schemas.question import QuestionResponse

class FormBase(BaseModel):
    title: str = "Untitled Form"
    description: Optional[str] = ""

class FormCreate(FormBase):
    creator_id: Optional[str] = "default_creator"

class FormUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    theme: Optional[Dict[str, Any]] = None
    thank_you_screen: Optional[Dict[str, Any]] = None

class FormReorderQuestions(BaseModel):
    question_ids: List[str]

class FormResponse(FormBase):
    id: str
    creator_id: str
    status: str
    share_id: str
    theme: Dict[str, Any]
    thank_you_screen: Dict[str, Any]
    created_at: datetime
    updated_at: datetime
    questions: List[QuestionResponse] = Field(default_factory=list)
    response_count: int = 0

    class Config:
        from_attributes = True

class PublicFormResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = ""
    share_id: str
    theme: Dict[str, Any]
    thank_you_screen: Dict[str, Any]
    questions: List[QuestionResponse]

    class Config:
        from_attributes = True
