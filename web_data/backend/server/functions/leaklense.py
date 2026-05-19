import time
import argon2
import datetime
import traceback
from uuid import uuid4
from base64 import b64encode
from argon2 import PasswordHasher
import functions.helpers.utils as utils
from fastapi import Response, status,Request
import functions.helpers.database as database
from decimal import Decimal

from datetime import datetime, date



async def _pullStatsDataFromDB():
    try:
        return sum([(await database.fetch_one(f"select count(*) from {breach}", database="breaches"))['count(*)'] for breach in [table['table_name'] for table in await database.fetch_all("select table_name from breaches", database="breaches")]])
    except Exception as error:
        print(error)
        pass

async def pullStatsData():
    try:
        record = await _pullStatsDataFromDB()
        breaches = await database.fetch_one("select count(*) from breaches",database="breaches")
        stats={"total_entries":record,"breaches":breaches['count(*)']}
        return utils.formatResponse(data=stats)
    except Exception as error:
        return utils.formatResponse(status_code=500, reason="server_error")

async def pullBreaches():
    try:
        query = "SELECT id, name, threat_actor, date_added, record_count FROM breaches;"
        rows = await database.fetch_all(query, database="breaches")
        return utils.formatResponse(data=utils.clean_json(rows))
    except Exception as error:
        print(error)
        traceback.print_exc()
        return utils.formatResponse(data={}, status_code=500, reason="server_error")

