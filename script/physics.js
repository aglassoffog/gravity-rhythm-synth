const { Engine, Render, World, Bodies, Body, Runner } = Matter;
const WORLD_W = worldCanvas.width, WORLD_H = worldCanvas.height;
const BALL_SPEED = 5;
let ballRadius = 13;
const balls = [];
const wctx = worldCanvas.getContext("2d");
const rctx = reflectCanvas.getContext("2d");
const engine = Engine.create();
engine.gravity.y = 0;
engine.positionIterations = 8;
engine.velocityIterations = 6;
Runner.run(Runner.create(), engine);


function setBallCount(targetCount) {
  const current = balls.length;

  // 増やす
  if (targetCount > current) {
    for (let i = 0; i < targetCount - current; i++) {
      const ball = createBall(WORLD_W/2, WORLD_H/2);
      balls.push(ball);
      kickBall(ball, 0);
    }
  }

  // 減らす
  if (targetCount < current) {
    for (let i = 0; i < current - targetCount; i++) {
      const ball = balls.pop();
      World.remove(engine.world, ball);
    }
  }
}

let stageBodies = [];
let drawStage;
const stages = {
  stage1() {
    return createStage1Bodies();
  },
  stage2() {
    return createStage2Bodies();
  },
  stage3() {
    return createStage3Bodies();
  }
}
const draws = {
  stage1: drawStage1,
  stage2: drawStage2,
  stage3: drawStage3
}

function loadStage(name) {
  stageBodies.forEach(b => World.remove(engine.world, b));
  stageBodies.length = 0;

  const newBodies = stages[name]();
  stageBodies.push(...newBodies);

  World.add(engine.world, stageBodies);
  drawStage = draws[name];
  balls.forEach(startBall);
}

function randomKickBall(way) {
  balls.forEach(v => kickBall(v, way));
}

function setBallRadius(newRadius) {
  ballRadius = newRadius;
  balls.forEach((ball, i) => changeRadius(ball, i));
}

function stopBalls() {
  balls.forEach(stopBall);
}

function handleCell(e) {
  const rect = worldCanvas.getBoundingClientRect();
  const cx = (e.clientX - rect.left) * (WORLD_W / rect.width);
  const cy = (e.clientY - rect.top) * (WORLD_H / rect.height);

  if (cx < WORLD_W/2) {
    randomKickBall(1);
  } else {
    randomKickBall(2);
  }
}

worldCanvas.addEventListener("pointerdown", e => {
  e.preventDefault();
  handleCell(e);
});

Matter.Events.on(engine, "afterUpdate", () => {
  balls.forEach(warpBall);
});

Matter.Events.on(engine, "collisionStart", event => {
  event.pairs.forEach(pair => {
    const a = pair.bodyA;
    const b = pair.bodyB;

    if (
      (a.label === "ball" && b.label === "ball")
    ){
      onBallCollision();
    }else if (a.label === "ball" && b.label.startsWith("wall")){
      onSideWallCollision(b);
      if (b.label === "wall-bottom"){
        addRipple(a.position.x + 75,0);
      }
    }else if (b.label === "ball" && a.label.startsWith("wall")){
      onSideWallCollision(a);
      if (a.label === "wall-bottom"){
        addRipple(b.position.x + 75,0);
      }
    }
  });
});

function yNorm() {
  return Math.min(Math.max(balls[0].position.y / WORLD_H, 0), 1);
}

function xNorm() {
  return Math.min(Math.max(balls[0].position.x / WORLD_W, 0), 1);
}

function drawBody(body) {
  const v = body.vertices;
  wctx.strokeStyle = "#aaa";
  //wctx.strokeStyle = "rgba(255,255,255,0.6)";
  wctx.lineWidth = 1;

  wctx.beginPath();
  wctx.moveTo(v[0].x, v[0].y);
  for (let i = 1; i < v.length; i++) {
    wctx.lineTo(v[i].x, v[i].y);
  }
  wctx.closePath();
  wctx.stroke();
}

function drawHideFrame(){
  wctx.strokeStyle = "#000";
  wctx.lineWidth = 1;
  wctx.beginPath();
  wctx.moveTo(0, 0);
  wctx.lineTo(WORLD_W, 0);
  wctx.lineTo(WORLD_W, WORLD_H);
  wctx.lineTo(0, WORLD_H);
  wctx.closePath();
  wctx.stroke();
}

