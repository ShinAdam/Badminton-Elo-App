from fastapi import APIRouter


router = APIRouter()

@router.get("/test", response_model=dict[str, str])
async def test_route():
    return {"message": "Hello, world!"}
