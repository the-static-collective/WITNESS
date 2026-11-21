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

## Native freeplay: The Living Chapter

The WITNESS game panel is built into `index.html` with `game.mjs` as a pure, no-build, record-derived engine. It supports freely chosen readings by default, an optional odd/even duet, "open passage" exploration, cooperative coverage, local audio-playback receipts, and milestone constellations. Reading another take is welcome without unlimited repeat scoring.

The original `witness-package` v1 export containing locally stored audio remains the format accepted by THE PACT v0.4's private WITNESS tab. The separate `Export game review packet` contains metadata only, excludes shared-room invitation UUIDs and awards zero Deeds, Harvests and Capacity.

No new Supabase credentials, permissions, game cloud state, quota or automatic audio upload are added. Optional WITNESS shared-room sync remains separate; the game works with locally available recordings.

Run `node --test prototype/game.test.mjs` for nine deterministic fixtures. Physical mobile microphone / two-phone field tests remain outstanding.