function drawMoon(ball){
  wctx.save();
  wctx.translate(ball.position.x, ball.position.y);
  wctx.rotate(ball.angle);

  const moonGrad = wctx.createRadialGradient(
    -ballRadius * 0.3, -ballRadius * 0.3, ballRadius * 0.2,
    0, 0, ballRadius
  );

  moonGrad.addColorStop(0, "rgba(255, 253, 231, 1)");
  // moonGrad.addColorStop(0, "rgba(255,255,210,1)");
  // moonGrad.addColorStop(0, "rgba(255, 255, 200, 1)");

  // moonGrad.addColorStop(1, "rgba(230,220,140,1)");
  // moonGrad.addColorStop(1, "rgba(224, 211, 109, 1)");
  moonGrad.addColorStop(1, "rgba(238, 224, 119, 1)");
  // moonGrad.addColorStop(1, "rgba(255,255,180,1)");
  // moonGrad.addColorStop(1, "rgba(255, 255, 102, 1)");
  // moonGrad.addColorStop(1, "rgba(255, 255, 0, 1)");

  wctx.fillStyle = moonGrad;
  wctx.beginPath();
  wctx.arc(0, 0, ballRadius, 0, Math.PI * 2);
  wctx.fill();

  // wctx.fillStyle = "rgba(200,190,120,0.35)";
  wctx.fillStyle = "rgba(170,160,100,0.45)";
  [
    // 内側
    { x:-0.35, y:-0.25, s:0.14 },
    { x: 0.25, y: 0.30, s:0.10 },
    { x:-0.10, y: 0.45, s:0.08 },

    // 中
    { x:  0.42, y: -0.20, s: 0.04 },
    { x:  0.10, y: -0.48, s: 0.05 },
    { x:  0.05, y:  0.18, s: 0.035 },

    // ほぼ縁
    // { x: 0.90, y: 0.05, s:0.11 },
    { x:-0.50, y: 0.80, s:0.03 },
    // { x: 0.05, y: 0.90, s:0.065 },

  ].forEach(c => {
    wctx.beginPath();
    wctx.arc(ballRadius * c.x, ballRadius * c.y, ballRadius * c.s, 0, Math.PI * 2);
    wctx.fill();
  });

  wctx.restore();
}

function drawBall(ball) {
  wctx.save();
  wctx.translate(ball.position.x, ball.position.y);
  wctx.rotate(ball.angle);

  wctx.fillStyle = "#7aa2ff";
  wctx.beginPath();
  wctx.arc(0, 0, ball.circleRadius, 0, Math.PI * 2);
  wctx.fill();

  wctx.restore();
}

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
    sy: scaleY
  };
}

function drawPerspectiveReflection() {
  const w = reflectCanvas.width;
  const h = reflectCanvas.height;

  rctx.clearRect(0, 0, w, h);

  for (let y = 0; y < h; y+=2) {
    const t = y / h;
    const p = Math.pow(t, 1.3);

    const scaleX = 0.8 + p * 0.2; // ← 横
    const scaleY = 0.35 + p * 0.7; // ← 縦

    // world 全体をマッピング（上下反転）
    const srcY = WORLD_H * (1 - p) - 1;
    const sliceH = 2;

    rctx.save();
    rctx.translate(w / 2, y);
    rctx.scale(scaleX, -scaleY);

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

function drawRipples(time) {
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

function drawPhysics() {
  wctx.clearRect(0, 0, WORLD_W, WORLD_H);

  stageBodies.forEach(drawBody);
  drawHideFrame();

  drawStage();

  drawMoon(balls[0]);
  balls.slice(1).forEach(drawBall);

  drawPerspectiveReflection();
  drawFadeReflection();
  drawRipples();

  posX.textContent = balls[0].position.x.toFixed(1);
  posY.textContent = balls[0].position.y.toFixed(1);

  requestAnimationFrame(drawPhysics);
}

function setGravity(v) {
  engine.gravity.y = v;
}

function initPhysics() {
  const ball = createBall(WORLD_W/2, WORLD_H/2);
  balls.push(ball);

  loadStage("stage1");
  drawPhysics();
}