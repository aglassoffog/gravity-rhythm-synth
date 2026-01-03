/* ================= Matter.js ================= */
const { Engine, Render, World, Bodies, Body, Runner } = Matter;
const W = 400, H = 400;

const engine = Engine.create();
engine.gravity.y = 0;

Render.run(Render.create({
  canvas: world,
  engine,
  options:{ width:W, height:H, wireframes:false, background:"#000" }
}));

const runner = Runner.create();
Runner.run(runner, engine);

const ball = Bodies.circle(W/2,H/2,15,{
  restitution:1, friction:0, frictionStatic:0, frictionAir:0
});

World.add(engine.world,[
  ball,
  Bodies.rectangle(W/2,-20,W,40,{isStatic:true}),
  Bodies.rectangle(W/2,H+20,W,40,{isStatic:true}),
  Bodies.rectangle(-20,H/2,40,H,{isStatic:true}),
  Bodies.rectangle(W+20,H/2,40,H,{isStatic:true})
]);

function kickBall(){
  Body.setVelocity(ball,{x:0,y:0});
  Body.setAngularVelocity(ball,0);
  const f=0.012;
  Body.applyForce(ball,ball.position,{x:Math.cos(Math.PI/4)*f, y:Math.sin(Math.PI/4)*f});
}

/* XY表示 */
(function xyLoop(){
  posX.textContent = ball.position.x.toFixed(1);
  posY.textContent = ball.position.y.toFixed(1);
  requestAnimationFrame(xyLoop);
})();

gravity.oninput=e=>{
  engine.gravity.y=+e.target.value;
  gravityVal.textContent=(+e.target.value).toFixed(2);
};

/* ================= Audio ================= */
let audioCtx=null, master=null, analyser=null, lfo=null, lfoGain=null;
let powerOn=false, envOn=true, voices=new Map();

envBtn.onclick = ()=>{
  envOn = !envOn;
  envBtn.textContent = envOn?"ON":"OFF";
};

async function initAudio(){
  if(audioCtx) return;
  audioCtx=new (window.AudioContext||window.webkitAudioContext)();
  master=audioCtx.createGain(); master.gain.value=0.25;

  analyser=audioCtx.createAnalyser();
  analyser.fftSize=2048; analyser.smoothingTimeConstant=0.8;
  master.connect(analyser); analyser.connect(audioCtx.destination);

  lfo=audioCtx.createOscillator(); lfo.frequency.value=5;
  lfoGain=audioCtx.createGain(); lfoGain.gain.value=0;
  lfo.connect(lfoGain); lfo.start();

  const unlock=audioCtx.createOscillator();
  const unlockGain=audioCtx.createGain(); unlockGain.gain.value=0;
  unlock.connect(unlockGain); unlockGain.connect(audioCtx.destination);
  unlock.start(); unlock.stop(audioCtx.currentTime+0.01);

  await audioCtx.resume();
  powerOn=true; powerBtn.textContent="ON";

  drawLoop(); // 描画ループを開始
  modLoop();
}

powerBtn.onclick=initAudio;

function yNorm(){ return Math.min(Math.max(ball.position.y/H,0),1); }

function noteOn(key,freq){
  if(!powerOn||voices.has(key)) return;
  const osc=audioCtx.createOscillator();
  osc.type=waveform.value; osc.frequency.value=freq;
  const gain=audioCtx.createGain(); gain.gain.value=envOn?0:1;
  osc.connect(gain); gain.connect(master); lfoGain.connect(osc.frequency); osc.start();
  if(envOn){ const now=audioCtx.currentTime, y=yNorm(); const level=(yAssign.value==="env")?0.2+y*0.8:1;
    gain.gain.setValueAtTime(0,now); gain.gain.linearRampToValueAtTime(level,now+0.01);}
  voices.set(key,{osc,gain,baseFreq:freq});
}

function noteOff(key){
  const v=voices.get(key); if(!v) return;
  const now=audioCtx.currentTime;
  if(envOn){ const y=yNorm(); const rel=(yAssign.value==="env")?0.05+y*1.2:0.1;
    v.gain.gain.setValueAtTime(v.gain.gain.value,now);
    v.gain.gain.linearRampToValueAtTime(0,now+rel);
    v.osc.stop(now+rel+0.02);}
  else v.osc.stop();
  voices.delete(key);
}

function modLoop(){
  if(!audioCtx) return;
  voices.forEach(v=>{
    const y=yNorm();
    if(yAssign.value==="pitch"){v.osc.frequency.setValueAtTime(v.baseFreq*Math.pow(2,0.5-y),audioCtx.currentTime); lfoGain.gain.value=0;}
    else if(yAssign.value==="vibrato"){lfoGain.gain.value=y*20;}
    else{v.osc.frequency.setValueAtTime(v.baseFreq,audioCtx.currentTime); lfoGain.gain.value=0;}
  });
  requestAnimationFrame(modLoop);
}

/* ================= Keyboard ================= */
const keyMap={a:261.63,b:293.66,c:329.63,d:349.23,e:392,f:440,g:493.88,h:523.25};
window.addEventListener("keydown",e=>{if(e.repeat||!powerOn) return; const k=e.key.toLowerCase(); if(!keyMap[k]) return; kickBall(); noteOn(k,keyMap[k]);});
window.addEventListener("keyup",e=>{if(!powerOn) return; noteOff(e.key.toLowerCase());});
