/* ---------- Global State ---------- */
let audioCtx = null;
let isRunning = false;
let wakeLock = null;

/* Poly voices */
const voices = new Map();

/* ADSR Envelope Parameters */
const envParams = {
  attack: parseFloat(attack.value),
  decay: parseFloat(decay.value),
  sustain: parseFloat(sustain.value),
  release: parseFloat(release.value)
};

const KEY_LIST = [
  { name: "C", key: "c", freq: 261.63 },
  { name: "D", key: "d", freq: 293.66 },
  { name: "E", key: "e", freq: 329.63 },
  { name: "F", key: "f", freq: 349.23 },
  { name: "G", key: "g", freq: 392.00 },
  { name: "A", key: "a", freq: 440.00 },
  { name: "B", key: "b", freq: 493.88 }
];

const waveformTypes = ["sine", "square", "sawtooth", "triangle"];
const keyState = {};
const noteState = {};
const waveformStates = {};

document.querySelectorAll(".key-btn").forEach(btn => {
  const key = btn.dataset.key;
  keyState[key] = key === 'c';
  noteState[key] = false;

  btn.onclick = () => {
    if (noteState[key]) {
      noteOff(key);
    }
    keyState[key] = !keyState[key];
    btn.classList.toggle("active", keyState[key]);
  }
});

document.querySelectorAll(".waveform-btn").forEach(btn => {
  const type = btn.dataset.waveform;
  waveformStates[type] = type === "sine";
  btn.onclick = () => {

    // 発音中ならその波形全て note off して無効化
    if (waveformStates[type]) {
      voices.forEach((v, key) => {
        if (v.waveform === type) {
          noteOff(key);
        }
      });
    }

    waveformStates[type] = !waveformStates[type];
    btn.classList.toggle("active", waveformStates[type]);
  };
});

function setNoteButtonState(key, on) {
  const btn = document.querySelector(`.key-btn[data-key="${key}"]`);
  if (!btn) return;
  btn.classList.toggle("playing", on);
}

function setWaveformPlaying(type, playing) {
  const btn = document.querySelector(`.waveform-btn[data-waveform="${type}"]`);
  if (!btn) return;
  btn.classList.toggle("playing", playing);
}

function isWaveformStillPlaying(type) {
  for (const v of voices.values()) {
    if (v.waveform === type) return true;
  }
  return false;
}

function triggerRandomNote() {
  // 有効なKEYボタン一覧
  const activeKeys = KEY_LIST.filter(k => keyState[k.key]);
  if (activeKeys.length === 0) return;

  const activeWaveforms = waveformTypes.filter(w => waveformStates[w]);
  if (activeWaveforms.length === 0) return;

  // ランダムに1つ選ぶ
  const k = activeKeys[Math.floor(Math.random() * activeKeys.length)];
  const w = activeWaveforms[Math.floor(Math.random() * activeWaveforms.length)];

  if (noteState[k.key]) {
    noteOff(k.key);
  } else {
    noteOn(k.key, k.freq, w);
  }
}

function onBallCollision(){
  if (baseNoiseType === "crystal") {
    playCrystal();
  } else if (baseNoiseType === "click") {
    playClick();
  }
}

function onSideWallCollision(wall){
  if (!isRunning) return;

  if (wall.label === "wall-left" || wall.label === "wall-right") {
    triggerRandomNote();
  } else if (wall.label === "wall-top" || wall.label === "wall-bottom") {
    if (yAssign.value === "delay") {
      boostDelayFeedback();
    }
  }
}

waveBtn.onclick = () => {wavePopup.classList.remove("hidden");}
wavePopup.addEventListener("pointerdown", e => {
  if (e.target === wavePopup) {
    wavePopup.classList.add("hidden");
  }
});

envBtn.onclick = () => {envPopup.classList.remove("hidden");}
envPopup.addEventListener("pointerdown", e => {
  if (e.target === envPopup) {
    envPopup.classList.add("hidden");
  }
});

filterBtn.onclick = () => {filterPopup.classList.remove("hidden");}
filterPopup.addEventListener("pointerdown", e => {
  if (e.target === filterPopup) {
    filterPopup.classList.add("hidden");
  }
});

delayBtn.onclick = () => {delayPopup.classList.remove("hidden");}
delayPopup.addEventListener("pointerdown", e => {
  if (e.target === delayPopup) {
    delayPopup.classList.add("hidden");
  }
});

reverbBtn.onclick = () => {reverbPopup.classList.remove("hidden");}
reverbPopup.addEventListener("pointerdown", e => {
  if (e.target === reverbPopup) {
    reverbPopup.classList.add("hidden");
  }
});

