# WITNESS

A community audio Bible: Scripture remains addressable and stable; human readings accumulate around it as witnessed recordings.

## Foundational law

> The community may add witnesses to the text.  
> The community may not silently alter what those witnesses witnessed.

WITNESS treats scripture text, translation, reading, reader, recording, and relation as distinct layers.

## First executable slice

`prototype/` is a no-build browser recorder for **Matthew 5**.

It is configured for two readers:

- Voice A reads odd verses.
- Voice B reads even verses.
- Each phone retains every recorded take locally.
- Either reader can export one WITNESS package.
- Importing the partner package merges recordings by immutable ID and verifies SHA-256.
- **Play assembled chapter** walks Matthew 5 in verse order using the newest available take for each verse.

No account or backend is required for this first proof.

After this branch lands on `main`, the included GitHub Pages workflow can publish `prototype/` as the microphone-capable HTTPS surface.

See [SLICE-001 — TWO-VOICE CHAPTER](docs/SLICE-001-TWO-VOICE-CHAPTER.md).

## Text rights

The first slice uses the World English Bible Protestant Edition reading text for Matthew 5. Its publisher states that the World English Bible is Public Domain and permits copying, public reading, broadcasting, and making/distributing audio recordings.

WITNESS remains rights-aware by design: future text editions must declare their own provenance and redistribution/audio terms.
