from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class AnswerSubmit(BaseModel):
    question_id: str
    answer_value: Any

class ResponseSubmit(BaseModel):
    completion_time_seconds: Optional[int] = 0
    answers: List[AnswerSubmit]

class AnswerDetail(BaseModel):
    id: str
    question_id: str
    question_title: str
    question_type: str
    answer_value: Any

class ResponseDetail(BaseModel):
    id: str
    submitted_at: datetime
    completion_time_seconds: int
    status: str
    answers: List[AnswerDetail]

    class Config:
        from_attributes = True

class QuestionSummary(BaseModel):
    question_id: str
    question_title: str
    question_type: str
    total_answers: int
    breakdown: Dict[str, int] = Field(default_factory=dict)
    average_rating: Optional[float] = None
    recent_text_answers: List[str] = Field(default_factory=list)

class FormSummaryResponse(BaseModel):
    form_id: str
    form_title: str
    total_responses: int
    completion_rate: float
    average_time_seconds: float
    question_summaries: List[QuestionSummary]
