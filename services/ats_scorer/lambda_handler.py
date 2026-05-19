"""
AWS Lambda entry point — wraps the FastAPI ASGI app with Mangum.

Deploy as a container image (see Dockerfile) — the models are baked in at
build time so there is no cold-start model download.

API Gateway mapping:
    ANY /{proxy+}  →  this handler

Environment variables expected in Lambda:
    (none required for core operation; add CORS_ORIGIN for production tightening)
"""
from mangum import Mangum

from .main import app

# lifespan="off" disables FastAPI startup/shutdown events (not needed in Lambda)
handler = Mangum(app, lifespan="off")
