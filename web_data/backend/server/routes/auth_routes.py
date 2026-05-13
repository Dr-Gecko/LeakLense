from fastapi import APIRouter, Request, Header, status
import functions.auth as auth
import functions.utils as utils

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register")
async def register(request: Request):
    try:
        return await auth.create_user(request)
    except Exception:
        return utils.format_response({"message": "Registration failed"},status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,reason="failed")

@router.post("/login")
async def login(request: Request):
    try:
        return await auth.login_user(request)
    except Exception:
        return utils.format_response(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,reason="failed")


@router.put("/user/edit")
async def edit_user(request: Request, api_key: str = Header(..., alias="API-KEY")):
    try:
        return await auth.update_user(api_key, request)
    except Exception:
        return utils.format_response(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            reason="failed"
        )


@router.delete("/user/delete")
async def delete_user(request: Request, api_key: str = Header(..., alias="API-KEY")):
    try:
        return await auth.delete_user(api_key, request)
    except Exception:
        return utils.format_response(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            reason="failed"
        )


@router.get("/users")
async def get_all_users(api_key: str = Header(..., alias="API-KEY")):
    try:
        return await auth.get_all_users(api_key)
    except Exception:
        return utils.format_response(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            reason="failed"
        )
