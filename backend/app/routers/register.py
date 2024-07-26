from fastapi import APIRouter
from fastapi.responses import JSONResponse
import os

router = APIRouter()

PRESET_PIC_DIR = os.path.join(os.path.dirname(__file__), "../static/profile_pics/preset")

@router.get("/preset_pictures")
async def get_preset_pictures():
    try:
        files = os.listdir(PRESET_PIC_DIR)
        picture_urls = [f"/static/profile_pics/preset/{file}" for file in files]
        return JSONResponse(content={"pictures": picture_urls})
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)
