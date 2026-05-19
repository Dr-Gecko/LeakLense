import functions.auth as auth
import functions.helpers.utils as utils
from fastapi import APIRouter, Request, Header, status
from fastapi import APIRouter, Request, Header, status, UploadFile, File

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register")
async def routeRegister(request: Request):
    return await auth.createUser(request)

@router.post("/login")
async def routeLogin(request: Request):
    return await auth.loginUser(request)

@router.get("/list")
async def routeListPublicUsers(api_key: str = Header(..., alias="API-KEY")):
    return await auth.getUsersPublic(api_key)

@router.get("/info")
async def getUserInfo(api_key: str = Header(..., alias="API-KEY")):
    return await auth.getUserInfo(api_key)

@router.post("/update")
async def selfUpdate(request: Request,api_key: str = Header(..., alias="API-KEY")):
    return await auth.selfUpdate(api_key,request)


@router.post("/avatar")
async def updateAvatar(request: Request, api_key: str = Header(..., alias="API-KEY"),file: UploadFile = File(...)):
    try:
        return await auth.updateAvatar(request,api_key,file)
    except Exception:
        return utils.formatResponse(reason="Registration failed",status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

@router.put("edit")
async def routeEditUser(request: Request, api_key: str = Header(..., alias="API-KEY")):
    return await auth.updateUser(api_key,request)

@router.delete("/user/delete")
async def routeDeleteUser(request: Request, api_key: str = Header(..., alias="API-KEY")):
    return await auth.deleteUser(api_key, request)