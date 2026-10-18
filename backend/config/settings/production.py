import os

import dj_database_url

from .base import *

DEBUG = False
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "")
if (
    len(SECRET_KEY) < 50
    or SECRET_KEY == "dev-only-change-this-key-before-deployment"
    or SECRET_KEY.startswith("replace-with-")
):
    raise ValueError("Set DJANGO_SECRET_KEY to a unique value of at least 50 characters.")

ALLOWED_HOSTS = [
    host.strip()
    for host in os.getenv("DJANGO_ALLOWED_HOSTS", "").split(",")
    if host.strip()
]
if not ALLOWED_HOSTS:
    raise ValueError("Set DJANGO_ALLOWED_HOSTS to the production backend hostname.")

CORS_ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv("CORS_ALLOWED_ORIGINS", "").split(",")
    if origin.strip()
]
if not CORS_ALLOWED_ORIGINS:
    raise ValueError("Set CORS_ALLOWED_ORIGINS to the production frontend origin.")

DATABASE_URL = os.getenv("DATABASE_URL", "")
if not DATABASE_URL.startswith(("postgres://", "postgresql://")):
    raise ValueError("Set DATABASE_URL to a PostgreSQL connection URL in production.")
DATABASES = {
    "default": dj_database_url.parse(DATABASE_URL, conn_max_age=600, ssl_require=True),
}

SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31_536_000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
