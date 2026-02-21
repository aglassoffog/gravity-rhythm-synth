const ripples = [];

function addRipple(x, y) {
  ripples.push({
    x,
    y,
    r: 0,
    life: 1
  });
}

function perspectiveScale(t) {
  const p = Math.pow(t, 1.3);

  const scaleX = 0.8 + p * 0.2; // ← 横
  const scaleY = 0.35 + p * 0.7; // ← 縦

  return {
    sx: scaleX,
    sy: scaleY,
    p: p
  };
}

function drawPerspectiveReflection() {
  const w = reflectCanvas.width;
  const h = reflectCanvas.height;

  rctx.clearRect(0, 0, w, h);

  for (let y = 0; y < h; y+=2) {
    const t = y / h;
    const { sx, sy, p } = perspectiveScale(t);

    // world 全体をマッピング（上下反転）
    const srcY = WORLD_H * (1 - p) - 1;
    const sliceH = 2;

    rctx.save();
    rctx.translate(w / 2, y);
    rctx.scale(sx, -sy);

    rctx.drawImage(
      worldCanvas,
      0,
      srcY,
      worldCanvas.width,
      sliceH,
      -w / 2,
      0,
      w,
      sliceH
    );

    rctx.restore();
  }
}

function drawFadeReflection() {
  const grad = rctx.createLinearGradient(
    0, 0, 0, reflectCanvas.height
  );

  grad.addColorStop(0, "rgba(255,255,255,0.8)");
  grad.addColorStop(1, "rgba(255,255,255,0)");

  rctx.globalCompositeOperation = "destination-in";
  rctx.fillStyle = grad;
  rctx.fillRect(0, 0, reflectCanvas.width, reflectCanvas.height);
  rctx.globalCompositeOperation = "source-over";
}

function drawRipples() {
  const w = reflectCanvas.width;
  const h = reflectCanvas.height;

  ripples.forEach(ripple => {
    const y = ripple.y * h;
    const t = ripple.y;
    const { sx, sy } = perspectiveScale(t);

    const radius = ripple.r;

    rctx.save();
    rctx.translate(ripple.x, y);
    rctx.scale(sx, sy);

    rctx.strokeStyle = `rgba(200,220,255,${ripple.life})`;
    rctx.lineWidth = 2 / sx;

    rctx.beginPath();
    rctx.arc(0, 0, radius, 0, Math.PI * 2);
    rctx.stroke();

    rctx.restore();

    // 更新
    ripple.r += 1.2;
    ripple.life *= 0.97;
  });

  // 消滅
  for (let i = ripples.length - 1; i >= 0; i--) {
    if (ripples[i].life < 0.05) {
      ripples.splice(i, 1);
    }
  }
}