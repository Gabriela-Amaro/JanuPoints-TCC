#!/usr/bin/env bash
set -euo pipefail
cd app
python manage.py migrate --noinput
if [ "${ALLOW_DEMO_DATA:-false}" = "true" ]; then
  python manage.py popular_banco --sem-relatorio
fi
# O SSE atual usa gerador síncrono; threads permitem manter o stream e atender a API.
exec gunicorn config.wsgi:application --bind "0.0.0.0:${PORT:-8000}" \
  --workers 1 --worker-class gthread --threads 8 --timeout 120 --log-level info
