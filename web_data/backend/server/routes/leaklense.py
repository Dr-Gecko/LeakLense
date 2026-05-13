from fastapi import APIRouter, Request, Query

import functions.leaklense_utils as utils

router = APIRouter(prefix="/leaklense", tags=["Leaklense"])


@router.get("/stats")
async def upper_stats(request:Request):
    stats_data=await utils.top_stats_data()
    return stats_data


@router.get("/test/map/bounds")
async def dashboard_map_bounds(
    request: Request,
    north: float = Query(...),
    south: float = Query(...),
    east: float = Query(...),
    west: float = Query(...),
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=5000, ge=1, le=10000),
):
    try:
        return await utils.get_dashboard_map_bounds_data(
            north=north,
            south=south,
            east=east,
            west=west,
            offset=offset,
            limit=limit
        )
    except Exception as error:
        print(error)
        return {
            "status": "error",
            "reason": str(error),
            "data": []
        }