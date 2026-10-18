import os

from .base import *

DEBUG = os.getenv("DJANGO_DEBUG", "True").lower() == "true"
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    },
}
