import json
from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.form import Form, generate_short_id, generate_uuid
from app.models.question import Question
from app.models.response import Response
import app.schemas as schemas

def parse_json_field(val: Optional[str], default: any) -> any:
    if not val:
        return default
    try:
        return json.loads(val)
    except Exception:
        return default

def dump_json_field(val: any) -> str:
    return json.dumps(val if val is not None else {})

def get_forms(db: Session, creator_id: str = "default_creator") -> List[schemas.FormResponse]:
    forms = db.query(Form).filter(Form.creator_id == creator_id).order_by(Form.updated_at.desc()).all()
    result = []
    for f in forms:
        questions = db.query(Question).filter(Question.form_id == f.id).order_by(Question.order_index).all()
        q_responses = []
        for q in questions:
            q_responses.append(schemas.QuestionResponse(
                id=q.id,
                form_id=q.form_id,
                type=q.type,
                title=q.title,
                description=q.description or "",
                required=q.required,
                order_index=q.order_index,
                properties=parse_json_field(q.properties, {}),
                logic=parse_json_field(q.logic, []),
                created_at=q.created_at
            ))

        resp_count = db.query(Response).filter(Response.form_id == f.id).count()

        result.append(schemas.FormResponse(
            id=f.id,
            creator_id=f.creator_id,
            title=f.title,
            description=f.description or "",
            status=f.status,
            share_id=f.share_id,
            theme=parse_json_field(f.theme, {}),
            thank_you_screen=parse_json_field(f.thank_you_screen, {}),
            created_at=f.created_at,
            updated_at=f.updated_at,
            questions=q_responses,
            response_count=resp_count
        ))
    return result

def create_form(db: Session, form_in: schemas.FormCreate) -> schemas.FormResponse:
    new_form = Form(
        title=form_in.title,
        description=form_in.description or "",
        creator_id=form_in.creator_id or "default_creator",
        status="draft",
        share_id=generate_short_id()
    )
    db.add(new_form)
    db.commit()
    db.refresh(new_form)

    # Create default first question
    default_question = Question(
        form_id=new_form.id,
        type="short_text",
        title="What is your full name?",
        description="Please introduce yourself",
        required=True,
        order_index=0,
        properties=dump_json_field({"placeholder": "Jane Doe"})
    )
    db.add(default_question)
    db.commit()

    return get_form(db, new_form.id)

def get_form(db: Session, form_id: str) -> Optional[schemas.FormResponse]:
    f = db.query(Form).filter(Form.id == form_id).first()
    if not f:
        return None
    
    questions = db.query(Question).filter(Question.form_id == f.id).order_by(Question.order_index).all()
    q_responses = []
    for q in questions:
        q_responses.append(schemas.QuestionResponse(
            id=q.id,
            form_id=q.form_id,
            type=q.type,
            title=q.title,
            description=q.description or "",
            required=q.required,
            order_index=q.order_index,
            properties=parse_json_field(q.properties, {}),
            logic=parse_json_field(q.logic, []),
            created_at=q.created_at
        ))

    resp_count = db.query(Response).filter(Response.form_id == f.id).count()

    return schemas.FormResponse(
        id=f.id,
        creator_id=f.creator_id,
        title=f.title,
        description=f.description or "",
        status=f.status,
        share_id=f.share_id,
        theme=parse_json_field(f.theme, {}),
        thank_you_screen=parse_json_field(f.thank_you_screen, {}),
        created_at=f.created_at,
        updated_at=f.updated_at,
        questions=q_responses,
        response_count=resp_count
    )

def get_form_by_share_id(db: Session, share_id: str) -> Optional[schemas.PublicFormResponse]:
    f = db.query(Form).filter(Form.share_id == share_id, Form.status == "published").first()
    if not f:
        return None
    
    questions = db.query(Question).filter(Question.form_id == f.id).order_by(Question.order_index).all()
    q_responses = []
    for q in questions:
        q_responses.append(schemas.QuestionResponse(
            id=q.id,
            form_id=q.form_id,
            type=q.type,
            title=q.title,
            description=q.description or "",
            required=q.required,
            order_index=q.order_index,
            properties=parse_json_field(q.properties, {}),
            logic=parse_json_field(q.logic, []),
            created_at=q.created_at
        ))

    return schemas.PublicFormResponse(
        id=f.id,
        title=f.title,
        description=f.description or "",
        share_id=f.share_id,
        theme=parse_json_field(f.theme, {}),
        thank_you_screen=parse_json_field(f.thank_you_screen, {}),
        questions=q_responses
    )

def update_form(db: Session, form_id: str, form_in: schemas.FormUpdate) -> Optional[schemas.FormResponse]:
    f = db.query(Form).filter(Form.id == form_id).first()
    if not f:
        return None

    if form_in.title is not None:
        f.title = form_in.title
    if form_in.description is not None:
        f.description = form_in.description
    if form_in.status is not None:
        f.status = form_in.status
    if form_in.theme is not None:
        f.theme = dump_json_field(form_in.theme)
    if form_in.thank_you_screen is not None:
        f.thank_you_screen = dump_json_field(form_in.thank_you_screen)

    f.updated_at = datetime.utcnow()
    db.commit()
    return get_form(db, form_id)

def delete_form(db: Session, form_id: str) -> bool:
    f = db.query(Form).filter(Form.id == form_id).first()
    if not f:
        return False
    db.delete(f)
    db.commit()
    return True

def duplicate_form(db: Session, form_id: str) -> Optional[schemas.FormResponse]:
    orig_form = db.query(Form).filter(Form.id == form_id).first()
    if not orig_form:
        return None

    new_form = Form(
        title=f"{orig_form.title} (Copy)",
        description=orig_form.description,
        creator_id=orig_form.creator_id,
        status="draft",
        share_id=generate_short_id(),
        theme=orig_form.theme,
        thank_you_screen=orig_form.thank_you_screen
    )
    db.add(new_form)
    db.commit()
    db.refresh(new_form)

    questions = db.query(Question).filter(Question.form_id == form_id).order_by(Question.order_index).all()
    for q in questions:
        new_q = Question(
            id=generate_uuid(),
            form_id=new_form.id,
            type=q.type,
            title=q.title,
            description=q.description,
            required=q.required,
            order_index=q.order_index,
            properties=q.properties,
            logic=q.logic
        )
        db.add(new_q)
    
    db.commit()
    return get_form(db, new_form.id)

def toggle_publish_form(db: Session, form_id: str) -> Optional[schemas.FormResponse]:
    f = db.query(Form).filter(Form.id == form_id).first()
    if not f:
        return None
    f.status = "published" if f.status == "draft" else "draft"
    f.updated_at = datetime.utcnow()
    db.commit()
    return get_form(db, form_id)
