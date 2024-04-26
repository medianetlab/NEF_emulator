import logging
from fastapi import HTTPException
from app.api.simulation.utils import ccf_logs


def log_and_response(http_request, http_response, status_code, token_payload):

    try:
        json_response = {"response": http_response,
                         "status_code": str(status_code)}
        ccf_logs(http_request, json_response,
                 "service_monitoring_event.json", token_payload.get("sub"))
    except (TypeError, AttributeError) as error:
        logging.error(f"Error: {error}")

    if status_code == 200 or status_code == 201:
        return

    logging.error(f"Error: {http_response}")
    raise HTTPException(status_code=status_code, detail=http_response)