#!/bin/sh
set -e

echo "==> START Registering cron jobs"

cd /app/backend
yarn command:prod cron:register:all

echo "==> DONE"
