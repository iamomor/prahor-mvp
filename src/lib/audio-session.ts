type AudioOwner = { id: symbol; stop(): void };
let active: AudioOwner | null = null;

/** Browser-page PROHOR ownership only; never cancel unrelated audio when idle. */
export function claimAudioSession(owner: AudioOwner) {
  if (active && active.id !== owner.id) {
    // The previous controller checks ownership before cancelling browser speech.
    // Keep it the owner until its stop handler has completed.
    const previous = active; previous.stop();
  }
  active = owner;
}
export function ownsAudioSession(id: symbol) { return active?.id === id; }
export function releaseAudioSession(id: symbol) { if (ownsAudioSession(id)) active = null; }
