# Judgment OS Baton Field v0

This branch is the first semantic transplant probe into the `igorski/rts` donor.

## Hard boundary

The RTS renderer and Pinia stores are projection/input machinery only. Canonical truth lives in Judgment OS events and reduced canonical state.

Flow:

`events -> reduceEvents() -> canonical state -> projectBatonField() -> disposable projection -> renderer`

Interaction returns as:

`renderer -> WorldCommand -> validateCommand() -> canonical event/rejection -> reproject`

## First playable checkpoint

The live fixture currently ends at a real BLOCK state for `dep_projection_adapter`.

Expected field semantics:
- builder owns `baton_bf_001`
- race is BLOCKED
- finish route is unavailable
- `REQUEST_CLOSE` is rejected with `finish_evidence_missing`

Next implementation lap: wire this projection into one donor RTS scenario without allowing the renderer/store to directly mutate canonical state.
