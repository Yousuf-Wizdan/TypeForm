import json
from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.form import Form
from app.models.question import Question
import app.schemas as schemas
from app.crud.form import parse_json_field, dump_json_field

def create_question(db: Session, form_id: str, question_in: schemas.QuestionCreate) -> Optional[schemas.QuestionResponse]:
    f = db.query(Form).filter(Form.id == form_id).first()
    if not f:
        return None

    max_order = db.query(func.max(Question.order_index)).filter(Question.form_id == form_id).scalar()
    next_order = (max_order + 1) if max_order is not None else 0

    new_q = Question(
        form_id=form_id,
        type=question_in.type,
        title=question_in.title or "Untitled Question",
        description=question_in.description or "",
        required=question_in.required,
        order_index=next_order,
        properties=dump_json_field(question_in.properties or {}),
        logic=dump_json_field(question_in.logic or [])
    )
    db.add(new_q)
    f.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(new_q)

    return schemas.QuestionResponse(
        id=new_q.id,
        form_id=new_q.form_id,
        type=new_q.type,
        title=new_q.title,
        description=new_q.description or "",
        required=new_q.required,
        order_index=new_q.order_index,
        properties=parse_json_field(new_q.properties, {}),
        logic=parse_json_field(new_q.logic, []),
        created_at=new_q.created_at
    )

def update_question(db: Session, question_id: str, question_in: schemas.QuestionUpdate) -> Optional[schemas.QuestionResponse]:
    q = db.query(Question).filter(Question.id == question_id).first()
    if not q:
        return None

    if question_in.title is not None:
        q.title = question_in.title
    if question_in.description is not None:
        q.description = question_in.description
    if question_in.type is not None:
        q.type = question_in.type
    if question_in.required is not None:
        q.required = question_in.required
    if question_in.order_index is not None:
        q.order_index = question_in.order_index
    if question_in.properties is not None:
        q.properties = dump_json_field(question_in.properties)
    if question_in.logic is not None:
        q.logic = dump_json_field(question_in.logic)

    db.commit()
    db.refresh(q)

    return schemas.QuestionResponse(
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
    )

def delete_question(db: Session, question_id: str) -> bool:
    q = db.query(Question).filter(Question.id == question_id).first()
    if not q:
        return False
    form_id = q.form_id
    db.delete(q)
    db.commit()

    questions = db.query(Question).filter(Question.form_id == form_id).order_by(Question.order_index).all()
    for idx, question in enumerate(questions):
        question.order_index = idx
    db.commit()
    return True

def reorder_questions(db: Session, form_id: str, question_ids: List[str]) -> List[schemas.QuestionResponse]:
    for idx, q_id in enumerate(question_ids):
        db.query(Question).filter(Question.id == q_id, Question.form_id == form_id).update({"order_index": idx})
    db.commit()

    questions = db.query(Question).filter(Question.form_id == form_id).order_by(Question.order_index).all()
    return [
        schemas.QuestionResponse(
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
        ) for q in questions
    ]
