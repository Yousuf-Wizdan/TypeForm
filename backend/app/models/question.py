import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Boolean, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Question(Base):
    __tablename__ = "questions"

    id = Column(String, primary_key=True, default=generate_uuid)
    form_id = Column(String, ForeignKey("forms.id", ondelete="CASCADE"), nullable=False)
    type = Column(String, nullable=False)
    title = Column(String, nullable=False, default="Untitled Question")
    description = Column(Text, nullable=True, default="")
    required = Column(Boolean, default=False)
    order_index = Column(Integer, default=0, index=True)
    properties = Column(Text, nullable=True, default='{}')
    logic = Column(Text, nullable=True, default='[]')
    created_at = Column(DateTime, default=datetime.utcnow)

    form = relationship("Form", back_populates="questions")
    answers = relationship("Answer", back_populates="question", cascade="all, delete-orphan")
