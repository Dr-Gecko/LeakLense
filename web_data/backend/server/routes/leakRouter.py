from fastapi import APIRouter, Request, Query
import functions.helpers.database as database
import functions.helpers.utils as utils
import functions.leaklense as leak
from decimal import Decimal

router = APIRouter(prefix="/breaches", tags=["Leaklense"])



@router.get("/stats")
async def getStatsData(request:Request):
    stats_data = await leak.pullStatsData()
    return stats_data

@router.get("/list")
async def upper_stats(request:Request):
    stats_data=await leak.pullBreaches()
    return stats_data

@router.get("/map")
async def get_map_data(north: float = Query(...), south: float = Query(...), east: float = Query(...), west: float = Query(...), zoom: int = Query(...), limit: int = Query(5000), offset: int = Query(0)):
    try:
        if zoom <= 3:
            precision = 0       # continent-ish
        elif zoom <= 5:
            precision = 1       # region/state-ish
        elif zoom <= 8:
            precision = 2       # city-ish
        else:
            precision = None    # individual records
        if precision is not None:
            sql = f"""SELECT ROUND(latitude, {precision}) AS latitude, ROUND(longitude, {precision}) AS longitude, COUNT(*) AS count, GROUP_CONCAT(DISTINCT breaches SEPARATOR ', ') AS breaches FROM amtrak WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND latitude BETWEEN %s AND %s AND longitude BETWEEN %s AND %s GROUP BY ROUND(latitude, {precision}), ROUND(longitude, {precision}) ORDER BY count DESC LIMIT %s OFFSET %s"""
            rows = await database.fetch_all(sql,params=(south, north, west, east, limit, offset),database="breaches")
            rows = [
    {
        key: float(value) if isinstance(value, Decimal) else value
        for key, value in row.items()
    }
    for row in rows
]
            return utils.formatResponse(data={"mode": "cluster","precision": precision,"rows": rows},status_code=200,reason="success")
        sql = """SELECT latitude, longitude, name, address, breaches FROM amtrak WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND latitude BETWEEN %s AND %s AND longitude BETWEEN %s AND %s LIMIT %s OFFSET %s"""
        rows = await database.fetch_all(sql, params=(south, north, west, east, limit, offset), database="breaches")
        rows = [
    {
        key: float(value) if isinstance(value, Decimal) else value
        for key, value in row.items()
    }
    for row in rows
]
        return utils.formatResponse(data={"mode": "points","rows": rows},status_code=200,reason="success")
    except Exception as error:
        print(error)
        return utils.formatResponse(
            data={},
            status_code=500,
            reason="failed"
        )