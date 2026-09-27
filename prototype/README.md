# WITNESS browser prototype

No build step.

The browser app records Matthew 5 locally first, then optionally joins a Supabase-backed shared room.

## Shared-room flow

1. Enable **Anonymous Sign-Ins** for the WITNESS Supabase project.
2. Serve `prototype/` over HTTPS (or localhost).
3. Voice A chooses their name/slot and taps **Start shared room**.
4. Copy the generated room link to Voice B.
5. Voice B opens the link, chooses Voice B, and taps **Join room**.
6. Each reader uses **Next mine** → **Record verse**.
7. Local IndexedDB receives the take before any network upload occurs.
8. Supabase Storage + Postgres receive an immutable synced copy.
9. Realtime refreshes the other phone automatically.

The Supabase JS dependency is pinned in `room-sync.js`.

## Local test

```sh
python3 -m http.server 8080 --directory prototype
```

Open `http://localhost:8080`.

Microphone capture on normal phone deployment requires HTTPS.

## Offline / fallback

Package export/import remains available.

A failed network sync does not delete or invalidate a local recording. The UI reports the take as locally witnessed and leaves it available for retry.
