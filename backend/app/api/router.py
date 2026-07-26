from fastapi import APIRouter
from app.api.endpoints import forms, questions, public, responses

api_router = APIRouter(prefix="/api")

api_router.include_router(forms.router)
api_router.include_router(questions.router)
api_router.include_router(public.router)
api_router.include_router(responses.router)
