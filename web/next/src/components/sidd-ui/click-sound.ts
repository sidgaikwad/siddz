let ctx: AudioContext | null = null

// Synthesized mechanical-key click: a filtered noise tick plus a short low "thock". No audio files.
export function playClick(pitch = 1, volume = 0.5) {
  if (typeof window === "undefined") return
  ctx ??= new AudioContext()
  if (ctx.state === "suspended") void ctx.resume()
  const t = ctx.currentTime

  const length = Math.floor(ctx.sampleRate * 0.03)
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 4)
  const noise = ctx.createBufferSource()
  noise.buffer = buffer
  const band = ctx.createBiquadFilter()
  band.type = "bandpass"
  band.frequency.value = 3200 * pitch
  band.Q.value = 1.2
  const noiseGain = ctx.createGain()
  noiseGain.gain.value = volume
  noise.connect(band).connect(noiseGain).connect(ctx.destination)
  noise.start(t)

  const osc = ctx.createOscillator()
  osc.type = "triangle"
  osc.frequency.setValueAtTime(190 * pitch, t)
  osc.frequency.exponentialRampToValueAtTime(60, t + 0.08)
  const oscGain = ctx.createGain()
  oscGain.gain.setValueAtTime(volume * 0.7, t)
  oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.09)
  osc.connect(oscGain).connect(ctx.destination)
  osc.start(t)
  osc.stop(t + 0.1)
}
