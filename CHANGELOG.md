# Changelog

## v.1.1.0


### NEF APIs / backend

 - endpoints summary:
    - <kbd>GET</kbd>  `/api/v1/utils/monitoring/notifications` ✔ added
    - <kbd>GET</kbd>  `/api/v1/utils/monitoring/last_notifications` ✔ added 
    - <kbd>POST</kbd> `/api/v1/3gpp-monitoring-event/v1/{scsAsId}/subscriptions` ⛔ breaking change
 - ⛔ The subscription for the Monitoring Event API is now achieved through the external Id (e.g., 10001@domain.com). The *ipv4*, *ipv6*, *msisdn* ids have been removed from the Monitoring Event API. Moreover, *external id* and the reference resource *subscription*  are included in callback requests.
 - ✔ the 2 newly added endpoints are to be used by the UI for fetching and displaying subsctription events. How they work:
    - Every event has a unique number / ID
    - The backend keeps on-the-fly a dictionary with the 100 latest events. This way the UI is always able (after a page reload) to show the latest 100 events if they exist
    - On "page load/reload" the UI asks the above list of events
    - On "polling for new events" the UI provides the number / ID of the *latest* event that has already received and the backend sends back the new events that may have been occurred. For example, the UI provides that it has received up to event `154` and the backend sends back events `155`, `156` and `157` which have taken place in the meanwhile (time between two polling requests)



### UI changes

 - `/map`: minor changes to markers (UE tooltips, Cell details, more info etc...)
 - `/map`: add "fitbounds functionality" to configure the center of the map depending on the cells loaded for the scenario
 - `/map`: add `datatables` to show subscription events (fetched from the newly added endpoints)
 - `/map`: add select buttons with different interval options, to let the user choose how frequently the data are updated (UEs position & subscription events)
 - `/map`: add modal that shows more details from a subscription event (request body, response body etc...)



### Other

 - `Makefile`: add `logs-location` command to filter logs
 - add comments to js source code
 - override `./start-reload.sh` to prevent `uvicorn` reloads being triggered from changes to `html`, `css` and `js` files: this affects `@tiangolo`'s docker image default behavior. For more details check the backend `Dockerfile`



### Libraries

 - upgrade `uvicorn` to version `0.15.0`