# Changelog


## v.1.2.0

## Docker 🐳

 - ⚠ new containers added to the composition
   - `mongo:4.4.10`
   - `mongo-express:1.0.0-alpha.4`
 - this practically means that you will have to: 👇👇👇

       make down-v           #remove the old containers & volumes
       make build            #build the new backend (pymongo was added)
       make dev-prepare-env  #use the new .env file
       make up               #start the services
       make db-init          #add data (optional)


## NEF APIs / backend

 - new *"Session With QoS"* `endpoints`
     - <kbd style="background-color:#eff7ff;">GET</kbd> `/api/v1/3gpp-as-session-with-qos/v1/{scsAsId}/subscriptions` ✔ added
     - <kbd style="background-color:#ecfaf4;">POST</kbd> `/api/v1/3gpp-as-session-with-qos/v1/{scsAsId}/subscriptions` ✔ added
     - <kbd style="background-color:#eff7ff;">GET</kbd> `/api/v1/3gpp-as-session-with-qos/v1/{scsAsId}/subscriptions/{subscriptionId}` ✔ added
     - <kbd style="background-color:#fff5ea;">PUT</kbd> `/api/v1/3gpp-as-session-with-qos/v1/{scsAsId}/subscriptions/{subscriptionId}` ✔ added
     - <kbd style="background-color:#ffebeb;">DELETE</kbd> `/api/v1/3gpp-as-session-with-qos/v1/{scsAsId}/subscriptions/{subscriptionId}` ✔ added
- Callback notification functionality for *"Session With QoS"*
    - The event that triggers the notification is based on handover
- new *"QoS Information"* `endpoints`
    - <kbd style="background-color:#eff7ff;">GET</kbd> `/api/v1/qosInfo/qosCharacteristics`  ✔ added
      This endpoint returns some standardized 5QIs that are loaded from the          app/core/config/qosCharacteristics.json file
    - <kbd style="background-color:#eff7ff;">GET</kbd> `/api/v1/qosInfo/qosProfiles/{gNB_id}` ✔ added
      This endpoint returns the QoS Profiles that have been created and sent to the gNB when a user makes a subscription with QoS for a UE.
- Monitoring Event API
     - Addition of ipv4 both in callback notification and in 201 Created Response
     - Fix swagger documentation after ipv4 change in callbacks
     - Forbid duplicate subscriptions for the same external id
- UEs
    - Fix schemas
    - Change ipv6 address format. Now the ipv6 is stored in exploded mode (e.g., `0000:0000:0000:0000:0000:0000:0000:0001`)
    - Forbid user to delete UE, while it's moving
    - Forbid user to change UE's path (while UE is moving)
    - Validate UE's ids on create/update. (i.e., supi, ipv4, ipv6, mac address, external id)
    - Initiate UE's movement from a random point
- backend server port (`:8888`) is now configurable via the `.env` file
 - `host.docker.internal` now reachable from inside the container, to allow callbacks to services running directly on the host
 - Fix cell/gNB ids at the following endpoints (i.e., from database ids to actual cell/gNB ids)
     - <kbd>/api/v1/Cells/by_gNB/{gNB_id}</kbd>
     - <kbd>/api/v1/UEs/by_gNB/{gNB_id}</kbd>
     - <kbd>/api/v1/UEs/by_Cells/{cell_id}</kbd>
 - <kbd>/frontend/location/</kbd> ⛔ deprecated and replaced by <kbd>/path</kbd>
 - ⚠ endpoint trailing slashes `/` trigger a `307` redirect (prefer `/path` not `/path/`)
 



## UI changes

 - `/map` add search/filter option to datatables
 - the users can now generate their own scenarios on the map 🗺 more easily:
     - `/dashboard` add `CRUD` operation buttons for gNBs, Cells, UEs, Paths
     - `/dashboard` add `CRUD` operation modal windows for gNBs, Cells, UEs, Paths
     - `color` attribute is now used when paths are displayed on the map
     - `/dashboard` add toastr js to display messages


## Other

 - ⛔ `make db-init-simple` is deprecated and replaced by `make db-init`
 - ✔ `make db-reinit` can now be used as a *shortcut* of: `make db-reset` -> `make db-init`
 - 📄 docs: guidelines added on how to `git switch` to specific `tag`
 - 📄 docs: different network architectures added for NEF <--> NetApp communication options
 - code cleanup + comments



## Libraries

 - added `pymongo = "^3.12.1"`








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