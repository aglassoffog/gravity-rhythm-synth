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

function createDeepHallImpulse(duration = 6.0, decay = 4.5, hfDamp = 0.6) {

  const rate = audioCtx.sampleRate;
  const length = rate * duration;
  const impulse = audioCtx.createBuffer(2, length, rate);

  for (let ch = 0; ch < 2; ch++) {
    const data = impulse.getChannelData(ch);

    for (let i = 0; i < length; i++) {
      const t = i / length;

      let noise = Math.random() * 2 - 1;

      // 低域残す / 高域減衰
      noise *= Math.pow(1 - t, decay);
      noise *= 1 - t * hfDamp;

      data[i] = noise;
    }
  }
  return impulse;
}

function createReverb(){
  const input = audioCtx.createGain();
  const dryGain = audioCtx.createGain();
  const wetGain = audioCtx.createGain();
  const merger1 = audioCtx.createChannelMerger(2);
  const merger2 = audioCtx.createChannelMerger(2);
  const convolver = audioCtx.createConvolver();
  const tone = audioCtx.createBiquadFilter();
  const output = audioCtx.createGain();

  const earlyDelayL = audioCtx.createDelay();
  const earlyDelayR = audioCtx.createDelay();
  const earlyGain = audioCtx.createGain();
  const preDelayL = audioCtx.createDelay();
  const preDelayR = audioCtx.createDelay();

  input.connect(dryGain);
  input.connect(wetGain);

  wetGain.connect(earlyDelayL, 0);
  wetGain.connect(earlyDelayR, 0);
  earlyDelayL.connect(merger1, 0, 0);
  earlyDelayR.connect(merger1, 0, 1);
  merger1.connect(earlyGain);

  // wetGain.connect(convolver);
  wetGain.connect(preDelayL, 0);
  wetGain.connect(preDelayR, 0);
  preDelayL.connect(merger2, 0, 0);
  preDelayR.connect(merger2, 0, 1);
  merger2.connect(convolver);
  convolver.connect(tone);

  dryGain.connect(output);
  earlyGain.connect(output);
  tone.connect(output);

  return {
    input,
    dryGain,
    earlyDelayL,
    earlyDelayR,
    earlyGain,
    preDelayL,
    preDelayR,
    convolver,
    tone,
    wetGain,
    output
  };
}

function setupReverb(){
  reverb = createReverb();
  // reverb = createCosmicReverb();
  // reverb = createNebulaReverb();

  reverb.earlyDelayL.delayTime.value = 0.026; // 初期値 25ms
  reverb.earlyDelayR.delayTime.value = 0.044;
  reverb.earlyGain.gain.value = 0.8;
  reverb.preDelayL.delayTime.value = 0.062; // 初期値 60ms
  reverb.preDelayR.delayTime.value = 0.078;

  // reverb.convolver.buffer = generateHallImpulse(baseReverbDecay, 2);
  reverb.convolver.buffer = createDeepHallImpulse(baseReverbDecay);

  // hall
  // reverb.tone.type = "lowpass";
  // reverb.tone.frequency.value = baseReverbTone; // 4500
  // deep hall
  reverb.tone.type = "lowshelf";
  reverb.tone.frequency.value = baseReverbTone; // 250
  reverb.tone.gain.value = 3;
  // cosmic
  // reverb.tone.type = "highpass";
  // reverb.tone.frequency.value = 600;

  reverb.wetGain.gain.value = baseReverbSend;

  // 出力
  reverb.output.connect(master);
  // drawBuffer(reverbCanvas, reverb.convolver.buffer);
}

function setReverbDecay(v) {
  // reverb.convolver.buffer = generateHallImpulse(v, 2);
  reverb.convolver.buffer = createDeepHallImpulse(baseReverbDecay);
  // drawBuffer(reverbCanvas, reverb.convolver.buffer);
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
