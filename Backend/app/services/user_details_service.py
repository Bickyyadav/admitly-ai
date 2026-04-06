from app.models.user import User, Call, CallAnalysis
from bson import ObjectId
from bson.errors import InvalidId

async def get_user_full_details(user_id: str):
    """
    Get full details of a user by ID, including their information,
    call history, and analysis.
    """
    try:
        try:
            oid = ObjectId(user_id)
        except InvalidId:
            return None
            
        user = await User.get(oid)
        if not user:
            return None
            
        # Fetch all calls for this user
        calls = await Call.find(Call.user_id == user_id).to_list()
        
        call_history = []
        for call in calls:
            # Fetch analysis for the call using call_sid
            analysis = await CallAnalysis.find_one(CallAnalysis.call_id == call.call_sid)
            
            call_history.append({
                "call_info": call,
                "analysis": analysis
            })
            
        return {
            "user_info": user,
            "call_history": call_history
        }
    except Exception as e:
        print(f"Error fetching user details for {user_id}: {e}")
        return None

async def get_all_users_with_call_details():
    """
    Get a list of all users along with their most recent call's details for the table view.
    """
    try:
        users = await User.find().to_list()

        results = []
        for user in users:
            # fetch newest call for this user
            latest_call = await Call.find(Call.user_id == str(user.id)).sort(-Call.created_at).first_or_none()
            
            user_id = str(user.id)
            student_name = user.name
            phone_number = user.phone_number
            created_at = user.created_at
            
            status = "No Call"
            duration = "0s"
            retries = 0
            scheduled_time = None
            
            if latest_call:
                status = latest_call.status.value.title() if hasattr(latest_call.status, 'value') else str(latest_call.status).title()
                duration = f"{latest_call.duration}s" if latest_call.duration else "0s"
                retries = latest_call.retry_count
                scheduled_time = latest_call.scheduled_time
                created_at = latest_call.created_at  # Typically we want the call's creation/last updated time
                
            results.append({
                "user_id": user_id,
                "student_name": student_name,
                "phone_number": phone_number,
                "status": status,
                "duration": duration,
                "retries": retries,
                "scheduled_time": scheduled_time,
                "created_at": created_at
            })
            
        # Sort results by created_at descending (newest first)
        results.sort(key=lambda x: x["created_at"], reverse=True)
        return results
    except Exception as e:
        print(f"Error fetching all users with call details: {e}")
        return []




async def get_all_users_bulk_export():
    """
    Get a list of all users with specific fields for bulk export:
    Name, Phone Number, Email, City, Selected Course, Specialization, Created At
    """
    try:
        users = await User.find().to_list()
        results = []
        for user in users:
            results.append({
                "Name": user.name,
                "Phone Number": user.phone_number,
                "Email": user.email,
                "City": user.city,
                "Selected Course": user.selected_course,
                "Specialization": user.specialization,
                "Created At": user.created_at
            })
        return results
    except Exception as e:
        print(f"Error fetching bulk users: {e}")
        return []

#create here 
