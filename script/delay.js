function createDelay(){
  const input = audioCtx.createGain();
  const dryGain = audioCtx.createGain();
  const wetGain = audioCtx.createGain();
  const splitter = audioCtx.createChannelSplitter(2);
  const merger = audioCtx.createChannelMerger(2);
  const nodeL = audioCtx.createDelay(2.1);
  const nodeR = audioCtx.createDelay(2.1);
  const feedback = audioCtx.createGain();
  const output = audioCtx.createGain();

  input.connect(dryGain);
  input.connect(wetGain);

  wetGain.connect(splitter);
  splitter.connect(nodeL, 0);
  splitter.connect(nodeR, 1);
  nodeL.connect(merger, 0, 0);
  nodeR.connect(merger, 0, 1);

  merger.connect(feedback);
  feedback.connect(splitter);

  dryGain.connect(output);
  merger.connect(output);

  return {
    input,
    dryGain,
    wetGain,
    nodeL,
    nodeR,
    feedback,
    output
  }
}

function setupDelay(){
  delay = createDelay();

  delay.nodeL.delayTime.value = baseDelayTime + 0.002;
  delay.nodeR.delayTime.value = baseDelayTime + 0.020;
  delay.feedback.gain.value = baseDelayFeedback;
  delay.wetGain.gain.value = baseDelaySend;

  delay.output.connect(reverb.input);
}

function setDelayTime(v){
  delay.nodeL.delayTime.setTargetAtTime(v + 0.002, audioCtx.currentTime, 0.01);
  delay.nodeR.delayTime.setTargetAtTime(v + 0.020, audioCtx.currentTime, 0.01);
}

function setDelayFeedback(v){
  delay.feedback.gain.setTargetAtTime(v, audioCtx.currentTime, 0.01);
}

function setDelaySend(v){
  const now = audioCtx.currentTime;
  delay.wetGain.gain.cancelScheduledValues(now);
  delay.wetGain.gain.setTargetAtTime(v, now, 0.01);
}

function boostDelayFeedback() {
  if (!audioCtx) return;
  if (!isRunning) return;

  const now = audioCtx.currentTime;
  delay.wetGain.gain.cancelScheduledValues(now);
  delay.wetGain.gain.setTargetAtTime(baseDelaySend, now, 0.01);
  delay.wetGain.gain.setTargetAtTime(0.0, now + 0.01, baseDelayTime);
}
