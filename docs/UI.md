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



<br>

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





<br>

## How the UI "consumes" the `API`

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



<br>

## Conventions

 1. **Files**: every `/page` most probably has an equivalent `page.css` and a `page.js` (inside `/static/css/` and `/static/js/` respectively).
 
 2. **Document ready**: the starting point for every `page.js` is the `$( document ).ready(function() {...});`

 3. **Naming prefixes**:
     - `api_<HTTP-VERB>`: functions that contain `Ajax` calls to the API
     - `ui_` : functions that affect the `DOM`
     - `helper_`: functions that manipulate the data already fetched and stored locally to js objects

 4. **Callbacks**:
     - Most of the `api_` functions need a callback function. This makes them usable by different parts of the code which send requests to the same API endpoint but do slightly different things with a successful response.