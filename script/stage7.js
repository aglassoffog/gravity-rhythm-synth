let S7_t = 0; // 進行（0〜1）
let S7_isRotating = false;
let S7_isWaiting = false;
let S7_rotation = 0;
let S7_margin = 0;

function drawStage7(){
  const cx = 300;
  const cy = 150;
  const w = 150;
  const h = 200;

  wctx.save();

  if (S7_isWaiting) {

    if (S7_margin < 0) {
      wctx.translate(WORLD_W / 2, WORLD_H / 2);
      wctx.rotate(S7_rotation);
      wctx.translate(-WORLD_W / 2, -WORLD_H / 2);
      S7_margin++;
    } else {
      S7_rotation = 0;
      S7_isWaiting = false;
      S7_isRotating = false;
      S7_t = 0;
    }

  } else if (S7_isRotating) {

    wctx.translate(WORLD_W / 2, WORLD_H / 2);
    wctx.rotate(S7_rotation);
    wctx.translate(-WORLD_W / 2, -WORLD_H / 2);

    if (S7_rotation < Math.PI) {
      const dt = 0.01;
      S7_rotation += dt * Math.PI;
    } else {
      S7_rotation = Math.PI;
      S7_isWaiting = true;
      S7_margin = -20;
    }

  }

  drawSand(cx, cy, w, h);
  drawGlass(cx, cy, w, h);

  wctx.restore();

  drawHighLight(cx, cy, w, h);

  if (S7_t < 1) {
    S7_t += 0.0002;
  } else {
    S7_isRotating = true;
  }

}

function drawGlass(cx, cy, w, h){

  wctx.beginPath();
  wctx.moveTo(cx - w/2, cy - h/2);
  wctx.lineTo(cx + w/2, cy - h/2);
  wctx.lineTo(cx, cy);
  wctx.lineTo(cx + w/2, cy + h/2);
  wctx.lineTo(cx - w/2, cy + h/2);
  wctx.lineTo(cx, cy);
  wctx.closePath();
  wctx.clip();

}

function drawHighLight(cx, cy, w, h) {

  const grad = wctx.createLinearGradient(cx-w/2, cy-h/3, cx+w/2, cy+h/3);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(1, "rgba(0,0,0,0)");

  wctx.fillStyle = grad;
  wctx.fill();

}

function drawSand(cx, cy, w, h) {
  // =======================
  // 上の砂（減る）
  // =======================
  const topLevel = S7_t;

  wctx.beginPath();
  wctx.moveTo(cx - w*0.4 + topLevel * (w*0.4), cy - h*0.45 + topLevel * (h*0.45));
  wctx.lineTo(cx + w*0.4 - topLevel * (w*0.4), cy - h*0.45 + topLevel * (h*0.45));
  wctx.lineTo(cx, cy);
  wctx.closePath();
  wctx.fillStyle = "#caa85a";
  wctx.fill();

  // =======================
  // 下の砂（増える）
  // =======================
  const bottomLevel = S7_t;

  wctx.beginPath();
  wctx.moveTo(cx - w*0.4, cy + h*0.45);
  wctx.lineTo(cx + w*0.4, cy + h*0.45);
  wctx.lineTo(cx, cy + h*0.45 - bottomLevel * (h*0.45));
  wctx.closePath();
  wctx.fillStyle = "#d9b96e";
  wctx.fill();

  // =======================
  // 落ちる砂
  // =======================
  wctx.beginPath();
  wctx.strokeStyle = "#e6c97a";

  for (let i = 0; i < 20; i++) {
    wctx.fillRect(
      cx - 1 + (Math.random() - 0.5) * 4,
      cy + 4 + Math.random() * ((h*0.45) - bottomLevel * (h*0.45)),
      2, 2);
  }
}
