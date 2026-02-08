function createStage3Bodies(){
  return [
    Bodies.rectangle(
      -20, WORLD_H/2, 40, WORLD_H,
      {
       isStatic: true, label: "wall-left", render: {visible: false}
      }
    ),
    Bodies.rectangle(
      WORLD_W + 20, WORLD_H/2, 40, WORLD_H,
      {
        isStatic: true, label: "wall-right", render: {visible: false}
      }
    ),
    Bodies.rectangle(
      WORLD_W/3*2, -20, WORLD_W/3*2, 40,
      {
        isStatic: true, label: "wall-top", render: {visible: false}
      }
    ),
    Bodies.rectangle(
      WORLD_W/3, WORLD_H + 20, WORLD_W/3*2, 40,
      {
        isStatic: true, label: "wall-bottom", render: {visible: false}
      }
    )
  ];
}

function drawStage3(){
  drawFog();
}

const S3_W = worldCanvas.width;
const S3_H = worldCanvas.height;
const FOG_COUNT = 8;
const blobs = Array.from({ length: FOG_COUNT }, () => ({
  x: Math.random() * S3_W,
  y: Math.random() * S3_H,
  vx: (Math.random() - 0.5) * 0.05,
  vy: (Math.random() - 0.5) * 0.05,
  r: 80 + Math.random() * 140,
  c: Math.floor(Math.random() * 3)
}));

const FOG_COLOR = [
    "rgba(100,255,80,0.20)", // 緑
    "rgba(255,120,60,0.18)", // 内側中間オレンジ
    "rgba(150,80,255,0.16)", // 外側中間紫
    "rgba(120,0,255,0)" // 紫フェード
];

function drawFog() {
  wctx.globalCompositeOperation = 'lighter';
  wctx.filter = 'blur(30px)';

  for (const b of blobs) {
    b.x += b.vx;
    b.y += b.vy;

    if (b.x < -b.r) b.x = worldCanvas.width + b.r;
    if (b.x > worldCanvas.width + b.r) b.x = -b.r;
    if (b.y < -b.r) b.y = worldCanvas.height + b.r;
    if (b.y > worldCanvas.height + b.r) b.y = -b.r;

    wctx.fillStyle = FOG_COLOR[b.c];
    wctx.beginPath();
    wctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    wctx.fill();
  }

  wctx.filter = 'none';
  wctx.globalCompositeOperation = 'source-over';
}
