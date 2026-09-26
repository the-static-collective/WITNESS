# Witness Law

WITNESS separates **what the text says**, **which textual edition is being used**, **who read it**, and **what was recorded**.

## Contribution law

A contributor may add a reading only when the submission declares:

- passage address
- text edition / translation identifier
- recording artifact
- contribution timestamp
- permission/license for the recording
- whether the reader identity is public, pseudonymous, anonymous, or undisclosed

A contributor may later withdraw public availability where policy permits, but the system must not rewrite provenance to imply the recording never existed.

## Interpretation boundary

Commentary, prayer, music, testimony, dramatic interpretation, translation discussion, and annotations may eventually coexist with WITNESS, but they must be typed as such. They must never be silently presented as the underlying Scripture text.

## Corrections

If a reader misreads a passage, the preferred correction is:

```
old recording
   └── superseded_by → new recording
```

The old artifact can become unavailable while its historical relationship remains representable.

## Rights boundary

WITNESS must treat rights as part of provenance.

A recording being user-created does not automatically grant rights to redistribute the underlying translation text. Genesis therefore stores translation identifiers and rights metadata separately and bundles no translation corpus by default.
