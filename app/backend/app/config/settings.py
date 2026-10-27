import os
import logging
from urllib.parse import parse_qs, unquote, urlsplit

from django.core.exceptions import ImproperlyConfigured

from pathlib import Path
from datetime import timedelta

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("SECRET_KEY environment variable is required")

ENV = os.getenv("DJANGO_ENV", "development")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = ENV == "development"

ALLOWED_HOSTS = [
    host.strip() for host in os.getenv("ALLOWED_HOSTS", "").split(",") if host.strip()
]
if os.getenv("RENDER_EXTERNAL_HOSTNAME"):
    ALLOWED_HOSTS.append(os.environ["RENDER_EXTERNAL_HOSTNAME"])

# Em desenvolvimento, aceitar qualquer host (necessário para dispositivos físicos na rede local)
if DEBUG:
    ALLOWED_HOSTS = ["*"]


# Application definition

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Third-Party Apps
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "corsheaders",
    "django_filters",
    # My Apps
    "core",
    "usuarios.apps.UsuariosConfig",
    "estabelecimentos",
    "produtos",
    "tickets",
    "constance",
    "constance.backends.database",
]

# Constance Configurations
CONSTANCE_CONFIG = {
    "PONTOS_POR_REAL_GASTO": (
        1.0,
        "Quantos pontos o cliente ganha por R$ 1 gasto",
        float,
    ),
    "PORCENTAGEM_CASHBACK": (
        5.0,
        "Porcentagem usada para calcular o custo em pontos",
        float,
    ),
}

CONSTANCE_BACKEND = "constance.backends.database.DatabaseBackend"
# CONSTANCE_DATABASE_CACHE_BACKEND = 'default' # Uncomment if you want to use caching

AUTH_USER_MODEL = "usuarios.Usuario"

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",  # Serve static files in production
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"


# Database
# https://docs.djangoproject.com/en/5.2/ref/settings/#databases

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.environ.get("POSTGRES_DB"),
        "USER": os.environ.get("POSTGRES_USER"),
        "PASSWORD": os.environ.get("POSTGRES_PASSWORD"),
        "HOST": os.getenv("POSTGRES_HOST", "db"),
        "PORT": os.getenv("POSTGRES_PORT", "5432"),
    }
}


# O Blueprint injeta a conexão interna do PostgreSQL do Render.
if os.getenv("DATABASE_URL"):
    db_url = urlsplit(os.environ["DATABASE_URL"])
    if db_url.scheme not in ("postgres", "postgresql") or not db_url.hostname:
        raise ImproperlyConfigured("DATABASE_URL deve ser uma URL PostgreSQL válida.")
    DATABASES["default"].update(
        NAME=unquote(db_url.path.lstrip("/")),
        USER=unquote(db_url.username or ""),
        PASSWORD=unquote(db_url.password or ""),
        HOST=db_url.hostname,
        PORT=str(db_url.port or 5432),
        CONN_MAX_AGE=60,
        CONN_HEALTH_CHECKS=True,
    )
    sslmode = parse_qs(db_url.query).get("sslmode", [None])[0]
    if sslmode:
        DATABASES["default"]["OPTIONS"] = {"sslmode": sslmode}

ALLOW_DEMO_DATA = os.getenv("ALLOW_DEMO_DATA", "false").lower() == "true"
DEMO_PASSWORD = os.getenv("DEMO_PASSWORD", "")


# Password validation
# https://docs.djangoproject.com/en/5.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
        "OPTIONS": {
            "min_length": 8,
        },
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.2/topics/i18n/

LANGUAGE_CODE = "pt-br"

TIME_ZONE = "America/Sao_Paulo"

USE_I18N = True

USE_TZ = False


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.2/howto/static-files/

STATIC_URL = "static/"
STATICFILES_DIRS = [BASE_DIR / "static"] if (BASE_DIR / "static").is_dir() else []
STATIC_ROOT = (
    BASE_DIR / "staticfiles"
)  # <- pasta onde o collectstatic vai jogar os arquivos

# Media files (uploads)
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"
    },
}
USE_SUPABASE_STORAGE = os.getenv("USE_SUPABASE_STORAGE", "false").lower() == "true"
if USE_SUPABASE_STORAGE:
    from botocore.config import Config

    required = (
        "SUPABASE_S3_ENDPOINT_URL",
        "SUPABASE_S3_REGION",
        "SUPABASE_S3_ACCESS_KEY_ID",
        "SUPABASE_S3_SECRET_ACCESS_KEY",
        "SUPABASE_STORAGE_BUCKET",
    )
    if any(not os.getenv(key) for key in required):
        raise ImproperlyConfigured(
            "Preencha todas as variáveis SUPABASE_S3_* e SUPABASE_STORAGE_BUCKET."
        )
    STORAGES["default"] = {
        "BACKEND": "storages.backends.s3.S3Storage",
        "OPTIONS": {
            "endpoint_url": os.environ["SUPABASE_S3_ENDPOINT_URL"],
            "region_name": os.environ["SUPABASE_S3_REGION"],
            "access_key": os.environ["SUPABASE_S3_ACCESS_KEY_ID"],
            "secret_key": os.environ["SUPABASE_S3_SECRET_ACCESS_KEY"],
            "bucket_name": os.environ["SUPABASE_STORAGE_BUCKET"],
            "default_acl": None,
            "file_overwrite": False,
            "querystring_auth": True,
            "querystring_expire": 3600,
            "client_config": Config(
                signature_version="s3v4",
                s3={"addressing_style": "path"},
                request_checksum_calculation="when_required",
                response_checksum_validation="when_required",
            ),
        },
    }


