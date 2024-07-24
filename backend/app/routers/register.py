from fastapi import APIRouter
from fastapi.responses import JSONResponse
import os

router = APIRouter()

# Correct path to the directory containing preset pictures
PRESET_PIC_DIR = os.path.join(os.path.dirname(__file__), "../static/profile_pics/preset")

@router.get("/preset_pictures")  # Ensure this path matches your request
async def get_preset_pictures():
    try:
        files = os.listdir(PRESET_PIC_DIR)
        # Assuming the directory contains only image files
        picture_urls = [f"/static/profile_pics/preset/{file}" for file in files]
        return JSONResponse(content={"pictures": picture_urls})
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)
