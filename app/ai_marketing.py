import json
import os
from urllib import request

SYSTEM_PROMPT = """أنت مساعد العملاء والمبيعات الرقمي التابع لشركة Victoria Line Soft. مهمتك أن تجعل الزائر يشعر أنه يتحدث مع موظف خدمة عملاء متمرس وودود: منصت، مرن، واضح، صبور، ويفهم كلام الناس الطبيعي. لا تتحدث كروبوت ولا تستخدم لغة رسمية متكلفة أو جُملاً محفوظة في كل رد.

اللغة والأسلوب:
- ابدأ باللغة التي يستخدمها الزائر. إذا كتب بالعربية، استخدم عربية طبيعية دافئة. إذا استخدم لهجة يمنية أو عامية، جاوبه بلهجة قريبة منها باحترام وبدون مبالغة أو تقليد مصطنع. وإذا اختار الفصحى أو أسلوباً رسمياً، التزم به.
- نوّع التحية والرد بحسب السياق. لا تكرر "أهلاً بك، كيف يمكنني مساعدتك" في كل مرة.
- استجب أولاً لما قاله العميل، ثم اسأل سؤالاً واحداً مفيداً فقط عندما تحتاج معلومة إضافية. لا تحوّل المحادثة إلى استبيان.
- كن متعاوناً ومطمئناً من غير مبالغة، ولا تستخدم الإيموجي إلا عند ملاءمته وباعتدال. افهم الأخطاء الإملائية والرسائل القصيرة والعبارات العامية.
- لا تدّع أنك إنسان حقيقي؛ أنت المساعد الرقمي للشركة، لكن تواصل بأسلوب بشري طبيعي.

الخدمات التي يمكن مناقشتها: تصميم وتطوير المواقع، المتاجر الإلكترونية، أنظمة إدارة الأعمال والعملاء والمبيعات، تطبيقات الويب، لوحات التحكم، تصميم تجربة المستخدم، مساعدو الذكاء الاصطناعي، والأتمتة. لا تعد بميزة أو تكامل أو نتيجة غير مؤكدة. لا تخترع أسماء عملاء أو مشاريع سابقة أو أسعاراً أو مواعيد تنفيذ أو نسب نجاح. السعر وموعد التسليم النهائي يحددهما فريق الشركة بعد فهم المتطلبات.
- إذا كان العميل غير واضح، ساعده بأمثلة بسيطة بدلاً من إحراجه. إذا كان لا يعرف التقنية، اشرح دون مصطلحات معقدة.
- لا تضغط على العميل لإعطاء رقم هاتفه. اطلب وسيلة التواصل فقط عندما يكون ذلك مفيداً للخطوة التالية.
- إذا سأل عن السعر، اشرح أن السعر يعتمد على نطاق العمل، ثم اسأله عن أهم متطلب أو اقترح جمع التفاصيل لإعداد عرض سعر. لا تخترع سعراً.
- إذا اشتكى أو بدا متضايقاً، اعترف بمشكلته واعتذر عن التجربة غير المريحة عند اللزوم، ثم اعرض خطوة عملية.
- كن موجزاً بما يكفي للمحادثة، لكن أعطِ تفاصيل مفيدة عندما يطلب العميل شرحاً.
- لا تقل إنك حفظت طلباً أو أرسلت عرضاً أو تواصلت مع الفريق إلا إذا كان النظام قد فعل ذلك فعلياً.

اكتشف الهدف التجاري للزائر تدريجياً، وقدّم اقتراحاً عملياً يناسب ما قاله. عندما تتوفر معلومات كافية، لخّص فهمك باختصار واقترح الخطوة التالية. أخرج النتيجة بصيغة JSON صحيحة فقط بالمفاتيح التالية: intent, qualification, reply, next_step, lead_score, follow_up_question, lead. يجب أن تكون lead كائناً يحتوي name, company, email, phone, need, budget, timeline, decision_role، واستخدم نصاً فارغاً للمعلومة غير المعروفة. lead_score عدد صحيح بين 0 و100. لا تضع أي نص خارج JSON."""

def build_prompt(message: str, context: dict | None = None) -> str:
    context = context or {}
    return (
        f"سياق المحادثة والمعلومات التي ذكرها الزائر سابقاً (قد تكون ناقصة):\n"
        f"{json.dumps(context, ensure_ascii=False)}\n\n"
        f"رسالة الزائر الحالية:\n{message}\n\n"
        "أجب عن الرسالة الحالية مباشرة وبأسلوب طبيعي متصل بالسياق. لا تعِد سؤالاً أجاب عنه الزائر بالفعل. "
        "أعد JSON فقط بالمفاتيح المحددة في تعليمات النظام، ولا تستنتج بيانات شخصية غير مذكورة."
    )

def _fallback(configured: bool = False, status: str | None = None) -> dict:
    return {
        "status": status or ("AI_CONFIGURED" if configured else "AI_UNAVAILABLE"),
        "intent": "discovery",
        "qualification": "needs_discovery",
        "reply": "حيّاك الله! خلّنا نبدأ من فكرتك نفسها، حتى لو لسه ما رتّبت التفاصيل. إيش أكثر شيء ودّك تطوّره أو تحلّه في شغلك؟",
        "next_step": "discovery",
        "lead_score": 20,
        "follow_up_question": "إيش أكثر شيء ودّك تطوّره أو تحلّه في شغلك؟",
        "lead": {}
    }

def _extract_json(text: str) -> dict:
    text = text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1] if "\n" in text else text
        if text.endswith("```"):
            text = text[:-3]
    return json.loads(text.strip())

def _call_openai(api_key: str, prompt: str) -> dict:
    model = os.getenv("OPENAI_MODEL", "gpt-4.1-mini").strip()
    url = "https://api.openai.com/v1/responses"
    payload = {
        "model": model,
        "input": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ]
    }
    req = request.Request(
        url,
        data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {api_key}"},
        method="POST"
    )
    with request.urlopen(req, timeout=30) as response:
        data = json.loads(response.read().decode("utf-8"))
    text = data.get("output_text", "").strip()
    if not text:
        for item in data.get("output", []):
            for part in item.get("content", []):
                if part.get("type") == "output_text" and part.get("text"):
                    text += part["text"]
    result = _extract_json(text)
    result["status"] = "AI_LIVE"
    result["lead_score"] = max(0, min(100, int(result.get("lead_score", 0))))
    if not isinstance(result.get("lead"), dict):
        result["lead"] = {}
    return result

def generate_reply(message: str, context: dict | None = None) -> dict:
    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    if not api_key:
        return _fallback()
    try:
        return _call_openai(api_key, build_prompt(message, context))
    except Exception:
        return _fallback(configured=True, status="AI_DEGRADED")
