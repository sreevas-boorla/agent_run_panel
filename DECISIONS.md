DECISIONS
=========

- Cancellation Colour (Amber-400):
  - Chosen to signal completion with nuance rather than alarm. Amber provides a soft, non-alarmist cue compared to red/rose which conveys an error. In financial workflows 'sufficient data' or 'cancelled due to goal reached' should feel deliberate — amber provides that middle ground.

- Normalized State Shape:
  - Tasks are stored in a `TasksById` normalized map for O(1) lookups and efficient dependency resolution. This avoids deep tree traversals on each event and simplifies updates in reducers, which is critical for a realtime stream of partial outputs.

- Replay & Subscription Model:
  - The emitter exposes `startReplay` with jitter and speed control to simulate realistic timing. Subscriptions are plain callbacks to avoid heavy runtime dependencies while making the pattern easy to reason about and test.

- Transition Guards:
  - The reducer uses guarded transitions (see `AllowedTaskTransitions`) to avoid flicker. Composite transitions such as `failed -> retry_backoff -> running` are allowed programmatically to skip unnecessary UI states where sensible.
