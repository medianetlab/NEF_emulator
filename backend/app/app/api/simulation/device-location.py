from fastapi import APIRouter
import requests
from fastapi.responses import JSONResponse

# Define a new router for the device-location endpoint
#device_location_router = APIRouter()

@device_location_router.get("/nef/device-location/{imsi}", tags=["Device Location"])
async def get_device_location(imsi: str):
    """
    Fetch the device location from the external service running in Docker.
    Replace the 'imsi' path variable with the actual IMSI needed for the request.
    """
    url = f"http://10.220.2.106:5000/{imsi}/device-location"
    
    try:
        response = requests.get(url)
        response.raise_for_status()  # Ensure we raise an exception for non-2xx responses
        return JSONResponse(content=response.json(), status_code=response.status_code)
    except requests.exceptions.RequestException as e:
        return JSONResponse(
            content={"error": str(e)},
            status_code=500
        )
