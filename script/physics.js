const { Engine, Render, World, Bodies, Body, Runner } = Matter;
const W = 400, H = 400;
const BALL_SPEED = 5;
let BALL_RADIUS = 15;

const engine = Engine.create();
engine.gravity.y = 0;

const worldCanvas = document.getElementById("world");

Render.run(Render.create({
  canvas: worldCanvas,
  engine,
  options:{ width:W, height:H, wireframes:false, background:"#000" }
}));

const runner = Runner.create();
Runner.run(runner, engine);

let ball = createBall(W / 2, H / 2);

const wallLeft = Bodies.rectangle(
  -20, H / 2, 40, H,
  { isStatic: true, label: "wall-left" }
);

const wallRight = Bodies.rectangle(
  W + 20, H / 2, 40, H,
  { isStatic: true, label: "wall-right" }
);

const wallTop = Bodies.rectangle(
  W / 2, -20, W, 40,
  { isStatic: true, label: "wall-top" }
);

const wallBottom = Bodies.rectangle(
  W / 2, H + 20, W, 40,
  { isStatic: true, label: "wall-bottom" }
);

World.add(engine.world, [
  ball,
  wallLeft,
  wallRight,
  wallTop,
  wallBottom
]);

function randomKickBall() {
  const angle = Math.random() * Math.PI * 2;

  Body.setVelocity(ball, { x: 0, y: 0 });
  Body.setAngularVelocity(ball, 0);

  Body.setVelocity(ball, {
    x: Math.cos(angle) * BALL_SPEED,
    y: Math.sin(angle) * BALL_SPEED
  });
}

function createBall(x, y) {
  return Bodies.circle(x, y, BALL_RADIUS, {
    restitution: 1,
    friction: 0,
    frictionStatic: 0,
    frictionAir: 0,
    inertia: Infinity,
    render: {
      fillStyle: "#00ff88"
    },
    label: "ball"
  });
}

function setBallRadius(newRadius) {
  BALL_RADIUS = newRadius;

  const { x, y } = ball.position;
  const v = ball.velocity;

  World.remove(engine.world, ball);
  ball = createBall(x, y);
  World.add(engine.world, ball);

  Body.setVelocity(ball, {
    x: v.x,
    y: v.y
  });
}

function stopBall() {
  Body.setVelocity(ball, { x: 0, y: 0 });
  Body.setAngularVelocity(ball, 0);
}

function isBallWallCollision(a, b) {
  return (
    (a.label === "ball" && b.label.startsWith("wall")) ||
    (b.label === "ball" && a.label.startsWith("wall"))
  );
}

function xyLoop(){
  const posX = document.getElementById("posX");
  const posY = document.getElementById("posY");
  posX.textContent = ball.position.x.toFixed(1);
  posY.textContent = ball.position.y.toFixed(1);

  requestAnimationFrame(xyLoop);
}

const gravitySlider = document.getElementById("gravity");
const gravityVal = document.getElementById("gravityVal");
gravitySlider.oninput = e=>{
  engine.gravity.y = +e.target.value;
  gravityVal.textContent = (+e.target.value).toFixed(2);
};
