# GENESIS-001 — Community Audio Bible

## Purpose

WITNESS is a place where people can listen to Scripture and contribute human readings of addressable passages.

The first implementation should make one move well:

**choose a passage → hear a witness → leave a witness**

It is not a crowd-edited Bible. Contributions attach to a textual witness; they do not silently redefine it.

## Layer contract

```
SCRIPTURE WITNESS
  └── TRANSLATION / TEXT EDITION
        └── PASSAGE ADDRESS
              └── READING
                    └── READER
                          └── RECORDING
                                └── RELATIONS
```

Each layer remains independently inspectable.

### Scripture witness
Identifies the textual/canonical scope being addressed.

### Translation / text edition
Identifies the exact edition or translation a reader used. Rights and provenance belong here.

### Passage address
A durable locator such as `john.1.1` or a contiguous range. Addressing must not depend on one translation's wording.

### Reading
The declared relationship between a reader, a passage address, and a text edition.

### Reader
A person or community identity. Anonymous and pseudonymous contribution can be supported without pretending identity facts are known.

### Recording
An immutable submitted audio artifact plus provenance. Corrections create new recordings; they do not silently rewrite history.

### Relations
Optional later structures: playlist membership, language, alternate take, response, inheritance, chapter assembly, annotations, or other declared links.

## Genesis invariants

1. **Text is not changed by audio contribution.**
2. **Every recording points to an explicit passage address and text edition.**
3. **Recording provenance is append-only.** Replacement means a new recording with a relation to the old one.
4. **Unknown stays unknown.** Do not infer identity, location, language, consent, or textual edition.
5. **Listening requires less ceremony than contributing.**
6. **A complete communal reading may be assembled from many partial witnesses.**
7. **No copyrighted Bible text or audio is bundled without compatible rights.**
8. **Moderation removes availability; it does not falsify historical provenance.**

## Smallest viable experience

### Listen
- Open a passage.
- Hear one available human reading.
- Move continuously through a chapter even when the speaker changes.
- Optionally switch assembly strategies later: one reader, community mosaic, language, random walk, etc.

### Contribute
- Pick a passage address.
- Declare the translation / edition used.
- Record or upload audio.
- Review the recording.
- Publish it with an explicit contribution license/permission.
- Receive a permanent recording ID and provenance receipt.

## Deliberately postponed

- theological ranking
- popularity ranking
- AI-generated scripture voices
- automatic claims about speaker identity
- a single mandated Bible translation
- social follower mechanics
- destructive editing of published recordings
- interpretation presented as scripture

The first crater should prove that many people can produce one continuous audible traversal without collapsing their individual witness records.


## Canonical contribution law

See [CANON-001 — FREE WITNESS](CANON-001-FREE-WITNESS.md).

> **WITNESS does not distribute Scripture among people. People approach Scripture freely. WITNESS preserves what they leave there and composes from abundance.**

The alternating-reader prototype is one bounded collaboration experiment, not the core contribution ontology.
