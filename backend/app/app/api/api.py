from fastapi import APIRouter
from app.api import simulation, northbound

api_router = APIRouter()
api_router.include_router(simulation.login.router, tags=["login"])
api_router.include_router(simulation.users.router, prefix="/users", tags=["users"])
api_router.include_router(simulation.utils.router, prefix="/utils", tags=["UI"])
api_router.include_router(simulation.ue_movement.router, prefix="/ue_movement", tags=["Movement"])
api_router.include_router(simulation.paths.router, prefix="/paths", tags=["Paths"])
api_router.include_router(simulation.gNB.router, prefix="/gNBs", tags=["gNBs"])
api_router.include_router(simulation.Cell.router, prefix="/Cells", tags=["Cells"])
api_router.include_router(simulation.UE.router, prefix="/UEs", tags=["UEs"])
api_router.include_router(simulation.qosInformation.router, prefix="/qosInfo", tags=["QoS Information"])

# ---Create a subapp---
nef_router = APIRouter()
nef_router.include_router(northbound.monitoringevent.router, prefix="/3gpp-monitoring-event/v1", tags=["Monitoring Event API"])
nef_router.include_router(northbound.qosMonitoring.router, prefix="/3gpp-as-session-with-qos/v1", tags=["Session With QoS API"])
