from datetime import datetime, timezone


def score_lead(data: dict) -> int:
    score = 0
    if data.get("company"): score += 20
    if data.get("email"): score += 15
    if data.get("phone"): score += 10
    if data.get("budget"): score += 15
    if data.get("timeline"): score += 15
    if data.get("need"): score += 15
    if data.get("decision_role"): score += 10
    return min(score, 100)


def stage_for(score: int) -> str:
    if score >= 75: return "hot"
    if score >= 45: return "warm"
    return "nurture"


def make_lead(data: dict) -> dict:
    score = score_lead(data)
    return {**data, "score": score, "stage": stage_for(score), "created_at": datetime.now(timezone.utc).isoformat()}
