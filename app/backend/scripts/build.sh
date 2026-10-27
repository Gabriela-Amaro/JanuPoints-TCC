#!/usr/bin/env bash
set -euo pipefail
pip install -r requirements.txt
cd app
python manage.py collectstatic --noinput
