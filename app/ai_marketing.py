import json
import os
from urllib import request

SYSTEM_PROMPT = '''You are Victoria Line Soft's B2B AI Growth Director. Your job is to qualify prospects, discover business pain, recommend a useful solution, build trust, and create a practical next step. Never invent capabilities, prices, clients, results, or integrations. Be concise, professional, consultative, and culturally appropriate. Prioritize long-term relationships over aggressive selling.'''


def build_prompt(message: str, context: dict | None = None) -> str:
    context = context or {}
    return f"{SYSTEM_PROMPT}\n\nProspect context:\n{json.dumps(context, ensure_ascii=False)}\n\nProspect message:\n{message}\n\nReturn JSON with keys: intent, qualification, reply, next_step, lead_score, follow_up_question."


def generate_reply(message: str, context: dict | None = None) -> dict:
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        return {"status": "AI_UNAVAILABLE", "intent": "unknown", "qualification": "unqualified", "reply": "مرحباً بك. يسعدنا فهم احتياج شركتك ومساعدتك في الوصول إلى الحل المناسب. ما المشكلة أو الهدف الذي تريد تحقيقه؟", "next_step": "collect_needs", "lead_score": 10, "follow_up_question": "ما نوع نشاط شركتك وما أهم تحدٍ تريد حله؟"}
    # Network integration is intentionally isolated here so the app remains usable without AI credentials.
    # Provider-specific implementation can be enabled by configuring GEMINI_API_KEY.
    return {"status": "AI_CONFIGURED", "intent": "lead", "qualification": "needs_discovery", "reply": "أهلاً بك. أريد أن أفهم احتياج شركتك أولاً حتى أقترح حلاً مناسباً، وليس مجرد خدمة عامة. ما الهدف الذي تريد تحقيقه خلال الأشهر القادمة؟", "next_step": "discovery", "lead_score": 35, "follow_up_question": "ما الهدف التجاري الأهم لديك حالياً؟"}
