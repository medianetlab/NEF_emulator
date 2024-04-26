from fastapi import FastAPI, Request
from starlette.middleware.cors import CORSMiddleware
from app.api.api import api_router, nef_router
from app.core.config import settings
import time

# imports for UI
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from fastapi.responses import RedirectResponse

# ================================= Main Application - NEF Emulator =================================
app = FastAPI(title=settings.PROJECT_NAME,
              openapi_url=f"{settings.API_V1_STR}/openapi.json")

# Set all CORS enabled origins
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin)
                       for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(api_router, prefix=settings.API_V1_STR)

# ================================= Sub Application - Northbound APIs =================================

nefapi = FastAPI(title="Northbound APIs")
nefapi.include_router(nef_router, prefix=settings.API_V1_STR)
app.mount("/nef", nefapi)

#Middleware - add a custom header X-Process-Time containing the time in seconds that it took to process the request and generate a response
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

# ================================= Static Page routes =================================

# static files folder
app.mount("/static", StaticFiles(directory="/app/app/static"), name="static")

# templates folder
templates = Jinja2Templates(directory="/app/app/ui")


@app.get("/login", response_class=HTMLResponse)
async def login(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})


@app.get("/register", response_class=HTMLResponse)
async def register(request: Request):
    return templates.TemplateResponse("register.html", {"request": request})


@app.get("/err404", response_class=HTMLResponse)
async def err404(request: Request):
    return templates.TemplateResponse("404.html", {"request": request})


@app.get("/err401", response_class=HTMLResponse)
async def err401(request: Request):
    return templates.TemplateResponse("401.html", {"request": request})


@app.get("/err500", response_class=HTMLResponse)
async def err500(request: Request):
    return templates.TemplateResponse("500.html", {"request": request})


@app.get("/dashboard", response_class=HTMLResponse)
async def dashboard(request: Request):
    return templates.TemplateResponse("dashboard.html", {"request": request})


@app.get("/map", response_class=HTMLResponse)
async def map(request: Request):
    return templates.TemplateResponse("map.html", {"request": request})


@app.get("/", response_class=HTMLResponse)
async def map(request: Request):
    return RedirectResponse("/dashboard")

@app.get("/export", response_class=HTMLResponse)
async def export(request: Request):
    return templates.TemplateResponse("export.html", {"request": request})

@app.get("/import", response_class=HTMLResponse)
async def import_page(request: Request):
    return templates.TemplateResponse("import.html", {"request": request})
