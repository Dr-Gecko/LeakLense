import os
from typing import Any
from dotenv import load_dotenv
from pydantic import BaseModel
from fastapi import status
from fastapi.responses import JSONResponse
from fastapi.openapi.utils import get_openapi
from datetime import datetime, date
from decimal import Decimal
load_dotenv()
allowedSelfEditColumns = {
    "email",
    "avatar",
    "password",
    "username"
}
allowedManagerEditColumns = {
    "email",
    "avatar",
    "last_login_ip",
    "password",
    "role"
}
rbac_reference = {
    "user":0,
    "contributer":1,
    "manager":2,
    "admin":3,
    "owner":4,
    "root":5
}
def formatResponse(data: Any = None, status_code: int = status.HTTP_200_OK, reason: str = "success"):
    return JSONResponse(
        status_code=status_code,
        content={
            "status": reason,
            "data": data if data is not None else {},
        },
    )
def clean_json(data):
    if isinstance(data, list):
        return [clean_json(item) for item in data]

    if isinstance(data, dict):
        return {key: clean_json(value) for key, value in data.items()}

    if isinstance(data, (datetime, date)):
        return data.isoformat()

    if isinstance(data, Decimal):
        return int(data) if data % 1 == 0 else float(data)

    return data