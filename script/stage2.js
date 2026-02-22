function drawStage2(){
  drawSnow();
  drawGround();
}

const S2_W = worldCanvas.width;
const S2_H = worldCanvas.height;
const SNOW_COUNT = 50;
const ground = new Array(S2_W).fill(S2_H - 8);

const snow = Array.from({ length: SNOW_COUNT }, () => ({
  x: Math.random() * S2_W,
  y: Math.random() * S2_H,
  vx: (Math.random() - 0.5) * 0.5,
  vy: Math.random(),
  r: 1 + Math.random()
}));

function drawSnow() {
  wctx.fillStyle = "white";

  for (const s of snow) {
    // 重力
    s.vy += engine.gravity.y / 10;
    s.x += s.vx;
    s.y += s.vy;
    // 横ループ
    if (s.x < 0) s.x = S2_W;
    if (s.x > S2_W) s.x = 0;

    const gx = Math.floor(s.x);
    if (s.y > S2_H-8) {

      if (gx > 0 && gx < S2_W/3*2) {
        ground[gx] -= 0.5;
        ground[gx-1] -= 0.2;
        ground[gx+1] -= 0.2;
      }

      if (ground[gx] < S2_H/2) {
        ground[gx] += 8;
      }

      s.y = -10;
      s.x = Math.random() * S2_W;
      s.vy = 0;
    } else if (s.y < -10) {

      if (gx > 0 && gx < S2_W/3*2 && ground[gx] < S2_H-8) {
        ground[gx] += 0.5;
        ground[gx-1] += 0.2;
        ground[gx+1] += 0.2;
      }

      s.y = ground[gx] - 1;
      s.x = Math.random() * S2_W;
      s.vy = 0;
    }

    wctx.beginPath();
    wctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    wctx.fill();
  }
}

function drawGround() {
  wctx.fillStyle = "white";
  wctx.beginPath();

  wctx.moveTo(0, S2_H-8);
  for (let x = 0; x < S2_W; x++) {
    wctx.lineTo(x, ground[x]);
  }
  wctx.lineTo(S2_W, S2_H-8);
  wctx.closePath();
  wctx.fill();
}
