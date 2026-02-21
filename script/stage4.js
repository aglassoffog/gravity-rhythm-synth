function createStage4Bodies(){
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

function drawStage4(){

  const x = 200;
  const y = 20;
  const w = 200;
  const h = 150;

  // 背景（外っぽい色）
  const bg = wctx.createLinearGradient(x, y, x+w, y+h);
  bg.addColorStop(0, "#1a1a2e");
  bg.addColorStop(1, "#0f3460");
  wctx.fillStyle = bg;
  wctx.fillRect(x, y, w, h);

  // --- ガラス面（ほぼ透明） ---
  wctx.fillStyle = "rgba(255,255,255,0.03)";
  wctx.fillRect(x, y, w, h);

  // --- 枠 ---
  wctx.strokeStyle = "rgba(255,255,255,0.5)";
  wctx.lineWidth = 2;
  wctx.strokeRect(x, y, w, h);

  // 中央の仕切り
  wctx.beginPath();
  wctx.moveTo(x+w/2, y);
  wctx.lineTo(x+w/2, y+h);
  wctx.stroke();

  wctx.beginPath();
  wctx.moveTo(x, y+h/2);
  wctx.lineTo(x+w, y+h/2);
  wctx.stroke();

  // --- 反射（斜めハイライト） ---
  const grad = wctx.createLinearGradient(x, y, x+w, y+h);
  grad.addColorStop(0, "rgba(255,255,255,0.15)");
  grad.addColorStop(0.3, "rgba(255,255,255,0.05)");
  grad.addColorStop(0.6, "rgba(255,255,255,0.02)");
  grad.addColorStop(1, "rgba(255,255,255,0)");

  wctx.fillStyle = grad;
  wctx.fillRect(x, y, w, h);

  for (let i = 0; i < 100; i++) {
    const nx = x + Math.random() * w;
    const ny = y + Math.random() * h;

    wctx.beginPath();
    wctx.arc(nx, ny, Math.random() * 2, 0, Math.PI * 2);
    wctx.fillStyle = "rgba(255,255,255,0.8)";
    wctx.fill();
  }
}
