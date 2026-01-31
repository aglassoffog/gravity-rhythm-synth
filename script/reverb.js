function generateImpulse(duration = 3, decay = 2) {
  const rate = audioCtx.sampleRate;
  const length = rate * duration;
  const impulse = audioCtx.createBuffer(2, length, rate);

  for (let ch = 0; ch < 2; ch++) {
    const data = impulse.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
  }
  return impulse;
}

function generateHallImpulse(duration = 4, decay = 3) {
  duration = Math.max(0.1, Number(duration) || 0.1);

  const rate = audioCtx.sampleRate;
  const length = Math.floor(rate * duration);
  const impulse = audioCtx.createBuffer(2, length, rate);

  for (let ch = 0; ch < 2; ch++) {
    const data = impulse.getChannelData(ch);

    for (let i = 0; i < length; i++) {
      const t = i / length;

      // 後半が強い Hall 用エンベロープ
      const env = Math.pow(1 - t, decay) * (0.3 + 0.7 * Math.sin(t * Math.PI));

      // 高域が徐々に減る
      const damping = 1 - t * 0.6;

      data[i] = (Math.random() * 2 - 1) * env * damping;
    }
  }

  return impulse;
}

function createReverb(){
  const input = audioCtx.createGain();
  const dryGain = audioCtx.createGain();
  const wetGain = audioCtx.createGain();
  const convolver = audioCtx.createConvolver();
  const tone = audioCtx.createBiquadFilter();
  const output = audioCtx.createGain();

  // const preDelay = audioCtx.createDelay(0.1); // 最大100ms
  // preDelay.delayTime.value = 0.04;       // 初期値 20ms

  input.connect(dryGain);
  input.connect(convolver);
  // preDelay.connect(convolver);
  convolver.connect(tone);
  tone.connect(wetGain);

  dryGain.connect(output);
  wetGain.connect(output);

  return {
    input,
    dryGain,
    convolver,
    tone,
    wetGain,
    output
  };
}

function createCosmicReverb(){
  const input = audioCtx.createGain();
  const dryGain = audioCtx.createGain();
  const wetGain = audioCtx.createGain();
  const convolver = audioCtx.createConvolver();
  const shimmerDelay = audioCtx.createDelay();
  const shimmerGain = audioCtx.createGain();
  const tone = audioCtx.createBiquadFilter();
  const output = audioCtx.createGain();

  shimmerDelay.delayTime.value = 0.015;
  shimmerGain.gain.value = 0.4;

  input.connect(dryGain);
  input.connect(convolver);

  convolver.connect(tone);
  tone.connect(shimmerDelay);
  shimmerDelay.connect(shimmerGain);
  shimmerGain.connect(convolver);
  convolver.connect(wetGain);

  dryGain.connect(output);
  wetGain.connect(output);

  return {
    input,
    dryGain,
    convolver,
    tone,
    wetGain,
    output
  };

}

function createNebulaReverb() {
  const input = audioCtx.createGain();
  const dryGain = audioCtx.createGain();
  const wetGain = audioCtx.createGain();
  const preDelay = audioCtx.createDelay(1.0);
  const convolver = audioCtx.createConvolver();
  const tone = audioCtx.createBiquadFilter();
  const output = audioCtx.createGain();
  const lfo = audioCtx.createOscillator();
  const lfoGain = audioCtx.createGain();

  // 初期値
  preDelay.delayTime.value = 0.06;
  lfo.frequency.value = 0.08;
  lfoGain.gain.value = 0.02;

  input.connect(dryGain);
  input.connect(preDelay);

  lfo.connect(lfoGain);
  lfoGain.connect(preDelay.delayTime);
  lfo.start();

  preDelay.connect(convolver);
  convolver.connect(tone);
  tone.connect(wetGain);

  dryGain.connect(output);
  wetGain.connect(output);

  return {
    input,
    wetGain,
    convolver,
    tone,
    lfo,
    lfoGain,
    preDelay,
    output
  };
}


function setupReverb(){
  reverb = createReverb();
  // reverb = createCosmicReverb();
  // reverb = createNebulaReverb();

  reverb.convolver.buffer = generateHallImpulse(baseReverbDecay, 2);
  // hall
  reverb.tone.type = "lowpass";
  reverb.tone.frequency.value = baseReverbTone;
  // cosmic
  // reverb.tone.type = "highpass";
  // reverb.tone.frequency.value = 600;

  reverb.wetGain.gain.value = baseReverbSend;

  // 出力
  reverb.output.connect(delay.input);
  // drawReverbBuffer(reverb.convolver.buffer);
}

function setReverbDecay(v) {
  reverb.convolver.buffer = generateHallImpulse(v, 2);
  // drawReverbBuffer(generateImpulse(v));
}

function setReverbTone(v) {
  reverb.tone.frequency.setTargetAtTime(
    v,
    audioCtx.currentTime,
    0.3
  );
}

function setReverbSend(v) {
  reverb.wetGain.gain.setTargetAtTime(
    v,
    audioCtx.currentTime,
    0.01
  );
}

function drawReverbBuffer(buffer) {
  if (!buffer) return;

  const canvas = document.getElementById("reverbCanvas");
  const ctx = reverbCanvas.getContext("2d");

  const data = buffer.getChannelData(0); // L ch
  const len = data.length;

  ctx.clearRect(0, 0, reverbCanvas.width, reverbCanvas.height);

  ctx.strokeStyle = "#7aa2ff"; // ネオン系
  ctx.lineWidth = 1;
  ctx.beginPath();

  for (let i = 0; i < reverbCanvas.width; i++) {
    const index = Math.floor(i / reverbCanvas.width * len);
    const v = data[index]; // -1.0〜1.0

    const y = reverbCanvas.height / 2 - v * reverbCanvas.height / 2;

    if (i === 0) ctx.moveTo(i, y);
    else ctx.lineTo(i, y);
  }

  ctx.stroke();
}