# Default primary key field type
# https://docs.djangoproject.com/en/5.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# --- REST FRAMEWORK, JWT & CORS CONFIGURATIONS ---
# Em produção, defina CORS_ALLOWED_ORIGINS no .env (ex.: https://app.seudominio.com).
_CORS_ALLOWED_ORIGINS_ENV = os.getenv("CORS_ALLOWED_ORIGINS", "")
CORS_ALLOWED_ORIGINS = [
    origin.strip() for origin in _CORS_ALLOWED_ORIGINS_ENV.split(",") if origin.strip()
] or [
    "http://localhost:3000",  # Frontend Web
    "http://127.0.0.1:3000",
    "http://localhost:8000",  # Django admin
    "http://127.0.0.1:8000",
    "http://localhost:8081",  # Expo dev server
    "http://10.0.2.2:8000",  # Android Emulator
]

# Configurações de segurança CORS
CORS_ALLOW_CREDENTIALS = ENV == "development"
CORS_ALLOW_ALL_ORIGINS = (
    DEBUG  # True em desenvolvimento para facilitar testes com dispositivos físicos
)
CORS_URLS_REGEX = r"^/api/.*$"

# Origens confiáveis para o CSRF (painel web acessa a API pelo domínio).
# Em produção, defina CSRF_TRUSTED_ORIGINS no .env (ex.: https://app.seudominio.com).
CSRF_TRUSTED_ORIGINS = [
    origin.strip()
    for origin in os.getenv("CSRF_TRUSTED_ORIGINS", "").split(",")
    if origin.strip()
]

# Configurações do Django Rest Framework
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.IsAuthenticated",),
}

SIMPLE_JWT = {
    # === PARA DESENVOLVIMENTO (facilitar testes) ===
    "ACCESS_TOKEN_LIFETIME": (
        timedelta(days=1) if ENV == "development" else timedelta(minutes=5)
    ),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
}

# --- CONFIGURAÇÕES DE SEGURANÇA BÁSICAS ---
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"

# Em produção o proxy do provedor termina o HTTPS e envia X-Forwarded-Proto.
if ENV == "production":
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    SECURE_SSL_REDIRECT = True
    SECURE_REDIRECT_EXEMPT = [r"^healthz/$"]
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True

# Configurações de logging para desenvolvimento
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "filters": {
        "estabelecimento_context": {
            "()": "core.logging_filters.EstabelecimentoContextFilter",
        },
    },
    "formatters": {
        "verbose": {
            "format": "[{asctime}] {levelname} | {module} | estabelecimento={estabelecimento_id} | {message}",
            "style": "{",
            "datefmt": "%d-%m-%Y %H:%M:%S",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "verbose",
            "filters": ["estabelecimento_context"],
        },
        # só será ativado em produção
        "loki": {
            "class": "logging.NullHandler",  # placeholder, será substituído em produção
            "formatter": "verbose",
            "filters": ["estabelecimento_context"],
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "INFO",
    },
    "loggers": {
        "django": {
            "handlers": ["console"],
            "level": "INFO",
            "propagate": False,
        },
        "app": {
            "handlers": ["console"],
            "level": "DEBUG",
            "propagate": False,
        },
    },
}

# 🔹 Se estiver em produção, troca o handler "loki" para um real
if ENV == "production":
    try:
        # baixar o handler do loki
        from loki_django_logger.handler import AsyncGzipLokiHandler

        LOGGING["handlers"]["loki"] = {
            "class": "loki_django_logger.handler.AsyncGzipLokiHandler",
            "loki_url": os.getenv("LOKI_URL", "http://localhost:3100"),
            "labels": {
                "application": "meuapp",
                "environment": ENV,
            },
            "level": "INFO",
            "formatter": "verbose",
        }

        # adiciona loki a todos os loggers
        LOGGING["root"]["handlers"].append("loki")
        LOGGING["loggers"]["django"]["handlers"].append("loki")
        LOGGING["loggers"]["meuapp"]["handlers"].append("loki")

    except ImportError:
        # Se ainda não tem loki_django_logger instalado, ignora
        logging.warning("Loki handler não configurado (pacote não instalado).")
