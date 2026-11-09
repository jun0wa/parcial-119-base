// Sonido de alarma/notificación de emergencia con Web Audio API.
// Duración fija controlada (2.2 segundos, menor a 3 segundos).
// Se corta de inmediato si el usuario apaga la baliza antes.

let audioCtx = null

export function reproducirSonidoAlarma(duracionSegundos = 2.2, onFinalizar = null) {
  try {
    const AudioCtxClass = window.AudioContext || window.webkitAudioContext
    if (!AudioCtxClass) {
      if (onFinalizar) onFinalizar()
      return () => {}
    }

    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new AudioCtxClass()
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume()
    }

    const t0 = audioCtx.currentTime
    // Garantizamos que no exceda 2.5s (menor a 3 segundos)
    const duracion = Math.min(duracionSegundos, 2.5)
    const tFin = t0 + duracion

    const masterGain = audioCtx.createGain()
    masterGain.gain.setValueAtTime(0.0001, t0)
    masterGain.gain.linearRampToValueAtTime(0.3, t0 + 0.05)
    masterGain.gain.setValueAtTime(0.3, Math.max(t0 + 0.1, tFin - 0.15))
    masterGain.gain.exponentialRampToValueAtTime(0.0001, tFin)

    const filter = audioCtx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(2400, t0)

    const osc1 = audioCtx.createOscillator()
    osc1.type = 'sawtooth'

    const osc2 = audioCtx.createOscillator()
    osc2.type = 'sine'

    // 3 pulsos continuos y definidos tipo sirena de notificación (0.73s cada uno)
    const periodo = duracion / 3
    for (let i = 0; i < 3; i++) {
      const inicio = t0 + i * periodo
      const pico = inicio + periodo * 0.5
      const fin = inicio + periodo

      osc1.frequency.setValueAtTime(700, Math.min(inicio, tFin))
      if (pico < tFin) osc1.frequency.linearRampToValueAtTime(1250, pico)
      if (fin <= tFin) osc1.frequency.linearRampToValueAtTime(700, fin)
      else osc1.frequency.linearRampToValueAtTime(700, tFin)

      osc2.frequency.setValueAtTime(350, Math.min(inicio, tFin))
      if (pico < tFin) osc2.frequency.linearRampToValueAtTime(625, pico)
      if (fin <= tFin) osc2.frequency.linearRampToValueAtTime(350, fin)
      else osc2.frequency.linearRampToValueAtTime(350, tFin)
    }

    osc1.connect(filter)
    osc2.connect(filter)
    filter.connect(masterGain)
    masterGain.connect(audioCtx.destination)

    osc1.start(t0)
    osc2.start(t0)
    osc1.stop(tFin)
    osc2.stop(tFin)

    let timerId = setTimeout(() => {
      if (onFinalizar) onFinalizar()
    }, duracion * 1000)

    return () => {
      if (timerId) clearTimeout(timerId)
      try {
        const ahora = audioCtx.currentTime
        masterGain.gain.cancelScheduledValues(ahora)
        masterGain.gain.linearRampToValueAtTime(0.0001, ahora + 0.03)
        setTimeout(() => {
          try {
            osc1.stop()
            osc2.stop()
          } catch (e) {}
        }, 40)
      } catch (e) {}
    }
  } catch (err) {
    console.warn('Error al reproducir sonido de alarma:', err)
    if (onFinalizar) onFinalizar()
    return () => {}
  }
}
