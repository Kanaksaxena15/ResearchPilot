import os
import logging
from fastapi import FastAPI, Request, HTTPException as FastAPIHTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from app.database import init_db
from app.routers import auth, papers

# Set up logging configuration
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("app.main")

# Auto-initialize database on server startup
try:
    init_db()
    logger.info("Database initialized successfully.")
except Exception as e:
    logger.critical(f"Failed to initialize SQLite database on boot: {str(e)}", exc_info=True)

app = FastAPI(
    title="ResearchPilot AI Backend",
    description="Python FastAPI REST engine for Literature Reviews, integrated with IBM Granite via Watsonx",
    version="1.0.0"
)

# Custom Exception Handlers for robust error serialization (compat with React's .error checks)
@app.exception_handler(FastAPIHTTPException)
async def fastapi_http_exception_handler(request: Request, exc: FastAPIHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "error": exc.detail}
    )

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "error": exc.detail}
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for err in exc.errors():
        loc = " -> ".join(str(x) for x in err.get("loc", []))
        errors.append(f"{loc}: {err.get('msg')}")
    detail = "; ".join(errors)
    return JSONResponse(
        status_code=422,
        content={"detail": detail, "error": detail}
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled exception occurred: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred", "error": str(exc)}
    )

# Enable CORS for local cross-port development testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register REST endpoints
app.include_router(auth.router)
app.include_router(papers.router)

# Resolve and mount built SPA client resources if available
dist_dir = os.path.join(os.getcwd(), "dist")
if os.path.exists(dist_dir):
    logger.info(f"Serving static production assets from compiled build directory: {dist_dir}")
    
    # Mount main static assets directory (JS, CSS, images)
    assets_dir = os.path.join(dist_dir, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")
    
    # Catch-all file-system request responder for client-side navigation paths (React Router)
    @app.get("/{catchall:path}")
    def serve_frontend_or_assets(catchall: str):
        # Prevent intercepting API routes that might be typo'd or missing
        if catchall.startswith("api/"):
            return None
            
        # Deliver requested physical static files (e.g. icons, fonts) if they exist
        local_file_path = os.path.join(dist_dir, catchall)
        if os.path.exists(local_file_path) and os.path.isfile(local_file_path):
            return FileResponse(local_file_path)
            
        # Fallback to SPA index.html for React Router to mount the correct client-side component
        index_html_path = os.path.join(dist_dir, "index.html")
        if os.path.exists(index_html_path):
            return FileResponse(index_html_path)
        
        return {"error": "Frontend UI file not found."}
else:
    logger.warning("No compiled SPA build directory found in 'dist/'. Run 'npm run build' to bundle the React frontend.")
    
    @app.get("/")
    def system_status():
        return {
            "status": "online",
            "message": "REST backend is running successfully. Compile frontend components to view the literature dashboard."
        }
