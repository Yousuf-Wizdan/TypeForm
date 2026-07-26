import io
import csv
import re
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.form import Form
from app.models.question import Question
from app.models.response import Response, Answer
import app.schemas as schemas
from app.crud.form import parse_json_field, dump_json_field

def submit_response(db: Session, share_id: str, resp_in: schemas.ResponseSubmit) -> Dict[str, Any]:
    f = db.query(Form).filter(Form.share_id == share_id).first()
    if not f:
        raise ValueError("Form not found")

    questions = db.query(Question).filter(Question.form_id == f.id).all()
    q_map = {q.id: q for q in questions}

    answer_dict = {a.question_id: a.answer_value for a in resp_in.answers}

    for q in questions:
        val = answer_dict.get(q.id)
        if q.required:
            if val is None or val == "" or (isinstance(val, list) and len(val) == 0):
                raise ValueError(f"Question '{q.title}' is required.")

        if val is not None and val != "":
            props = parse_json_field(q.properties, {})
            if q.type == "email":
                email_regex = r"^[^\s@]+@[^\s@]+\.[^\s@]+$"
                if not re.match(email_regex, str(val)):
                    raise ValueError(f"'{q.title}' requires a valid email address.")
            elif q.type == "number":
                try:
                    num = float(val)
                    min_v = props.get("min_value")
                    max_v = props.get("max_value")
                    if min_v is not None and num < min_v:
                        raise ValueError(f"'{q.title}' must be at least {min_v}.")
                    if max_v is not None and num > max_v:
                        raise ValueError(f"'{q.title}' must be at most {max_v}.")
                except (ValueError, TypeError):
                    raise ValueError(f"'{q.title}' requires a valid number.")
            elif q.type == "rating":
                try:
                    rating = int(val)
                    max_scale = int(props.get("rating_scale", 5))
                    if rating < 1 or rating > max_scale:
                        raise ValueError(f"'{q.title}' rating must be between 1 and {max_scale}.")
                except (ValueError, TypeError):
                    raise ValueError(f"'{q.title}' requires a valid rating value.")

    new_response = Response(
        form_id=f.id,
        completion_time_seconds=resp_in.completion_time_seconds or 0,
        status="completed"
    )
    db.add(new_response)
    db.commit()
    db.refresh(new_response)

    for a in resp_in.answers:
        if a.question_id in q_map:
            val_str = dump_json_field(a.answer_value) if not isinstance(a.answer_value, str) else a.answer_value
            ans_record = Answer(
                response_id=new_response.id,
                question_id=a.question_id,
                answer_value=val_str
            )
            db.add(ans_record)

    db.commit()
    return {
        "success": True,
        "response_id": new_response.id,
        "thank_you_screen": parse_json_field(f.thank_you_screen, {})
    }

def get_responses(db: Session, form_id: str) -> List[schemas.ResponseDetail]:
    responses = db.query(Response).filter(Response.form_id == form_id).order_by(Response.submitted_at.desc()).all()
    result = []

    for r in responses:
        answers = db.query(Answer).filter(Answer.response_id == r.id).all()
        a_details = []
        for a in answers:
            q = db.query(Question).filter(Question.id == a.question_id).first()
            val = parse_json_field(a.answer_value, a.answer_value)
            a_details.append(schemas.AnswerDetail(
                id=a.id,
                question_id=a.question_id,
                question_title=q.title if q else "Deleted Question",
                question_type=q.type if q else "unknown",
                answer_value=val
            ))

        result.append(schemas.ResponseDetail(
            id=r.id,
            submitted_at=r.submitted_at,
            completion_time_seconds=r.completion_time_seconds,
            status=r.status,
            answers=a_details
        ))

    return result

def get_form_summary(db: Session, form_id: str) -> schemas.FormSummaryResponse:
    f = db.query(Form).filter(Form.id == form_id).first()
    if not f:
        raise ValueError("Form not found")

    responses = db.query(Response).filter(Response.form_id == form_id).all()
    total_responses = len(responses)
    completed_count = sum(1 for r in responses if r.status == "completed")
    partial_count = total_responses - completed_count

    avg_time = 0.0
    if total_responses > 0:
        avg_time = sum(r.completion_time_seconds for r in responses) / float(total_responses)

    questions = db.query(Question).filter(Question.form_id == form_id).order_by(Question.order_index).all()
    q_summaries = []

    for q in questions:
        answers = db.query(Answer).filter(Answer.question_id == q.id).all()
        ans_values = [parse_json_field(a.answer_value, a.answer_value) for a in answers if a.answer_value is not None]
        
        breakdown = {}
        recent_texts = []
        rating_sum = 0
        rating_count = 0

        for val in ans_values:
            if isinstance(val, list):
                for item in val:
                    key = str(item)
                    breakdown[key] = breakdown.get(key, 0) + 1
            elif q.type in ["multiple_choice", "dropdown", "yes_no"]:
                key = str(val)
                breakdown[key] = breakdown.get(key, 0) + 1
            elif q.type == "rating":
                try:
                    num_val = float(val)
                    rating_sum += num_val
                    rating_count += 1
                    key = str(int(num_val))
                    breakdown[key] = breakdown.get(key, 0) + 1
                except (ValueError, TypeError):
                    pass
            elif q.type in ["short_text", "long_text", "email", "number"]:
                if str(val).strip():
                    recent_texts.append(str(val))

        avg_rating = (rating_sum / float(rating_count)) if rating_count > 0 else None

        q_summaries.append(schemas.QuestionSummary(
            question_id=q.id,
            question_title=q.title,
            question_type=q.type,
            total_answers=len(ans_values),
            breakdown=breakdown,
            average_rating=avg_rating,
            recent_text_answers=recent_texts[:10]
        ))

    return schemas.FormSummaryResponse(
        form_id=f.id,
        form_title=f.title,
        total_responses=total_responses,
        completion_rate=round((completed_count / float(total_responses)) * 100, 1) if total_responses > 0 else 0.0,
        average_time_seconds=round(avg_time, 1),
        question_summaries=q_summaries
    )

def export_responses_csv(db: Session, form_id: str) -> str:
    f = db.query(Form).filter(Form.id == form_id).first()
    if not f:
        raise ValueError("Form not found")

    questions = db.query(Question).filter(Question.form_id == form_id).order_by(Question.order_index).all()
    responses = db.query(Response).filter(Response.form_id == form_id).order_by(Response.submitted_at.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)

    headers = ["Response ID", "Submitted At", "Time (seconds)"] + [q.title for q in questions]
    writer.writerow(headers)

    for r in responses:
        r_answers = db.query(Answer).filter(Answer.response_id == r.id).all()
        a_map = {a.question_id: parse_json_field(a.answer_value, a.answer_value) for a in r_answers}

        row = [r.id, r.submitted_at.strftime("%Y-%m-%d %H:%M:%S"), r.completion_time_seconds]
        for q in questions:
            val = a_map.get(q.id, "")
            if isinstance(val, list):
                val_str = ", ".join(map(str, val))
            elif val is None:
                val_str = ""
            else:
                val_str = str(val)
            row.append(val_str)
        writer.writerow(row)

    return output.getvalue()
