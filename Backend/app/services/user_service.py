import os
import shutil
import math
import pandas as pd
from fastapi import UploadFile
from app.models.user import User, Call, CallStatus
from vapi import Vapi
from prompt.system_prompt import get_prompt

# Initialize Vapi
vapi = Vapi(token=os.getenv("VAPI_API_KEY"))

async def process_excel_file(file: UploadFile):
    store_dir = "excel_store"
    os.makedirs(store_dir, exist_ok=True)
    file_path = os.path.join(store_dir, file.filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        # Load Excel file
        df = pd.read_excel(file_path)
        
        for _, row in df.iterrows():
            def get_val(col_name, default=""):
                for df_col in df.columns:
                    if str(df_col).strip().lower() == col_name.lower():
                        val = row[df_col]
                        if isinstance(val, float) and math.isnan(val):
                            return default
                        return str(val).strip()
                return default
            name = get_val("name", "Unknown")
            print(name)
            email = get_val("email", "unknown@example.com")
            print(email)
            phone_number = get_val("phone_number", get_val("phone_number", ""))
            print(phone_number)
            state = get_val("state", "Unknown")
            print(state)
            city = get_val("city", "Unknown")
            print(city)
            address = get_val("address", "Unknown")
            print(address)
            
            # Use a dummy phone number if none provided, or skip, let's keep it if valid.
            if not phone_number:
                continue
                
            # Create User
            new_user = User(
                name=name,
                email=email,
                phone_number=phone_number,
                state=state,
                city=city,
                address=address,
                selected_program=get_val("selected_program", "Unknown"),
                selected_course=get_val("selected_course", "Unknown"),
                specialization=get_val("specialization", "Unknown"),
            )
            await new_user.insert()
            
            # Start Call
            try:
                call = vapi.calls.create(
                    phone_number_id=os.getenv("VAPI_PHONE_NUMBER_ID"),
                    customer={"number": "+91"+phone_number},
                    assistant_id=os.getenv("VAPI_ASSISTANT_ID"),
                    assistant_overrides={
                        "firstMessage": f"hellow",
                        "server": {"url": os.getenv("VAPI_SERVER_WEBHOOK_URL")},
                        "model": {
                            "provider": "openai",
                            "model": "gpt-4o-mini",
                            "messages": [{"role": "system", "content": get_prompt(name)}],
                        },
                    },
                )
                
                # Extract the id from the returned Vapi response object/dict
                call_id = call.id if hasattr(call, 'id') else call.get('id') if isinstance(call, dict) else getattr(call, 'call_id', str(call))
                
                # Create Call Entry
                new_call = Call(
                    user_id=str(new_user.id),
                    call_sid=call_id,
                    status=CallStatus.QUEUED
                )
                await new_call.insert()
            except Exception as e:
                print(f"Failed to create call for {phone_number}: {str(e)}")
                # we could create a failed call record
                new_call = Call(
                    user_id=str(new_user.id),
                    call_sid="failed_creation",
                    status=CallStatus.FAILED,
                    failure_reason=str(e)
                )
                await new_call.insert()

    finally:
        # Delete excel file after saving data to the database
        if os.path.exists(file_path):
            os.remove(file_path)

def get_dummy_users():
    return [{"name": "Vicky"}]

async def handle_excel_upload(file: UploadFile):
    if not file.filename.endswith(('.xls', '.xlsx')):
        raise ValueError("Only Excel files are allowed")
    
    await process_excel_file(file)
    return {"message": "File uploaded, users saved, calls initiated, and file deleted successfully"}

