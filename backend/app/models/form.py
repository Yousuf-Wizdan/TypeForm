import uuid
import random
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

_WORDS = [
    "cool", "bold", "warm", "calm", "keen", "wise", "kind", "pure",
    "breeze", "stone", "flame", "storm", "dawn", "peak", "wave", "cloud",
    "leaf", "star", "moon", "lark", "pine", "fern", "dove", "hawk",
]

def generate_short_id():
    adj = random.choice(_WORDS[:8])
    noun = random.choice(_WORDS[8:])
    num = random.randint(10, 99)
    return f"{adj}-{noun}-{num}"

class Form(Base):
    __tablename__ = "forms"

    id = Column(String, primary_key=True, default=generate_uuid)
    creator_id = Column(String, default="default_creator", index=True)
    title = Column(String, nullable=False, default="Untitled Form")
    description = Column(Text, nullable=True, default="")
    status = Column(String, default="draft", index=True)  # draft | published
    share_id = Column(String, unique=True, index=True, default=generate_short_id)
    theme = Column(Text, nullable=True, default='{"primary_color": "#262626", "background_color": "#ffffff", "text_color": "#18181b", "accent_color": "#0284c7", "font_family": "Inter", "preset": "light"}')
    thank_you_screen = Column(Text, nullable=True, default='{"title": "Thank you for filling out this form!", "description": "Your response has been recorded successfully.", "button_text": "Create your own Typeform", "redirect_url": ""}')
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    questions = relationship("Question", back_populates="form", cascade="all, delete-orphan", order_by="Question.order_index")
    responses = relationship("Response", back_populates="form", cascade="all, delete-orphan")
