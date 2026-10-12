#!/usr/bin/env sh
set -eu
umask 077
timestamp=$(date -u +%Y%m%d%H%M%S)
restore_db="wpa_restore_check_${timestamp}"
temporary_dump=""

cleanup() {
  docker compose exec -T postgres dropdb --username=postgres --if-exists "${restore_db}" >/dev/null 2>&1 || true
  if [ -n "${temporary_dump}" ]; then rm -f -- "${temporary_dump}"; fi
}
trap cleanup EXIT HUP INT TERM

sha256sum --check "${backup_path}.sha256"
age --decrypt --output "${temporary_dump}" "${backup_path}"
docker compose exec -T postgres createdb --username=postgres "${restore_db}"
docker compose exec -T postgres pg_restore --username=postgres --dbname="${restore_db}" --exit-on-error < "${temporary_dump}"
docker compose exec -T postgres psql --username=postgres --dbname="${restore_db}" -c "SELECT count(*) FROM wpa_schema_migrations;"