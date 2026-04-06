from fastapi import APIRouter, File, UploadFile, HTTPException
from app.services.user_service import handle_excel_upload, get_dummy_users

router = APIRouter()

@router.post("/upload")
async def upload_excel(file: UploadFile = File(...)):
    try:
        return await handle_excel_upload(file)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process file: {str(e)}")
