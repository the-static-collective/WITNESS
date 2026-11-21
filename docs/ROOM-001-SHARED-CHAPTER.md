# ROOM-001 — Shared Chapter

ROOM-001 turns the local Matthew 5 recorder into one shared chapter without making the network authoritative over the recording act.

## Human flow

1. Voice A opens WITNESS and taps **Start shared room**.
2. WITNESS creates a Supabase-authenticated anonymous browser identity.
3. Voice A copies the room link.
4. Voice B opens the link, chooses Voice B, and taps **Join room**.
5. Each reader taps **Next mine**, records one verse, and stops.
6. The browser writes the take to IndexedDB first.
7. After the local receipt exists, WITNESS syncs the immutable audio object + metadata receipt to Supabase.
8. The other phone receives the new recording through Realtime and the chapter progress updates.
9. **Play assembled chapter** uses the newest witnessed take for every available verse.

If the network is unavailable, step 6 still succeeds. The take remains local and can sync later.

## Authority boundary

```
VOICE
  -> LOCAL AUDIO BLOB
  -> LOCAL SHA-256 RECEIPT
  -> OPTIONAL NETWORK SYNC
  -> PRIVATE STORAGE OBJECT
  -> APPEND-ONLY RECORDING ROW
  -> REALTIME AVAILABILITY TO OTHER ROOM MEMBERS
```

Supabase is the meeting place, not the authority over whether the recording happened.

## Room capability

ROOM-001 uses the room UUID as the unguessable invitation capability.

The room itself remains inaccessible through RLS until the authenticated browser identity joins it. Joining requires knowledge of the room UUID and the room must still be open.

Reader slots A and B are unique within a room.

## Auth

The browser uses Supabase anonymous Auth. Anonymous users still receive real authenticated JWT sessions and therefore use the `authenticated` database role.

Anonymous sign-ins must be enabled for the WITNESS Supabase project. No email, phone number, or password is required for the ROOM-001 experience.

## Database

- `witness_rooms` — passage-level collaboration room.
- `witness_room_members` — room-local reader identity and slot.
- `witness_recordings` — append-only recording receipts.
- `witness-audio` — private Storage bucket.

No UPDATE or DELETE privilege is granted for recording rows in ROOM-001.

No UPDATE or DELETE Storage policy is granted for WITNESS audio in ROOM-001.

A retake creates a new recording and may point to the previous take using `supersedes`.

## Storage path

```
<room_uuid>/<auth_user_uuid>/<recording_id>.<extension>
```

Storage RLS verifies both room membership and that uploads land beneath the current authenticated user's path.

Room members may read room audio. Only the current user may insert beneath their own path.

## Realtime

ROOM-001 subscribes to inserts on:

- `witness_recordings`
- `witness_room_members`

This first slice intentionally uses Postgres Changes because the expected room size is two connected readers. Broadcast is the later scaling route.

## Security receipt

After provisioning, Supabase Security Advisor reported zero findings.

The performance advisor reported only unused-index informational notices on the empty project; those indexes cover room/verse and foreign-key access paths expected once recordings exist.

## Fallback

The original WITNESS package export/import path remains present as a backup and offline transfer mechanism.
