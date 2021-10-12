from fastapi import FastAPI, Request, Response
from starlette.middleware.cors import CORSMiddleware

from app.api.api_v1.api import api_router
from app.core.config import settings

# imports for UI
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from fastapi.responses import RedirectResponse

app = FastAPI(
    title=settings.PROJECT_NAME, openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# static files folder
app.mount("/static", StaticFiles(directory="/app/app/static"), name="static")

# templates folder
templates = Jinja2Templates(directory="/app/app/ui")

# Set all CORS enabled origins
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(api_router, prefix=settings.API_V1_STR)

'''
nefapi = FastAPI(title="Northbound APIs", openapi_url=f"{settings.API_V1_STR}/nef/openapi.json")
nefapi.include_router(nef_router, prefix=settings.API_V1_STR)
app.mount("/nef", nefapi)
'''

# ================================= Static Page routes =================================

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
async def err404(request: Request):
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
