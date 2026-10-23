from dataclasses import dataclass
from datetime import datetime, timezone

@dataclass
class LeadDecision:
    stage: str
    score: int
    needs_quote: bool
    owner_action: str

def qualify_lead(message: str, context: dict | None = None) -> LeadDecision:
    text = f"{message} {context or {}}".lower()
    commercial = any(x in text for x in ["سعر", "عرض", "ميزانية", "شراء", "شركة", "مشروع", "quote", "price", "budget"])
    urgent = any(x in text for x in ["اليوم", "عاجل", "هذا الأسبوع", "urgent", "this week"])
    if urgent and commercial:
        return LeadDecision("hot", 90, True, "notify_owner_now")
    if commercial:
        return LeadDecision("warm", 65, True, "prepare_quote")
    return LeadDecision("nurture", 30, False, "continue_discovery")

def quote_request_payload(lead: dict, requirements: dict) -> dict:
    return {"created_at": datetime.now(timezone.utc).isoformat(), "lead": lead, "requirements": requirements, "status": "awaiting_owner_quote", "owner_channel": "whatsapp"}
