from fastapi import APIRouter

from app.api.api_v1.endpoints import location_frontend, login, users, utils, gNB, Cell, UE, monitoringevent, qosMonitoring

api_router = APIRouter()
api_router.include_router(login.router, tags=["login"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(utils.router, prefix="/utils", tags=["utils"])
api_router.include_router(location_frontend.router, prefix="/frontend/location", tags=["Location Frontend"])
api_router.include_router(gNB.router, prefix="/gNBs", tags=["gNBs"])
api_router.include_router(Cell.router, prefix="/Cells", tags=["Cells"])
api_router.include_router(UE.router, prefix="/UEs", tags=["UEs"])
api_router.include_router(monitoringevent.router, prefix="/3gpp-monitoring-event/v1", tags=["Monitoring Event API"])
api_router.include_router(qosMonitoring.router, prefix="/3gpp-as-session-with-qos/v1", tags=["Session With QoS API"])
#api_router.include_router(monitoringevent.monitoring_callback_router, prefix="/3gpp-monitoring-event/v1", tags=["Monitoring Event API"])

'''
    ---Trying to create a subapp---
nef_router = APIRouter()
nef_router.include_router(monitoringevent.router, prefix="/3gpp-monitoring-event", tags=["Monitoring Event API"])
'''
