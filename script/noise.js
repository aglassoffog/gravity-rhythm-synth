let pinkNoise;

function createWhiteNoise(duration, strength){

  const bufferSize = audioCtx.sampleRate * duration;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * strength;
  }

  return buffer;
}

function createPinkNoise(duration = 0.05, strength) {
  const bufferSize = audioCtx.sampleRate * duration;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);

  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

  for (let i = 0; i < data.length; i++) {
    const white = (Math.random() * 2 - 1);
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;
    data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
    data[i] *= 0.11;
    b6 = white * 0.115926;
  }

  return buffer;
}

function createBrownNoise(duration = 0.05, strength) {
  const bufferSize = audioCtx.sampleRate * duration;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);

  let last = 0;
  for (let i = 0; i < data.length; i++) {
    const white = (Math.random() * 2 - 1);
    last = (last + 0.02 * white) / 1.02;
    data[i] = last * 3.5;
  }

  return buffer;
}

function playNoise(){
  if (!audioCtx) return;
  if (!isRunning) return;

  const strength = 1;
  const duration = 2; // 50ms
  // const buffer = createWhiteNoise(duration, strength);
  // const buffer = createPinkNoise(duration, strength);
  const buffer = createBrownNoise(duration, strength);
  const noise = audioCtx.createBufferSource();
  noise.buffer = buffer;

  const noiseGain = audioCtx.createGain();
  noiseGain.gain.value = 0.08;
  
  noise.connect(noiseGain);
  noiseGain.connect(filter.input);

  noise.start();

  const now = audioCtx.currentTime;
  noiseGain.gain.setValueAtTime(0, now);
  noiseGain.gain.linearRampToValueAtTime(0.6 * strength, now + 0.005);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  noise.stop(now + duration);

  // drawBuffer(noiseCanvas, noise.buffer);
}

function playDust() {
  const grainCount = 12;
  const now = audioCtx.currentTime;

  for (let i = 0; i < grainCount; i++) {
    const noise = audioCtx.createBufferSource();
    noise.buffer = createWhiteNoise(0.015, 1);

    const gain = audioCtx.createGain();
    gain.gain.value = 0.03 + Math.random() * 0.03;

    const tone = audioCtx.createBiquadFilter();
    tone.type = "bandpass";
    tone.frequency.value = 800 + Math.random() * 3000;
    tone.Q.value = 6;

    noise.connect(tone);
    tone.connect(gain);
    gain.connect(filter.input);

    noise.start(now + Math.random() * 0.08);
    noise.stop(now + 0.12);
  }
}

function playWind() {
  if (!audioCtx) return;
  if (!isRunning) return;

  const noise = audioCtx.createBufferSource();
  noise.buffer = pinkNoise;

  const tone = audioCtx.createBiquadFilter();
  tone.type = "lowpass";
  tone.frequency.value = 1200;

  const gain = audioCtx.createGain();

  noise.connect(tone);
  tone.connect(gain);
  gain.connect(filter.input);

  const now = audioCtx.currentTime;
  gain.gain.setValueAtTime(baseNoiseGain, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 10);

  noise.start();
  noise.stop(now + 10);
}

function playClick() {
  if (!audioCtx) return;
  if (!isRunning) return;

  const clickOsc = audioCtx.createOscillator();
  const clickGain = audioCtx.createGain();

  clickOsc.type = "square";
  clickOsc.frequency.value = 2000;

  clickOsc.connect(clickGain);
  clickGain.connect(filter.input);

  const now = audioCtx.currentTime;
  clickGain.gain.setValueAtTime(baseNoiseGain, now);
  clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

  clickOsc.start();
  clickOsc.stop(now + 0.02);
}

function playCrystal() {
  if (!audioCtx) return;
  if (!isRunning) return;

  const freq = 1040;
  const carrierOsc = audioCtx.createOscillator();
  const modOsc = audioCtx.createOscillator();
  const modGain = audioCtx.createGain();
  const crystalGain = audioCtx.createGain();

  carrierOsc.type = "sine";
  modOsc.type = "sine";

  carrierOsc.frequency.value = freq;
  modOsc.frequency.value = freq * 2.7;
  modGain.gain.value = freq * 0.4;

  modOsc.connect(modGain);
  modGain.connect(carrierOsc.frequency);
  carrierOsc.connect(crystalGain);
  crystalGain.connect(filter.input);

  const now = audioCtx.currentTime;
  crystalGain.gain.setValueAtTime(baseNoiseGain, now);
  crystalGain.gain.exponentialRampToValueAtTime(0.0001, now + 4);

  carrierOsc.start();
  modOsc.start();
  carrierOsc.stop(now + 4);
  modOsc.stop(now + 4);
}

function playKarplusStrong(
  frequency = 220,
  // decay = 0.98,
  decay = 0.6,
  brightness = 2000
) {
  if (!audioCtx) return;
  if (!isRunning) return;

  // Noise burst
  const noise = audioCtx.createBufferSource();
  noise.buffer = createWhiteNoise(0.02, 1);

  // Delay = pitch
  const delay = audioCtx.createDelay();
  delay.delayTime.value = 1 / frequency;

  // Feedback
  const feedback = audioCtx.createGain();
  feedback.gain.value = decay;

  // Tone control
  const tone = audioCtx.createBiquadFilter();
  tone.type = "lowpass";
  tone.frequency.value = brightness;

  // Level
  const gain = audioCtx.createGain();
  gain.gain.value = 0.4;

  // Routing
  noise.connect(delay);
  delay.connect(tone);
  tone.connect(gain);
  gain.connect(filter.input);

  // Feedback loop
  tone.connect(feedback);
  feedback.connect(delay);

  const now = audioCtx.currentTime;

  noise.start(now);
  noise.stop(now + 0.02);
}

function setupNoise() {
  pinkNoise = createPinkNoise(6, 1);

}
