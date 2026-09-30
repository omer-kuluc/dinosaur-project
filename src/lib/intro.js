// Shared handshake between the timeline intro and the hero: the hero's own
// entrance waits until the intro starts to hand over.
let release
export const introDone = new Promise((r) => {
  release = r
})
export const finishIntro = () => release()
