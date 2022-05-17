# 📃 User Interface documentation

Topics: `FASTAPI`, `JAVASCRIPT`, `AUTH`, `PAGE-TEMPLATES`, `PAGE-ROUTES`


<br>

## tl;dr

Current library dependencies:

 - pure HTML / CSS / Javascript (+jQuery) statically served from `fastapi`
 - [`coreui`](https://coreui.io/) for the dasboard + general page template
 - [`datatables`](https://datatables.net/) for displaying tabular data
 - [`leaflet.js`](https://leafletjs.com/) for the map
 - [`codemirror`](https://codemirror.net/) for formating `json` in a textarea
 - [`toastr`](https://codeseven.github.io/toastr/) for displaying notifications to the user

Where to look:

```
/app
│   main.py    ( fastapi + page routes )
│
└───/static    ( folder with assets and js libraries )
│
└───/ui        ( folder with HTML templates)
```



<br><br>

## First things first...

This is the place to start, in case you need to understand better how the UI of `NEF_emulator` actually works.

**Historical context:**  
At the very beginning we were considering `NEF_emulator` as a component that provides a REST API with its `Swagger` pages, to help the user consume it and read its documentation. Thus, a `fastapi` project would be simply enough and there were no plans for adding a UI.

So, we started as if `NEF_emulator` is a black box ⬛ and the user can do some things with it by "talking" to its REST api... This was ok, playing around with the `swagger-ui` and making sure that the endpoints are working fine were our main tasks, but then we reached a point where it would be useful for us having a quick, clear way of looking what's going on inside that box 📦 without looking to `json` responses. Then came the idea of adding a minimal UI!


**Tech decisions:**  

Having in mind the *"separation of concerns"* principle, we first tried to provide the UI with a separate `frontend` container. We also played a bit with `vue.js` but after spending a lot of time solving dependency / library / version problems and having identified that it would be better for us not to pick a community + framework that moves so fast, we took a step back and decided to use simpler tech.

This simplicity also made us neglect the separate-container approach and go directly to `NEF_emulator`. The prerequites though were:

 - ✔ `NEF_emulator` still remains a REST service, with an API as its "heart"
 - ✔ the `UI` is provided mostly by serving "static" assets
 - ✔ no server-side templating

*(With the above approach, it would be easy (in case it didn't work) to go back to a more complicated one, with separate container and a heavier frontend framework).*





<br><br>

## How the UI "consumes" the `API`

💡 *This section contains information on how `fastapi` serves static files which work together with the REST API and a minimal UI for the `NEF_emulator` is  provided.*

<br> 

1️⃣ We add pure `HTML` files to [`/app/app/ui`](https://github.com/medianetlab/NEF_emulator/tree/main/backend/app/app/ui) and set new page routes to [`main.py`](https://github.com/medianetlab/NEF_emulator/blob/main/backend/app/app/main.py). For example, for the `/login` page:

```python
@app.get("/login", response_class=HTMLResponse)
async def login(request: Request):
    return templates.TemplateResponse("login.html", {"request": request}
```


2️⃣ CSS, Javascript and other assets (e.g. images) are all served from a `static` folder:

```python
app.mount("/static", StaticFiles(directory="/app/app/static"), name="static")
```


3️⃣ page `onload()`

 - **authentication**: [`app.js`](https://github.com/medianetlab/NEF_emulator/blob/main/backend/app/app/static/app/app.js) is a file loaded by every page and the very first thing to do before anything else is to check whether the user is authenticated. Practically, from the browser's perspective this means to check whether a valid `bearer` token exists in the `localStorage`:

```
when a page loads, app.js runs first to:
  - check local storage:
    ⛔ if no bearer token is found --> redirect to login page
    ✅ if    bearer token is found --> test its validity

  - check token
    ⛔ if not valid --> redirect to login page
    ✅ if     valid --> continue rendering the page
```


 - **rendering:** after passing the authentication step, every page can fetch data from various endpoints and display them accordingly. If needed it may fetch data multiple times and reflect possible changes to the page.

   The part of code that makes a page able to interact with the API is `app`, a global object defined inside `app.js`:

   ```javascript
   var app = {
     local_storage_available: false,
     auth_obj:                null,
     api_url: "/api/v1"
   };
   ```

   This object, `app`, is accessed every time a call to the API is being made in order to get the `api_url` and the `access_token`. For example, to `GET` the list of `gNBs`:

   ```javascript
   var url = app.api_url + '/gNBs?skip=0&limit=100';
   
   $.ajax({
     type: 'GET',
     url:  url,
     contentType : 'application/json',
     headers: {
               "authorization": "Bearer " + app.auth_obj.access_token
   },
   ...
   ```

   After a successful response, the javascript of the page handles the data and updates the UI. There's no standard way here, for example the `/dashboard` page has js that creates or updates the `datatable` instances and `/map` page has js that paints entities on the `leaflet` map.



<br><br>

## Conventions

💡 *This section mentions some of the major page routes and relevant information for each one on how they load / render / refresh their page components.*

<br>

 1. **Files**: every `/page` most probably has an equivalent `page.css` and a `page.js` (inside `/static/css/` and `/static/js/` respectively).
 
 2. **Document ready**: the starting point for every `page.js` is the `$( document ).ready(function() {...});`

 3. **Naming prefixes**:
     - `api_<HTTP-VERB>`: functions that contain `Ajax` calls to the API
     - `ui_` : functions that affect the `DOM`
     - `helper_`: functions that manipulate the data already fetched and stored locally to js objects

 4. **Callbacks**:
     - Most of the `api_` functions need a callback function. This makes them usable by different parts of the code which send requests to the same API endpoint but do slightly different things with a successful response.




<br><br>

## Page routes

💡 *This section contains some of the major page routes and relevant information for each one on how they load / render / refresh their page components.*

<br>

### `/login`

Simple `username` / `password` form for submiting credentials and getting back a valid access token. Successful submission triggers the creation of a `localStorage` item named `app_ath` inside the browser, which is later used by other pages.

    localStorage.setItem('app_auth', ...)


<br>

### `/dashboard`

#### Main goals:

 - provide a tabular way of seeing what's inside a `NEF_emulator` database
 - provide a way for adding/editing objects and generating custom *scenarios* with the guidance of a simple UI which uses:
    - 📄 Forms: for managing text details and needed bindings (e.g. *UE-Path*, *Cell-gNB*)
    - 🗺 Maps: for managing objects which have a location (Cells, UEs)
    - 📍 Path-drawing: for generating UE paths on the map with just a few clicks

#### Javascript split:

This page has a lot of functionalities because it offers `CRUD` operations for all the entities of `NEF_emulator` (gNBs, Cells, UEs and Paths). Practically this means:

 - 4 modal windows with their dedicated instance of `leaflet.js` map for **creating** new objects (**C**RUD)
 - 4 instances of `Datatables` for displaying (**reading**) object details (C**R**UD)
 - 4 modal windows with their dedicated instance of `leaflet.js` map for **updating** new objects (CR**U**D)
 - buttons for **deleting** objects (CRU**D**)

For this reason a split has been made:

 - `dashboard.js`: contains the document ready() function with the basic code structure. Most function-calls use function definitions from the following files:
     - `dashboard-gnbs.js`
     - `dashboard-cells.js`
     - `dashboard-ues.js`
     - `dashboard-paths.js`

#### Issues:

See: #7 #35 




<br>

### `/map`

#### Main goals:

 - provide a way of seeing live the location of objects and observing their potential movement
 - start / stop the movement of UEs
 - provide a way of watching callback notifications to NetApps

#### Polling mechanism:

 - this page implements a polling approach to fetch the new locations of UEs every X seconds and update the map
 - this also happens for the callback events in the following way:
     - every event has a unique number/ID
     - the backend keeps on-the-fly a dictionary with the 100 latest events. This way the frontend is able to show the latest 100 events after a page reload
     - on "page load/reload" the frontend asks and displays the above list of events
     - on "polling for new events" the frontend provides the number/ID of the latest event that has already received to the backend and the latter will send back the new events that may have been occurred. For example, the frontend provides that it has received up to event 154 and the backend sends back events 155, 156 and 157 which have taken place in the meanwhile (time between two polling requests)


#### Issues:

See: #8




<br>

### `/export`

This page can be used to generate a `json` file with all the details of the scenario that is currently stored in `NEF_emulator`. The options provided are to either copy to clipboard or save to `.json` file. The structure of it is something like:

```json
{
  "gNBs": [],
  "cells": [],
  "UEs": [],
  "paths": [],
  "ue_path_association": []
}
```

<br>

### `/import`

This page can be used to quickly import an already saved scenario (product of the previous `/export` page). The user can paste the generated `json` or drag-n-drop the `.json` file in the textarea and import the data.

⚠ this step overwrites any pre-existing data in the database and loads only what is provided in the textarea.
