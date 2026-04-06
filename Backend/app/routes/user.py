from fastapi import APIRouter, HTTPException
from app.services.user_details_service import get_user_full_details, get_all_users_with_call_details

router = APIRouter()

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

    

