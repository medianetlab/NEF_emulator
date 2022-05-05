# Changelog

## v1.3.3

### UI changes

 - `/dashboard` js split (see issue: #35):
     - `dashboard.js` keeps only the `document.ready` function + some helper ones
     - `dashboard-gnbs.js` has the gNBs part
     - `dashboard-cells.js` has the Cells part
     - `dashboard-ues.js` has the UEs part
     - `dashboard-paths.js` has the Paths part
 - `/dashboard` split goals:
    - ✅ use `beforeSend`, `complete` and spinners for making visible that reload takes place in the background. Locally this happens so fast that the user doesn't notice.
    - ✅ change `api_get/put/delete/post()` functions to return to callbacks for UI actions
    - ✅ introduce `ui_fetch_and_update()` functions that use the above API calls and after they fetch data, they update the UI. This helped us prevent some states with "stale" data
    - ✅ add layers to maps to let the users choose what they want to see or not (Cells, UEs, Paths) when adding / editing
- `/dashboard` fixes & improvements
    - increase map 🗺️ height inside every modal from 300 to 600px
    - `add_cell` modal: fix `NaN` errors when the user doesn't click on the map to generate X,Y for the new cell
    - `ui_map_paint_path()` function can now take `opacity` argument
    - 🪛 handle `cell_id_hex == null`: display `-` in Datatable cells
- `/map`:
    - 🪛 `map.js` minor fix: add a list of painted paths to first check and -if not already added on the map- continue painting it. (The problem appeared visually when multiple UEs had the same path assigned)
    - ✅ handle `cell_id_hex == null` and display grey ⚪ UE-icon when not connected to any cell (this also applies to every UE just after an `import`)


### NEF APIs / backend

- Fix problem with `path_id` on import/export scenario. (e.g., if we export a scenario with UEs with path_ids 1,2,4, when the scenario is imported, the path with id 4 is added as path with 3. The UE is successfully correlated with the new path id 3)
- 🙅‍♂️Forbid user to update (gnb/cell)'s `hex ids`, if they already exist
- Add disconnected state functionality. 👉 When there is no radio coverage 📵 the UE disconnects from the cell that it's currently connected. 

### Other

- ✔ `make db-reset` : except for reseting the postgresql db, add functionality to also reset mongo db
- 🔥 `make build` / `make build-no-cache` : hotfix add `--profile` option to `docker-compose`

### Libraries
- Fix build error caused by jinja2 newer version (lock to v.3.0.3)



<br><br>



## v1.3.2

- Fix UE-association-path selection with `path_id` 0 (no path selected) - both dashboard and backend
- Fix bug in check_expiration_time function
- The Monitoring Event subscription by external id is retrieved by additional filter `owner_id`


<br><br>

## v1.3.1

- Fix endpoints on MonitoringEvent API <kbd>{apiroot}/nef/api/v1/3gpp-monitoring-event/**v1**/{scsAsId}/subscriptions</kbd>


<br><br>






## v1.3.0


### License ⚖️
 -  added **Apache-2.0 License**



### Docker 🐳

 - ⛔ breaking change, 🔃 upgrade `docker-compose` to version `1.29.2`, build `5becea4c`
 - Guidelines: head over to [docs.docker.com/compose/install/](https://docs.docker.com/compose/install/) and choose your OS. For Linux you can use the following 👇:

       sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
 - **Reason:** our `docker-compose.yml` now uses `profiles` ([docs.docker.com/compose/profiles/](https://docs.docker.com/compose/profiles/)). This gives us the option of adding some kind of labeling to every container, for example `["dev", "debug", "frontend"]` that can later be passed to `docker-compose up`. Practically this means that you spin up the containers selectively depending on what you need. With the relative changes to the `Makefile`:
   - ℹ️ `make up` now runs **only** the **3** containers needed for the NEF_emulator
   - ✔ `make debug-up`: new command, runs the full composition: **5** containers, 3 needed for NEF + 2 for Database management (Postgres & MongoDB)


         make up:
                docker-compose --profile dev up
       
         make debug-up:
                docker-compose --profile debug up


### NEF APIs / backend

 - split documentation in two parts:
     - NEF_emulator (Swagger - `/docs` | Redoc `/redoc`)
     - Northbound APIs (Swagger - `/nef/docs` | Redoc `/nef/redoc`)
 - ⛔ breaking change, split endpoints in two parts:
     - NEF emulator <kbd>{apiroot}/api/v1/{*NEF_emulator endpoints*}</kbd>
     - Northbound APIs <kbd>{apiroot}/nef/api/v1/{*Northbound endpoints*}</kbd>
     
 - ✔ added functionality to export/import the scenario (gNBs, Cells , UEs, paths) (see UI changes)
     - <kbd>/api/v1/utils/export/scenario</kbd>
     - <kbd>/api/v1/utils/import/scenario</kbd>
 


### UI changes

 - 🔃 upgrade `coreui` to `v4.1.0` which fixes a persistent browser console error
 - ✔ `/export` page to generate `json` with the scenario (gNBs, Cells, UEs, paths)
 - ✔ `/import` page to upload `json` and create a previously exported scenario
 - 📄 `/docs`: added sidebar links to the new API Swagger/ReDoc pages (after the UI / North Bound split)
 - minor changes to the UE datatable to show more handy attributes (e.g. `external_identifier`, `path`...)
 - ✔ added 2 Javascript libraries: `codemirror` & `highlight` for `json` highlighting inside textareas
 - `/dashboard`: added some callback functions needed at `api_put_UE_callback(...)` &  `api_post_UE_callback(...)`
 - `/dashboard`: added handling for UEs without selected path



### Testing

 - Initial definition of functional tests for `MonitoringEvent API` and `AsSessionWithQoS API` under [docs/test_plan](https://github.com/medianetlab/NEF_emulator/tree/main/docs/test_plan)


 


<br><br>




## v.1.2.0

### Docker 🐳

 - ⚠ new containers added to the composition
   - `mongo:4.4.10`
   - `mongo-express:1.0.0-alpha.4`
 - this practically means that you will have to: 👇👇👇

       make down-v           #remove the old containers & volumes
       make build            #build the new backend (pymongo was added)
       make dev-prepare-env  #use the new .env file
       make up               #start the services
       make db-init          #add data (optional)


### NEF APIs / backend

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
 



### UI changes

 - `/map` add search/filter option to datatables
 - the users can now generate their own scenarios on the map 🗺 more easily:
     - `/dashboard` add `CRUD` operation buttons for gNBs, Cells, UEs, Paths
     - `/dashboard` add `CRUD` operation modal windows for gNBs, Cells, UEs, Paths
     - `color` attribute is now used when paths are displayed on the map
     - `/dashboard` add toastr js to display messages


### Other

 - ⛔ `make db-init-simple` is deprecated and replaced by `make db-init`
 - ✔ `make db-reinit` can now be used as a *shortcut* of: `make db-reset` -> `make db-init`
 - 📄 docs: guidelines added on how to `git switch` to specific `tag`
 - 📄 docs: different network architectures added for NEF <--> NetApp communication options
 - code cleanup + comments



### Libraries

 - added `pymongo = "^3.12.1"`




<br><br>







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
