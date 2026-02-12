// Canvasコンテキスト
const sctx = scope.getContext("2d");
const fctx = fftCanvas.getContext("2d");
const xyCtx = xy.getContext("2d");
const spCtx = specCanvas.getContext("2d");
const bufferCanvas = document.createElement("canvas");
const bufferCtx = bufferCanvas.getContext("2d", { willReadFrequently: true });
bufferCanvas.width = specCanvas.width;
bufferCanvas.height = specCanvas.height;

// データ配列
let timeDataL = new Float32Array(2048);
let timeDataR = new Float32Array(2048);
let freqData = new Uint8Array(1024);
let xyOffset = 32;

const triggerLevel = 0;
const samplesToDraw = 280;

function findTriggerIndex(data){
  let over = false;
  for(let i=1;i<data.length;i++){
    if(data[i-1] < -0.01){
      over = true;
    }
    if(data[i-1]<triggerLevel && data[i]>triggerLevel){
      if (over) {
        return i;
      }
    }
  }
  return 0;
}

function spectrogramColor(v) {
  const a = v / 255;
  const r = Math.floor(40 + a * 180);
  const g = Math.floor(30 + a * 120);
  const b = Math.floor(120 + a * 135);
  return `rgb(${r},${g},${b})`;
}

/* ======= メイン描画ループ ======= */
function drawLoop(){
  requestAnimationFrame(drawLoop);
  if(!audioCtx) return;
  if(!analyserL) return;

  analyserL.getFloatTimeDomainData(timeDataL);
  analyserR.getFloatTimeDomainData(timeDataR);
  analyserL.getByteFrequencyData(freqData);

  // Scope
  const start = findTriggerIndex(timeDataL);
  sctx.clearRect(0,0,scope.width,scope.height);
  sctx.strokeStyle="gray";
  sctx.lineWidth=2;
  sctx.beginPath();
  if(start !== 0) {
    for(let i=0;i<samplesToDraw;i++){
      const idx=(start+i)%timeDataL.length;
      const v=timeDataL[idx];
      const x=(i/samplesToDraw)*scope.width;
      const y=scope.height/2 - v*scope.height/2;
      i===0 ? sctx.moveTo(x,y) : sctx.lineTo(x,y);
    }
    sctx.stroke();
  }

  // FFT
  const fftHeight = fftCanvas.height;
  fctx.clearRect(0,0,fftCanvas.width,fftCanvas.height);
  const barWidth = fftCanvas.width / freqData.length;
  for(let i=0;i<freqData.length;i++){
    const h=(freqData[i]/255)*(fftHeight-8);
    fctx.fillStyle="#08f";
    fctx.fillRect(i*barWidth, fftHeight-h-8, barWidth,h);
  }

  // XY
  xyCtx.clearRect(0,0,xy.width,xy.height);
  xyCtx.strokeStyle="#00ff88";
  xyCtx.lineWidth = 2;
  xyCtx.beginPath();
  for(let i=0;i<timeDataL.length-xyOffset;i++){
    const xVal=timeDataL[i];
    const yVal=timeDataL[i+xyOffset];
    if (xVal > 0.01 || xVal < -0.01) {
      const x=xy.width/2 + xVal*xy.width/2;
      const y=xy.height/2 - yVal*xy.height/2;
      i===0 ? xyCtx.moveTo(x,y) : xyCtx.lineTo(x,y);
    }
  }
  xyCtx.stroke();

  // Spectrogram
  const w = specCanvas.width;
  const h = specCanvas.height;
  drawSpecBuffer(w, h);
  drawSpec(w, h);
}

function drawSpecBuffer(w, h){
  // 左に1pxスクロール
  const img = bufferCtx.getImageData(1, 0, w - 1, h);
  bufferCtx.putImageData(img, 0, 0);

  // 右端1pxを描画
  for (let i = 0; i < freqData.length; i++) {
    const v = freqData[i];
    const y = i / freqData.length * h;

    bufferCtx.fillStyle = spectrogramColor(v);
    bufferCtx.fillRect(w - 1, y, 1, h / freqData.length);
  }
}

function drawSpec(w, h) {
  spCtx.clearRect(0, 0, w, h);

  for (let y = 0; y < h; y+=3) {
    const t = y / h;
    const p = Math.pow(t, 1.3);
    const scaleX = 0.8 + p * 0.2; // ← 横
    const sliceH = 3;

    spCtx.save();
    spCtx.translate(w / 2, y);
    spCtx.scale(scaleX, 1);

    spCtx.drawImage(
      bufferCanvas,
      0, y, w, sliceH,
      -w / 2, 0, w, sliceH
    );

    spCtx.restore();
  }
}

function drawBuffer(canvas, buffer) {
  const ctx = canvas.getContext("2d");

  const data = buffer.getChannelData(0); // L ch
  const len = data.length;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#7aa2ff"; // ネオン系
  ctx.lineWidth = 1;
  ctx.beginPath();

  for (let i = 0; i < canvas.width; i++) {
    const index = Math.floor(i / canvas.width * len);
    const v = data[index]; // -1.0〜1.0
    const y = canvas.height / 2 - v * canvas.height / 2;

    if (i === 0) ctx.moveTo(i, y);
    else ctx.lineTo(i, y);
  }

  ctx.stroke();
}
