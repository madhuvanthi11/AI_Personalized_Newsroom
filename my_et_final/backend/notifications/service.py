"""Notification Service — My ET"""
from typing import Dict, List
from datetime import datetime
from database.db import Database

# Live breaking alerts for all 8 roles
LIVE_ALERTS = [
    {"id":"alert001","alert_message":"RBI raises repo rate by 25bps to 6.75% — banking stocks react sharply","impact_level":"high","category":"policy","icon":"🔴","affected_roles":["investor","policy_analyst","founder","student","entrepreneur"],"timestamp":datetime.utcnow().isoformat(),"is_active":True,"time":"2 min ago"},
    {"id":"alert002","alert_message":"Sensex drops 800 points on US Fed rate uncertainty","impact_level":"high","category":"markets","icon":"📉","affected_roles":["investor"],"timestamp":datetime.utcnow().isoformat(),"is_active":True,"time":"5 min ago"},
    {"id":"alert003","alert_message":"Zepto raises $350M Series F at $5B valuation, targets IPO 2026","impact_level":"medium","category":"startup","icon":"🚀","affected_roles":["founder","investor"],"timestamp":datetime.utcnow().isoformat(),"is_active":True,"time":"12 min ago"},
    {"id":"alert004","alert_message":"India GDP revised to 7.4% — beats IMF forecast by 60bps","impact_level":"high","category":"policy","icon":"🌍","affected_roles":["investor","policy_analyst","student","entrepreneur"],"timestamp":datetime.utcnow().isoformat(),"is_active":True,"time":"18 min ago"},
    {"id":"alert005","alert_message":"IPL 2025 media rights cross ₹48,000 crore — new record","impact_level":"high","category":"sports","icon":"🏏","affected_roles":["sportsperson","investor","entrepreneur"],"timestamp":datetime.utcnow().isoformat(),"is_active":True,"time":"25 min ago"},
    {"id":"alert006","alert_message":"Pathaan 2 crosses ₹500 crore globally in opening weekend","impact_level":"medium","category":"entertainment","icon":"🎬","affected_roles":["cinema_enthusiast","investor"],"timestamp":datetime.utcnow().isoformat(),"is_active":True,"time":"1h ago"},
    {"id":"alert007","alert_message":"Indian author wins Man Booker Prize 2025","impact_level":"medium","category":"literature","icon":"📖","affected_roles":["literature_enthusiast"],"timestamp":datetime.utcnow().isoformat(),"is_active":True,"time":"2h ago"},
    {"id":"alert008","alert_message":"GST simplified for MSMEs: quarterly filing replaces monthly","impact_level":"high","category":"policy","icon":"⚙️","affected_roles":["entrepreneur","founder","policy_analyst"],"timestamp":datetime.utcnow().isoformat(),"is_active":True,"time":"3h ago"},
]


class NotificationService:
    def __init__(self):
        self.db = Database()
        self.dismissed: Dict[str, set] = {}
        self.live_alerts = LIVE_ALERTS

    async def get_active_alerts(self, role: str) -> List[Dict]:
        return [a for a in self.live_alerts if role in a.get("affected_roles",[])]

    async def get_alerts_for_user(self, user_id: str, role: str) -> List[Dict]:
        dismissed = self.dismissed.get(user_id, set())
        return [a for a in await self.get_active_alerts(role) if a["id"] not in dismissed]

    async def get_breaking_news(self) -> List[Dict]:
        return self.live_alerts

    async def dismiss_alert(self, user_id: str, alert_id: str):
        self.dismissed.setdefault(user_id, set()).add(alert_id)

    async def add_live_alert(self, alert: Dict):
        self.live_alerts.insert(0, alert)
        if len(self.live_alerts) > 20:
            self.live_alerts = self.live_alerts[:20]
