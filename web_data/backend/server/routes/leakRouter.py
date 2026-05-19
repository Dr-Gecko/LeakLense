import functions.leaklense as leak
from fastapi import APIRouter, Request
router = APIRouter(prefix="/breaches", tags=["Leaklense"])

@router.get("/stats")
async def getStatsData(request:Request):
    stats_data = await leak.pullStatsData()
    return stats_data

@router.get("/list")
async def upper_stats(request:Request):
    stats_data=await leak.pullBreaches()
    return stats_data
