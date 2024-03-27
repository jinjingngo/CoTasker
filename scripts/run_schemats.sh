#!/bin/bash

# Load environment variables from .env file
set -a # automatically export all variables
source .env
set +a

urlencode() {
    python -c "import urllib.parse; import sys; print(urllib.parse.quote_plus(sys.argv[1]))" "$1"
}

ENCODED_PASSWORD=$(urlencode "$DB_PASSWORD")

PG_CONNECTION_STRING="postgresql://${DB_USERNAME}:${ENCODED_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=${DB_SSL_MODE}"

npx schemats postgres "${PG_CONNECTION_STRING}" -s public -C -o ./shared/schemas.ts
