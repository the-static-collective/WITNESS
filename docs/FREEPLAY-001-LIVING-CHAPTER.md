# FREEPLAY-001 — THE LIVING CHAPTER

**Status:** Native, no-build WITNESS browser gameplay on the `feature/free-witness-expedition-001` branch. Designed to merge into the Matthew 5 Genesis prototype without changing Scripture or recording authority.

## The game

The **chapter is a cooperative exploration map**. Every address can receive one recording, two recordings, or thousands. The visitor chooses a passage, listens to a take, and may contribute a voice. Any recording is an additional witness to the addressed Scripture; it is not the canonical text and it does not replace previous takes.

The playable surface introduces:

- **Open Doors:** find an address not yet represented in the locally visible corpus, or choose a surprise address. Neither is an assignment.
- **Living map:** count distinct addresses carrying human audio separately from the total number of takes. A shared room may include local takes not yet synced; these statistics describe what is visible on the current device, not a universal census.
- **Continuous thread:** count consecutive address coverage and cross-voice joins, suggesting new ways to assemble a mosaic rather than declaring one preferred voice.
- **Listening posts:** browser playback events are counted only when a selected take actually reaches the HTML audio ended event. This proves *playback completion on this device*, not human comprehension or attention.
- **Constellations:** milestones for first recording, three covered addresses, distinct voice labels, multiple takes at one passage, listening completions, eight contiguous addresses and complete Matthew 5 coverage.
- **Glimmers:** bounded, playful chapter progress: +5 per distinct covered address, +3 per unique locally completed playback (max 12), +15 for two voice identities, +30 for complete chapter coverage. These numbers are an opt-in UI ornament; they are not money, spiritual merit, authority, or a ranking of people. Re-recording an address never earns endless glimmers.
- **Optional duet:** turn the prior Lu–Paula alternating odd/even demonstration on or off. Free-choice reading is the default. Rooms created by the new prototype declare `assignment_strategy: free-witness`; a duet is a chosen *game*, not the contribution ontology.

No badge creates a debt, restricts a reader, certifies theological accuracy, or proves the contributor's identity. No audio recording, passage address or prior take is removed to improve a score.

## Data and provenance

Source recordings remain in WITNESS IndexedDB and (when available) the original WITNESS Supabase room. The gameplay engine reads the existing immutable `recording_id`, `verse`, `reader_slot`, declared reader, `text_edition_id`, `sha256` and source timestamps. Imported and remote copies of the same recording ID are deduplicated. Contributor identity cannot be inferred from a name or slot. When WITNESS is offline, gameplay still works with the local recordings.

A separate localStorage key `witness.local-playback.v1` holds only bounded device playback receipts (recording ID, declared SHA-256, completion timestamp). No private audio, Bible text or shared-room invitation capability is stored in this game key.

The **game review packet** is `static-collective.witness-freeplay-review.v1`. It exposes a bounded metadata overview with explicitly zero Deeds, Harvests or Capacity. It is not an authenticated evidence bundle, does not include audio, does not include the WITNESS shared-room invitation UUID, and cannot itself authorize Full Measure transitions.

## Connection to THE PACT and Full Measure

A player can export the existing WITNESS `witness-package` v1 audio backup. In their private THE PACT room, they may open the WITNESS tab, import the backup, verify audio digests locally, and explicitly link a selected recording reference. THE PACT does not upload the WITNESS audio; it stores only chosen metadata and optional separate-seat peer listening reports. PACT's voluntary quests and rewards are not a recording publishing prerequisite.

Full Measure may later review the voluntary contribution as a **Gift candidate** via [read-only WITNESS audio lens PR #59](https://github.com/the-static-collective/full-measure-world-layer/pull/59). Only Full Measure's independent owner-governed human receipt process can award real-world Deeds/Harvests/Capacity; neither WITNESS, THE PACT, nor a hash can do that on its behalf.

## Next campaign doors

The next chapter progression should grow outward from `matthew.5` to Matthew 6 and 7, then to passage-addressed whole-book journeys. Potential higher-level systems are a Listener's Path, Community Mosaic Conductor, Free Reader's Library, seasonal gatherings, and optional narrated radio-book-club episodes. Every world expansion must preserve the **Free Witness** law and text/edition/rights provenance.

## Validation

Run `node --test prototype/game.test.mjs` (Node 18+). Nine deterministic cases cover empty state, duplicate import/sync receipts, repeated passages, cross-voice mosaic, matched local playback hashes, invalid addresses, opening suggestions, full-chapter completion, metadata-only export and zero Full Measure awards. The nine cases also passed direct execution as JavaScript fixture assertions in the authoring session. Complete interactive mobile recording / shared-room testing remains to be performed.
