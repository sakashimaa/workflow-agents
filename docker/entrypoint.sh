#!/bin/sh
set -eu

npm run db:migrate
if [ "${SEED_DEMO_DATA:-false}" = "true" ]; then
  npm run db:seed
fi
exec node .output/server/index.mjs
