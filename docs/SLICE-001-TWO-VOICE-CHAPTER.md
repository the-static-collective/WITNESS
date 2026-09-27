# SLICE-001 — TWO-VOICE CHAPTER

## Target

Two people on two phones can alternate verses of Matthew 5, exchange one file, and hear the resulting chapter as one continuous communal reading.

This is deliberately backendless. It proves the witness/assembly contract before accounts, servers, moderation, and public publishing exist.

## The actual ritual

1. Open `prototype/index.html` from an HTTPS host (GitHub Pages is sufficient).
2. Keep Voice A = Lu and Voice B = Paula, or rename them.
3. Lu chooses **This device is → Voice A** and records odd verses.
4. Paula chooses **This device is → Voice B** and records even verses.
5. Each device keeps every take locally in IndexedDB. The newest take is the active playback take; earlier takes are not silently erased.
6. Either reader exports a `.json` WITNESS package and sends it to the other.
7. Importing the partner package verifies each audio SHA-256 and merges unseen recording IDs.
8. Press **Play assembled chapter**.

If both readers have completed their assigned verses, Matthew 5 plays straight through while alternating voices every verse.

## Why Matthew 5

Matthew 5 is the first chapter of the Sermon on the Mount and contains 48 verses, producing exactly 24 assigned verses per reader.

## Text edition

The prototype uses the current World English Bible Protestant Edition (`engwebp`) reading text from:

- https://ebible.org/engwebp/MAT05.htm
- https://ebible.org/engwebp/copyright.htm

The World English Bible is stated by its publisher to be Public Domain, with permission to copy, distribute, read publicly, broadcast, and make/distribute audio recordings.

Footnote markers and footnote content are excluded from the recording surface; the verse wording presented for reading follows the chapter source.

## Provenance behavior

Each recording stores:

- a generated immutable recording ID
- `matthew.5.<verse>`
- the declared text edition ID
- assigned reader name/slot
- recording timestamp
- media type
- SHA-256 of the audio bytes
- the audio Blob itself
- contribution/license marker
- relation space for later provenance links

Recording another take creates another recording ID. It does not mutate the old take.

## Known boundary

The package format serializes audio as base64 JSON. That is intentionally crude but portable and adequate for one spoken chapter at low audio bitrate. A public WITNESS service should replace this transport with content-addressed object storage while retaining the same provenance semantics.

## Next pressure test

After Lu + Paula complete Matthew 5:

**Can the exact same package/assembly machinery extend through Matthew 6 and 7 without changing the witness contract?**

If yes, the Sermon on the Mount becomes the first complete multi-chapter community artifact.
