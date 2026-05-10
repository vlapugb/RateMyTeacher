# Safe Postgres Volume Migration

Do not switch an existing production volume from
`postgres_data:/var/lib/postgresql` to
`postgres_data:/var/lib/postgresql/data` in-place. The current layout stores the
cluster inside the mounted parent directory, and changing the mount target can
make Postgres initialize an empty cluster.

Use this sequence for production:

1. Create a dump from the running database.

   ```bash
   docker compose exec -T db pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > /root/studradar-backup.sql
   ```

2. Stop only the app-facing services.

   ```bash
   docker compose stop app anubis caddy
   ```

3. Add a new named volume and mount it at `/var/lib/postgresql/data`.

4. Start the new database container and restore the dump.

   ```bash
   docker compose up -d db
   docker compose exec -T db psql -U "$POSTGRES_USER" "$POSTGRES_DB" < /root/studradar-backup.sql
   ```

5. Verify row counts and application health before starting public traffic.

   ```bash
   docker compose exec -T db psql -U "$POSTGRES_USER" "$POSTGRES_DB" -c '\dt'
   docker compose up -d app anubis caddy
   curl -fsS https://ratespbuteacher.ru/api/health
   ```

Keep the old `postgres_data` volume until the restored database has been
verified under real traffic.
