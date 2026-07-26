import json
from datetime import datetime, timedelta
import random
from app.core.database import SessionLocal
from app.models import Form, Question, Response, Answer, generate_uuid, generate_short_id

def seed_database(force: bool = False, creator_id: str = "default_creator"):
    existing_count = 0
    temp_db = SessionLocal()
    try:
        existing_count = temp_db.query(Form).filter(Form.creator_id == creator_id).count()
    finally:
        temp_db.close()

    if existing_count > 0:
        if not force:
            return False
        db = SessionLocal()
        try:
            user_forms = db.query(Form).filter(Form.creator_id == creator_id).all()
            for f in user_forms:
                db.delete(f)
            db.commit()
        finally:
            db.close()

    db = SessionLocal()
    try:
        # --- FORM 1: Product Feedback & CSAT Survey ---
        form1_id = generate_uuid()
        form1_share_id = generate_short_id()
        
        f1 = Form(
            id=form1_id,
            creator_id=creator_id,
            title="Product Feedback & Customer Experience Survey",
            description="Help us shape the future of our product with your valued insights.",
            status="published",
            share_id=form1_share_id,
            theme=json.dumps({
                "primary_color": "#0284c7",
                "background_color": "#ffffff",
                "text_color": "#0f172a",
                "accent_color": "#0284c7",
                "font_family": "Inter",
                "preset": "light"
            }),
            thank_you_screen=json.dumps({
                "title": "Thank you for your valuable feedback! 🎉",
                "description": "We appreciate your time. Check your email for a special 20% discount code.",
                "button_text": "Back to Home",
                "redirect_url": ""
            })
        )
        db.add(f1)

        q1_1_id = generate_uuid()
        q1_2_id = generate_uuid()
        q1_3_id = generate_uuid()
        q1_4_id = generate_uuid()
        q1_5_id = generate_uuid()
        q1_6_id = generate_uuid()

        questions_f1 = [
            Question(
                id=q1_1_id,
                form_id=form1_id,
                type="short_text",
                title="What is your full name?",
                description="We like to know who we're talking to!",
                required=True,
                order_index=0,
                properties=json.dumps({"placeholder": "e.g. Sarah Jenkins"})
            ),
            Question(
                id=q1_2_id,
                form_id=form1_id,
                type="rating",
                title="How would you rate your overall experience with our platform?",
                description="1 being poor, 5 being absolutely stellar!",
                required=True,
                order_index=1,
                properties=json.dumps({"rating_scale": 5})
            ),
            Question(
                id=q1_3_id,
                form_id=form1_id,
                type="multiple_choice",
                title="Which feature do you use most frequently?",
                description="Select the one that brings you the most value.",
                required=True,
                order_index=2,
                properties=json.dumps({
                    "options": ["Drag-and-Drop Builder", "1-Question Respondent Flow", "Analytics & CSV Export", "Integrations"]
                })
            ),
            Question(
                id=q1_4_id,
                form_id=form1_id,
                type="yes_no",
                title="Would you recommend our platform to a colleague or friend?",
                description="Your referral means the world to us.",
                required=True,
                order_index=3,
                properties=json.dumps({}),
                logic=json.dumps([
                    {
                        "condition": "equals",
                        "value": "Yes",
                        "destination_question_id": q1_5_id
                    },
                    {
                        "condition": "equals",
                        "value": "No",
                        "destination_question_id": q1_6_id
                    }
                ])
            ),
            Question(
                id=q1_5_id,
                form_id=form1_id,
                type="long_text",
                title="Awesome! What's the main reason you'd recommend us?",
                description="Feel free to share any specific highlight.",
                required=False,
                order_index=4,
                properties=json.dumps({"placeholder": "I love the sleek animations and intuitive builder..."})
            ),
            Question(
                id=q1_6_id,
                form_id=form1_id,
                type="email",
                title="What email should we send your summary report to?",
                description="We respect your privacy and won't spam.",
                required=True,
                order_index=5,
                properties=json.dumps({"placeholder": "sarah@company.com"})
            )
        ]
        db.add_all(questions_f1)
        db.commit()

        sample_names = ["Alex Rivera", "David Chen", "Emily Watson", "Michael Brown", "Sophia Martinez", "James Wilson", "Olivia Taylor", "Daniel Lee", "Emma Harris", "William Clark"]
        sample_features = ["Drag-and-Drop Builder", "1-Question Respondent Flow", "Analytics & CSV Export", "Integrations"]
        sample_feedback = [
            "The 1-question-at-a-time flow completely boosted our survey completion rates by 40%!",
            "Super clean UI and very responsive keyboard navigation. Feels just like native Typeform.",
            "Fast, smooth, and very intuitive for non-tech users.",
            "Great analytics view and easy CSV export for our product team."
        ]

        for i in range(12):
            sub_date = datetime.utcnow() - timedelta(hours=random.randint(1, 120), minutes=random.randint(1, 59))
            
            resp = Response(
                form_id=form1_id,
                completion_time_seconds=random.randint(25, 95),
                status="completed",
                submitted_at=sub_date
            )
            db.add(resp)
            db.commit()
            db.refresh(resp)

            name = sample_names[i % len(sample_names)]
            rating = random.choice([4, 5, 5, 4, 3, 5])
            feat = random.choice(sample_features)
            recom = "Yes" if rating >= 4 else "No"
            email = f"{name.lower().replace(' ', '.')}@example.com"

            db.add_all([
                Answer(response_id=resp.id, question_id=q1_1_id, answer_value=name),
                Answer(response_id=resp.id, question_id=q1_2_id, answer_value=json.dumps(rating)),
                Answer(response_id=resp.id, question_id=q1_3_id, answer_value=feat),
                Answer(response_id=resp.id, question_id=q1_4_id, answer_value=recom),
                Answer(response_id=resp.id, question_id=q1_5_id, answer_value=random.choice(sample_feedback)),
                Answer(response_id=resp.id, question_id=q1_6_id, answer_value=email),
            ])
            db.commit()

        # --- FORM 2: Tech Summit 2026 Registration ---
        form2_id = generate_uuid()
        form2_share_id = generate_short_id()

        f2 = Form(
            id=form2_id,
            creator_id=creator_id,
            title="Tech Summit 2026 Registration",
            description="Reserve your spot for the premier software engineering conference.",
            status="published",
            share_id=form2_share_id,
            theme=json.dumps({
                "primary_color": "#7c3aed",
                "background_color": "#0f172a",
                "text_color": "#f8fafc",
                "accent_color": "#a855f7",
                "font_family": "Outfit",
                "preset": "dark"
            }),
            thank_you_screen=json.dumps({
                "title": "You're registered for Tech Summit 2026! 🚀",
                "description": "Check your inbox for calendar invites and venue directions.",
                "button_text": "View Conference Agenda",
                "redirect_url": ""
            })
        )
        db.add(f2)

        q2_1 = Question(form_id=form2_id, type="short_text", title="What is your full name?", description="For your conference pass badge", required=True, order_index=0, properties=json.dumps({"placeholder": "Alex Johnson"}))
        q2_2 = Question(form_id=form2_id, type="email", title="What is your work email?", description="Where we send pass confirmation", required=True, order_index=1, properties=json.dumps({"placeholder": "alex@techcorp.io"}))
        q2_3 = Question(form_id=form2_id, type="multiple_choice", title="Which keynote track interests you most?", description="", required=True, order_index=2, properties=json.dumps({"options": ["AI & Generative Agents", "Frontend Architecture at Scale", "Distributed Systems & Cloud", "Design Systems & UX"]}))
        q2_4 = Question(form_id=form2_id, type="dropdown", title="Select your T-Shirt Size", description="Complimentary conference swag pack!", required=True, order_index=3, properties=json.dumps({"options": ["Small", "Medium", "Large", "XL", "XXL"]}))
        q2_5 = Question(form_id=form2_id, type="yes_no", title="Will you attend the VIP Afterparty?", description="Free drinks and networking", required=False, order_index=4, properties=json.dumps({}))

        db.add_all([q2_1, q2_2, q2_3, q2_4, q2_5])
        db.commit()

        for j in range(8):
            resp2 = Response(
                form_id=form2_id,
                completion_time_seconds=random.randint(30, 80),
                status="completed",
                submitted_at=datetime.utcnow() - timedelta(hours=j * 6)
            )
            db.add(resp2)
            db.commit()
            db.refresh(resp2)

            name = sample_names[j]
            email = f"{name.lower().replace(' ', '')}@dev.org"
            track = random.choice(["AI & Generative Agents", "Frontend Architecture at Scale", "Distributed Systems & Cloud"])
            size = random.choice(["Medium", "Large", "XL"])
            vip = random.choice(["Yes", "No"])

            db.add_all([
                Answer(response_id=resp2.id, question_id=q2_1.id, answer_value=name),
                Answer(response_id=resp2.id, question_id=q2_2.id, answer_value=email),
                Answer(response_id=resp2.id, question_id=q2_3.id, answer_value=track),
                Answer(response_id=resp2.id, question_id=q2_4.id, answer_value=size),
                Answer(response_id=resp2.id, question_id=q2_5.id, answer_value=vip),
            ])
            db.commit()

        # --- FORM 3: Employee Onboarding Check-in (Draft) ---
        form3_id = generate_uuid()
        f3 = Form(
            id=form3_id,
            creator_id=creator_id,
            title="Employee Week 1 Onboarding Pulse Check",
            description="Let us know how your first week at the team has been going.",
            status="draft",
            share_id=generate_short_id(),
            theme=json.dumps({"primary_color": "#16a34a", "background_color": "#ffffff", "text_color": "#18181b", "accent_color": "#22c55e", "font_family": "Inter", "preset": "light"}),
            thank_you_screen=json.dumps({"title": "Thanks for checking in!", "description": "Your manager will follow up with you shortly.", "button_text": "Done", "redirect_url": ""})
        )
        db.add(f3)

        q3_1 = Question(form_id=form3_id, type="short_text", title="Your Name & Department", description="", required=True, order_index=0, properties=json.dumps({}))
        q3_2 = Question(form_id=form3_id, type="rating", title="How smooth was your laptop & access setup?", description="1 = total nightmare, 5 = effortless", required=True, order_index=1, properties=json.dumps({"rating_scale": 5}))
        q3_3 = Question(form_id=form3_id, type="long_text", title="Is there anything currently blocking you?", description="", required=False, order_index=2, properties=json.dumps({}))

        db.add_all([q3_1, q3_2, q3_3])
        db.commit()

        print("Successfully seeded SQLite database with 3 sample forms and 20 total responses!")
        return True

    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
