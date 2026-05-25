import { Howl, Howler } from 'howler'

const NIGHT_AMBIENCE_URL = '/audio/wind.mp3'
const TARGET_VOLUME = 0.2
const INTRO_FADE_MS = 3500
const LOOP_CROSSFADE_SEC = 2.5

type Slot = 'a' | 'b'

function animateVolume(
  howl: Howl,
  from: number,
  to: number,
  durationMs: number,
  onDone?: () => void,
) {
  const start = performance.now()

  const step = (now: number) => {
    const progress = Math.min((now - start) / durationMs, 1)
    howl.volume(from + (to - from) * progress)
    if (progress < 1) {
      requestAnimationFrame(step)
    } else if (onDone) {
      onDone()
    }
  }

  requestAnimationFrame(step)
}

class CrossfadeAmbience {
  private readonly howlA: Howl
  private readonly howlB: Howl
  private active: Slot = 'a'
  private durationSec = 0
  private running = false
  private crossfading = false
  private monitorId: number | null = null
  private introDone = false
  private crossfadeArmed = true

  constructor(src: string) {
    Howler.autoUnlock = true

    const options = {
      src: [src],
      loop: false,
      volume: 0,
      preload: true,
      html5: false,
    }

    this.howlA = new Howl(options)
    this.howlB = new Howl(options)

    this.howlA.on('loaderror', (_id, error) => {
      console.warn('Laika mission: wind ambience failed to load', error)
    })

    this.howlA.on('end', () => this.handleTrackEnded('a'))
    this.howlB.on('end', () => this.handleTrackEnded('b'))
  }

  private slotHowl(slot: Slot): Howl {
    return slot === 'a' ? this.howlA : this.howlB
  }

  private getActive(): Howl {
    return this.slotHowl(this.active)
  }

  private getInactive(): Howl {
    return this.active === 'a' ? this.howlB : this.howlA
  }

  private audibleVolume(): number {
    return isMuted ? 0 : TARGET_VOLUME
  }

  private waitForReady(onReady: () => void) {
    const check = () => {
      const duration = this.howlA.duration()
      if (duration > 0) {
        this.durationSec = duration
        onReady()
        return
      }
      window.setTimeout(check, 40)
    }

    if (this.howlA.state() === 'loaded') {
      check()
      return
    }

    this.howlA.once('load', check)
    this.howlA.load()
    this.howlB.load()
  }

  start() {
    if (this.running) {
      this.applyVolume()
      this.ensureSomethingPlaying()
      return
    }

    const boot = () => {
      this.waitForReady(() => {
        this.running = true
        this.crossfadeArmed = true

        const track = this.getActive()
        track.seek(0)
        track.volume(0)
        track.play()

        const target = this.audibleVolume()
        if (!this.introDone && target > 0) {
          animateVolume(track, 0, target, INTRO_FADE_MS)
          this.introDone = true
        } else {
          track.volume(target)
        }

        this.monitor()
      })
    }

    if (Howler.ctx && Howler.ctx.state === 'suspended') {
      void Howler.ctx.resume().then(boot)
    } else {
      boot()
    }
  }

  private handleTrackEnded(slot: Slot) {
    if (!this.running || this.crossfading || slot !== this.active) {
      return
    }

    this.beginCrossfade()
  }

  private monitor() {
    if (this.monitorId !== null) {
      cancelAnimationFrame(this.monitorId)
    }

    const tick = () => {
      if (!this.running) {
        return
      }

      if (Howler.ctx && Howler.ctx.state === 'suspended') {
        void Howler.ctx.resume()
      }

      const active = this.getActive()
      const position = active.seek() as number
      const duration = this.durationSec || active.duration()

      if (
        this.crossfadeArmed &&
        !this.crossfading &&
        duration > LOOP_CROSSFADE_SEC * 2 &&
        active.playing() &&
        position > 0.05 &&
        position >= duration - LOOP_CROSSFADE_SEC
      ) {
        this.beginCrossfade()
      }

      this.ensureSomethingPlaying()

      this.monitorId = requestAnimationFrame(tick)
    }

    this.monitorId = requestAnimationFrame(tick)
  }

  private ensureSomethingPlaying() {
    if (!this.running || this.crossfading) {
      return
    }

    if (this.howlA.playing() || this.howlB.playing()) {
      return
    }

    const track = this.getActive()
    track.seek(0)
    track.volume(this.audibleVolume())
    track.play()
    this.crossfadeArmed = true
  }

  private beginCrossfade() {
    if (this.crossfading || !this.running) {
      return
    }

    this.crossfading = true
    this.crossfadeArmed = false

    const outgoing = this.getActive()
    const incoming = this.getInactive()
    const target = this.audibleVolume()
    const crossfadeMs = LOOP_CROSSFADE_SEC * 1000
    const nextSlot: Slot = this.active === 'a' ? 'b' : 'a'

    incoming.seek(0)
    incoming.volume(0)

    const playId = incoming.play()
    if (playId === undefined) {
      incoming.once('load', () => incoming.play())
    }

    const fromOut = outgoing.playing() ? outgoing.volume() : target
    const start = performance.now()

    const step = (now: number) => {
      if (!this.running) {
        this.crossfading = false
        return
      }

      const progress = Math.min((now - start) / crossfadeMs, 1)
      incoming.volume(target * progress)

      if (outgoing.playing()) {
        outgoing.volume(fromOut * (1 - progress))
      }

      if (progress < 1) {
        requestAnimationFrame(step)
      } else {
        outgoing.pause()
        outgoing.volume(0)
        incoming.volume(target)

        if (!incoming.playing()) {
          incoming.play()
        }

        this.active = nextSlot
        this.crossfading = false
        this.crossfadeArmed = true
      }
    }

    requestAnimationFrame(step)
  }

  applyVolume() {
    if (this.crossfading) {
      return
    }

    const target = this.audibleVolume()
    this.howlA.volume(this.active === 'a' ? target : 0)
    this.howlB.volume(this.active === 'b' ? target : 0)
  }

  silence() {
    this.howlA.volume(0)
    this.howlB.volume(0)
  }

  stop() {
    this.running = false
    this.crossfading = false
    this.crossfadeArmed = false

    if (this.monitorId !== null) {
      cancelAnimationFrame(this.monitorId)
      this.monitorId = null
    }

    this.howlA.stop()
    this.howlB.stop()
  }

  unload() {
    this.stop()
    this.howlA.unload()
    this.howlB.unload()
    this.introDone = false
  }
}

let player: CrossfadeAmbience | null = null
let isMuted = false

function getPlayer(): CrossfadeAmbience {
  if (!player) {
    player = new CrossfadeAmbience(NIGHT_AMBIENCE_URL)
  }
  return player
}

export function startLaikaAmbience() {
  getPlayer().start()
}

export function silenceLaikaAmbience() {
  getPlayer().silence()
}

export function setLaikaAmbienceMuted(muted: boolean) {
  isMuted = muted
  if (player) {
    player.applyVolume()
  }
}

export function destroyLaikaAmbience() {
  if (!player) {
    return
  }

  player.unload()
  player = null
  isMuted = false
}
