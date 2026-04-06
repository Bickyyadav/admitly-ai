from fastapi import APIRouter, HTTPException, Query
from app.services.user_details_service import get_user_full_details, get_all_users_with_call_details, get_all_users_bulk_export
from app.services.stats_service import get_quality_score_stats_by_date

router = APIRouter()

@router.get("/users/details")
async def export_all_users():
    """
    Retrieve all users in bulk with specific fields.
    """
    users = await get_all_users_bulk_export()
    return {"users": users}

@router.get("/users/{user_id}")
async def get_user_details(user_id: str):
    """
    Retrieve all details of a user by their ID, including their basic
    information and their entire call history with analysis.
    """
    user_details = await get_user_full_details(user_id)
    if not user_details:
        raise HTTPException(status_code=404, detail="User not found")
        
    return user_details

@router.get("/users")
async def get_all_users():
    """
    Retrieve all users combined with their most recent call details
    for UI table display.
    """
    users = await get_all_users_with_call_details()
    return {"users": users}

    

@router.get("/quality-score-stats")
async def get_quality_score_stats(date: str = Query(..., description="Date in YYYY-MM-DD format")):
    """
    Returns the total count of quality scores by category for a specific date:
    0-30, 31-60, 61-80, 81-90, 91-100.
    """
    try:
        stats = await get_quality_score_stats_by_date(date)
        return {"date": date, "category_totals": stats}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
