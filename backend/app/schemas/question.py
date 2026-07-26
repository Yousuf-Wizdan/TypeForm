from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class QuestionBase(BaseModel):
    title: str = "Untitled Question"
    description: Optional[str] = ""
    type: str
    required: bool = False
    order_index: int = 0
    properties: Optional[Dict[str, Any]] = Field(default_factory=dict)
    logic: Optional[List[Dict[str, Any]]] = Field(default_factory=list)

class QuestionCreate(QuestionBase):
    form_id: Optional[str] = None

class QuestionUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    type: Optional[str] = None
    required: Optional[bool] = None
    order_index: Optional[int] = None
    properties: Optional[Dict[str, Any]] = None
    logic: Optional[List[Dict[str, Any]]] = None

class QuestionResponse(QuestionBase):
    id: str
    form_id: str
    created_at: datetime

    class Config:
        from_attributes = True