physicsBtn.onclick = () => {physicsPopup.classList.remove("hidden");}
physicsPopup.addEventListener("pointerdown", e => {
  if (e.target === physicsPopup) {
    physicsPopup.classList.add("hidden");
  }
});

noiseBtn.onclick = () => {noisePopup.classList.remove("hidden");}
noisePopup.addEventListener("pointerdown", e => {
  if (e.target === noisePopup) {
    noisePopup.classList.add("hidden");
  }
});

/* ---------- Audio Nodes ---------- */
let master;
let filter, phaser, delay, reverb;
let lfo, lfoGain;
let analyserL, analyserR;
let baseFilterType = filterType.value;
let baseFilterFreq = parseInt(filterFreq.value);
let baseFilterQ = parseFloat(filterQ.value);
let baseDelayTime = parseFloat(delayTime.value);
let baseDelayFeedback = parseFloat(delayFeedback.value);
let baseDelaySend = parseFloat(delaySend.value);
let baseReverbDecay = parseFloat(reverbDecay.value);
let baseReverbTone = parseInt(reverbTone.value);
let baseReverbSend = parseFloat(reverbSend.value);
let baseNoiseType = noiseType.value;

/* ---------- Envelope ---------- */
attack.oninput  = e => envParams.attack  = +e.target.value;
decay.oninput   = e => envParams.decay   = +e.target.value;
sustain.oninput = e => envParams.sustain = +e.target.value;
release.oninput = e => envParams.release = +e.target.value;

/* ---------- Filter ---------- */
filterType.onchange = e => {
  baseFilterType = e.target.value;
  if (!filter) return;
  setFilterType(baseFilterType);
};

filterFreq.oninput = e => {
  baseFilterFreq = parseInt(e.target.value);
  if (!filter) return;
  setFilterFreq(baseFilterFreq);
};

filterQ.oninput = e => {
  baseFilterQ = parseFloat(e.target.value);
  if (!filter) return;
  setFilterQ(baseFilterQ);
};

/* ---------- Delay ---------- */
delayTime.oninput = e => {
  baseDelayTime = parseFloat(e.target.value);
  if (!delay) return;
  setDelayTime(baseDelayTime);
};

delayFeedback.oninput = e => {
  baseDelayFeedback = parseFloat(e.target.value);
  if (!delay) return;
  setDelayFeedback(baseDelayFeedback);
};

delaySend.oninput = e => {
  baseDelaySend = parseFloat(e.target.value);
  if (!delay) return;
  setDelaySend(baseDelaySend);
};

/* ---------- Reverb ---------- */
reverbDecay.onchange = e => {
  baseReverbDecay = parseFloat(e.target.value);
  if (!reverb) return;
  setReverbDecay(baseReverbDecay);
};

reverbTone.oninput = e => {
  baseReverbTone = parseInt(e.target.value);
  if (!reverb) return;
  setReverbTone(baseReverbTone);
};

reverbSend.oninput = e => {
  baseReverbSend = parseFloat(e.target.value);
  if (!reverb) return;
  setReverbSend(baseReverbSend);
};

/* ---------- Physics ---------- */
ballSize.oninput = e => {
  const size = parseFloat(e.target.value);
  ballSizeVal.textContent = size;
  setBallRadius(size);
};

ballCount.oninput = e => {
  const count = parseFloat(e.target.value);
  ballCountVal.textContent = count;
  setBallCount(count);
};

gravity.oninput = e => {
  const g = parseFloat(e.target.value);
  gravityVal.textContent = g.toFixed(2);
  setGravity(g);
};

/* ---------- Noise ---------- */
noiseType.onchange = e => {
  baseNoiseType = e.target.value;
};

/* ---------- Audio Init ---------- */
async function initAudio() {
  if (audioCtx) return;

  audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  master = audioCtx.createGain();
  master.gain.value = 0.25;

  setupReverb();
  setupDelay();
  // setupPhaser();
  setupFilter();

  analyserL = audioCtx.createAnalyser();
  analyserR = audioCtx.createAnalyser();
  analyserL.fftSize = 2048;
  analyserR.fftSize = 2048;
  analyserL.smoothingTimeConstant = 0.8;
  analyserR.smoothingTimeConstant = 0.8;
  const splitter = audioCtx.createChannelSplitter(2);
  master.connect(splitter);
  splitter.connect(analyserL, 0);
  splitter.connect(analyserR, 1);

  const destination = audioCtx.createMediaStreamDestination();
  audioEl.srcObject = destination.stream;
  audioEl.play();
  master.connect(destination);

  /* LFO */
  lfo = audioCtx.createOscillator();
  lfo.frequency.value = 5;

  lfoGain = audioCtx.createGain();
  lfoGain.gain.value = 0;

  lfo.connect(lfoGain);
  lfo.start();

  await audioCtx.resume();

  drawLoop();
  modLoop();
}
initPhysics();

