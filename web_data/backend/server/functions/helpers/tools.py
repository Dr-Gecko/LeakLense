import time
import argon2
import datetime
import traceback
from uuid import uuid4
from base64 import b64encode
import functions.helpers.utils as utils
from argon2 import PasswordHasher
import functions.helpers.database as database
from fastapi import Response, status,Request
from decimal import Decimal






async def top_stats_data():
    breach_query="select count(name) from breaches"
    count_query = "SELECT COUNT(*) AS total_count FROM users"
    count = await database.fetch_one(count_query, database="breaches")
    breach_count = await database.fetch_one(breach_query, database="breaches")
    stats={"total_entries":count,"breaches":breach_count}
    return utils.format_response(data=stats)
