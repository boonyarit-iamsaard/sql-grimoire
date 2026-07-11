// WebAudio-synthesized sounds (stand-ins for button-click.ogg /
// mission-complete.ogg — no audio files needed for the prototype).
let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") {
      void ctx.resume();
    }
    return ctx;
  } catch {
    return null;
  }
}

function tone(
  ac: AudioContext,
  freq: number,
  start: number,
  duration: number,
  gain: number,
  type: OscillatorType,
) {
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(gain, ac.currentTime + start);
  g.gain.exponentialRampToValueAtTime(
    0.0001,
    ac.currentTime + start + duration,
  );
  osc.connect(g).connect(ac.destination);
  osc.start(ac.currentTime + start);
  osc.stop(ac.currentTime + start + duration);
}

export function playClick() {
  const ac = audio();
  if (ac) {
    tone(ac, 620, 0, 0.07, 0.12, "triangle");
  }
}

export function playMissionComplete() {
  const ac = audio();
  if (!ac) {
    return;
  }
  // Little victory arpeggio: C5 E5 G5 C6.
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
    tone(ac, f, i * 0.13, 0.35, 0.14, "triangle");
  });
  tone(ac, 261.63, 0.39, 0.6, 0.08, "sine");
}
