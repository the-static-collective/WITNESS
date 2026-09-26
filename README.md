# WITNESS

A community audio Bible: Scripture remains addressable and stable; human readings accumulate around it as witnessed recordings.

## Foundational law

> The community may add witnesses to the text.  
> The community may not silently alter what those witnesses witnessed.

WITNESS treats scripture text, translation, reading, reader, recording, and relation as distinct layers.

## Canonical contribution law

See [CANON-001 — FREE WITNESS](docs/CANON-001-FREE-WITNESS.md).

> **WITNESS does not distribute Scripture among people.  
> People approach Scripture freely.  
> WITNESS preserves what they leave there and composes from abundance.**

The core contribution primitive is a person freely leaving a recording at a passage address. Assignment systems and rooms are optional composition/gathering tools, not the ontology.

## Current executable: ROOM-001

`prototype/` is a no-build browser recorder for **Matthew 5** with two modes:

- **Local-only:** record verses into IndexedDB and exchange backup packages manually.
- **Shared room:** two phones join the same Supabase-backed room and the chapter assembles live.

Voice A reads odd verses and Voice B reads even verses.

The shared-room path preserves the original local-first law:

```
voice -> local recording -> SHA-256 receipt -> sync -> shared availability
```

Supabase does not decide whether the recording happened; it makes independently recorded witnesses available to the room.

See:

- [GENESIS-001](docs/GENESIS-001.md)
- [SLICE-001 — TWO-VOICE CHAPTER](docs/SLICE-001-TWO-VOICE-CHAPTER.md)
- [ROOM-001 — SHARED CHAPTER](docs/ROOM-001-SHARED-CHAPTER.md)
- [Supabase ROOM-001 contract](supabase/room-001.sql)

## Backend

WITNESS has its own Supabase project.

ROOM-001 uses:

- anonymous Supabase Auth sessions
- RLS-controlled rooms and membership
- append-only recording receipts
- a private `witness-audio` Storage bucket
- realtime inserts for recordings and members

The public browser contains only a Supabase publishable key. No service-role/secret credential is shipped to the frontend.

## Text rights

The first slice uses the World English Bible Protestant Edition reading text for Matthew 5. Its publisher states that the World English Bible is Public Domain and permits copying, public reading, broadcasting, and making/distributing audio recordings.

WITNESS remains rights-aware by design: future text editions must declare their own provenance and redistribution/audio terms.
