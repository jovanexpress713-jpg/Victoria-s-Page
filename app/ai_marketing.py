import json
import os
from urllib import request

SYSTEM_PROMPT = '''You are Victoria Line Soft's B2B AI Growth Director. Speak naturally in Arabic unless the visitor uses English. Understand the visitor's business and real problem, qualify the opportunity, recommend only services the company can actually provide, and guide the visitor toward a clear commercial request. Never invent prices, clients, results, integrations, timelines, or capabilities. Never claim that a quote has been approved. Pricing is controlled by the human owner. Ask one useful question at a time. When enough information is available, capture contact and commercial details without becoming repetitive. Be concise, warm, professional and consultative.'''


def build_prompt(message: str, context: dict | None = None) -> str:
    context = context or {}
    return f"{SYSTEM_PROMPT}\n\nVisitor context:\n{json.dumps(context, ensure_ascii=False)}\n\nVisitor message:\n{message}\n\nReturn ONLY valid JSON with keys: intent, qualification, reply, next_step, lead_score, follow_up_question, lead. lead_score must be an integer 0-100. lead must be an object with keys name, company, email, phone, need, budget, timeline, decision_role. Use empty strings for unknown lead fields."


def _fallback(message: str, configured: bool = False) -> dict:
    return {'status':'AI_CONFIGURED' if configured else 'AI_UNAVAILABLE','intent':'lead','qualification':'needs_discovery','reply':'أهلاً بك. أريد أن أفهم احتياجك أولاً حتى أقترح حلاً مناسباً، وليس مجرد خدمة عامة. ما الهدف أو المشكلة التي تريد حلها؟','next_step':'discovery','lead_score':25,'follow_up_question':'ما الهدف التجاري الأهم لديك حالياً؟','lead':{}}


def _call_gemini(api_key: str, prompt: str) -> dict:
    model = os.getenv('GEMINI_MODEL','gemini-2.5-flash').strip()
    url = f'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}'
    payload = {'contents':[{'parts':[{'text':prompt}]}],'generationConfig':{'temperature':0.35,'responseMimeType':'application/json'}}
    req = request.Request(url,data=json.dumps(payload).encode('utf-8'),headers={'Content-Type':'application/json'},method='POST')
    with request.urlopen(req,timeout=25) as response: data=json.loads(response.read().decode('utf-8'))
    text=data['candidates'][0]['content']['parts'][0]['text']; result=json.loads(text)
    result['status']='AI_LIVE'; result['lead_score']=max(0,min(100,int(result.get('lead_score',0))))
    if not isinstance(result.get('lead'),dict): result['lead']={}
    return result


def generate_reply(message: str, context: dict | None = None) -> dict:
    api_key=os.getenv('GEMINI_API_KEY','').strip()
    if not api_key: return _fallback(message)
    try: return _call_gemini(api_key,build_prompt(message,context))
    except Exception:
        fallback=_fallback(message,configured=True); fallback['status']='AI_DEGRADED'; return fallback