/* ---------- Modulation Loop ---------- */
function modLoop() {
  if (!audioCtx) return;

  const y = yNorm();
  const now = audioCtx.currentTime;

  if (yAssign.value === "pitch") {
    voices.forEach(v => {
        v.osc.frequency.setValueAtTime(v.baseFreq * Math.pow(2, 0.5 - y), now);
    });
  }
  else if (yAssign.value === "vibrato") {
    lfoGain.gain.value = y * 20;
  }
  else if (yAssign.value === "filter") {
    const cutoff = 200 + (1 - y) * 12000;
    setFilterFreq(cutoff);
  }
  requestAnimationFrame(modLoop);
}

yAssign.onchange = () => {
  if (!audioCtx) return;

  const now = audioCtx.currentTime;

  if (yAssign.value !== "pitch") {
    voices.forEach(v => {
      v.osc.frequency.setValueAtTime(v.baseFreq, now);
    });
  }

  if (yAssign.value !== "vibrato") {
      lfoGain.gain.value = 0;
  }

  if (yAssign.value !== "filter") {
    setFilterFreq(baseFilterFreq);
  }

  if (yAssign.value === "delay") {
    setDelaySend(0.0);
  } else {
    setDelaySend(baseDelaySend);
  }
};

/* ---------- Note Handling ---------- */
function noteOn(key, freq, waveform) {
  if (!isRunning || voices.has(key)) return;

  const osc = audioCtx.createOscillator();
  osc.type = waveform;
  osc.frequency.value = freq;

  const env = audioCtx.createGain();
  env.gain.value = 0;

  osc.connect(env);
  env.connect(filter.input);
  lfoGain.connect(osc.frequency);

  osc.start();

  const now = audioCtx.currentTime;
  const y = yNorm();

  const envAmount =
    yAssign.value === "env"
      ? (0.3 + y * 0.7)
      : 1;

  env.gain.cancelScheduledValues(now);
  env.gain.setValueAtTime(0, now);
  env.gain.linearRampToValueAtTime(
    envAmount,
    now + envParams.attack
  );
  env.gain.linearRampToValueAtTime(
    envAmount * envParams.sustain,
    now + envParams.attack + envParams.decay
  );

  voices.set(key, {
    osc,
    env,
    baseFreq: freq,
    waveform
  });

  noteState[key] = true;
  setNoteButtonState(key, true);
  setWaveformPlaying(waveform, true);
}

function noteOff(key) {
  const v = voices.get(key);
  if (!v) return;

  const now = audioCtx.currentTime;
  const y = yNorm();

  const rel =
    yAssign.value === "env"
      ? envParams.release * (0.3 + y)
      : envParams.release;

  v.env.gain.cancelScheduledValues(now);
  v.env.gain.setValueAtTime(v.env.gain.value, now);
  v.env.gain.linearRampToValueAtTime(0, now + rel);

  v.osc.stop(now + rel + 0.02);
  voices.delete(key);

  noteState[key] = false;
  setNoteButtonState(key, false);

  if (!isWaveformStillPlaying(v.waveform)) {
    setWaveformPlaying(v.waveform, false);
  }
}

function allNotesOff() {
  voices.forEach((_, key) => noteOff(key));
}


startBtn.onclick = async () => {
  if (!isRunning) {
    // ===== START =====
    stageSelect.disabled = true;
    await initAudio();

    isRunning = true;
    startBtn.textContent = "STOP";
    startBtn.classList.toggle("active", true);

    if (delay) setDelayFeedback(baseDelayFeedback);

    randomKickBall(0);

    try {
      wakeLock = await navigator.wakeLock.request("screen");
    } catch (err) {
    }

  } else {
    // ===== STOP =====
    isRunning = false;
    stageSelect.disabled = false;
    startBtn.textContent = "START";
    startBtn.classList.toggle("active", false);

    allNotesOff();
    stopBalls();

    if (delay) setDelayFeedback(0);

    if (wakeLock) {
      wakeLock.release();
      wakeLock = null;
    }
  }
};

stageSelect.onchange = e => {
  if (e.target.value == "stage2" && gravity.value === "0"){
    gravity.value = 0.02;
    gravity.dispatchEvent(new Event("input"));
  }
  loadStage(e.target.value);
};

window.addEventListener("keydown", (e) => {
  if (e.repeat) return;

  // SPACEキー
  if (e.code === "Space") {
    e.preventDefault(); // ページスクロール防止

    randomKickBall(0);
  }
});
