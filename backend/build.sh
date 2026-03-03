#!/usr/bin/env bash
# exit on error
set -o errexit

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Run database migrations (if needed)
# Uncomment if you add alembic migrations later
# alembic upgrade head
