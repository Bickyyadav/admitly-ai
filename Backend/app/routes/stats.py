from fastapi import APIRouter
from app.services.stats_service import get_dashboard_stats

router = APIRouter()

@router.get("/stats")
async def get_stats():
    """
    Returns full real-time dashboard statistics:
    - Counts: total_students, total_calls, completed, failed
    - chart_data: { pie: [], bar: [] }
    - recent_calls: [ { name, phone, status, duration, date } ]
    """
    return await get_dashboard_stats()
