// One-player-at-a-time: every player announces itself, every other player pauses.
export const PLAY_EVENT = 'cmp:play'

export function announcePlay(id: string) {
  window.dispatchEvent(new CustomEvent(PLAY_EVENT, { detail: id }))
}

export function onOtherPlay(id: string, pause: () => void) {
  const handler = (e: Event) => { if ((e as CustomEvent).detail !== id) pause() }
  window.addEventListener(PLAY_EVENT, handler)
  return () => window.removeEventListener(PLAY_EVENT, handler)
}
