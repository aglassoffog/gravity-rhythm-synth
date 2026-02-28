const BALL_SPEED = 5;

function createBall(x, y) {
  const ball = Bodies.circle(x, y, ballRadius, {
    restitution: 1,
    friction: 0,
    frictionAir: 0,
    frictionStatic: 0,
    // inertia: Infinity,
    render: {visible: false},
    label: "ball"
  });

  ball.angle = Math.random() * Math.PI * 2;
  World.add(engine.world, ball);
  return ball;
}

function changeRadius(ball, i) {
  const { x, y } = ball.position;
  const v = ball.velocity;
  const a = ball.angularVelocity;

  World.remove(engine.world, ball);
  ball = createBall(x, y);
  balls[i] = ball;

  Body.setVelocity(ball, {
    x: v.x,
    y: v.y
  });
  Body.setAngularVelocity(ball, a);
}

function startBall(ball) {
  Body.setPosition(ball, {
    x: WORLD_W / 2,
    y: WORLD_H / 2
  });
  Body.setVelocity(ball, { x: 0, y: 0 });
}

function kickBall(ball, way) {
  let angle;
  if (way === 0) {
    angle = Math.random() * Math.PI * 2;
  } else if (way === 1) {
    angle = (Math.PI / 4 * 3) + Math.random() * (Math.PI / 2);
  } else {
    angle = (Math.random() * 2 - 1) * Math.PI / 4;
  }

  const maxSpin = 0.1;
  const spin = (Math.random() * 2 - 1) * maxSpin;

  Body.setVelocity(ball, { x: 0, y: 0 });
  Body.setAngularVelocity(ball, spin);

  Body.setVelocity(ball, {
    x: Math.cos(angle) * BALL_SPEED,
    y: Math.sin(angle) * BALL_SPEED
  });
}

function stopBall(ball) {
  Body.setVelocity(ball, { x: 0, y: 0 });
  Body.setAngularVelocity(ball, 0);
}

function warpBall(ball) {
  const { x, y } = ball.position;

  if (y < -ballRadius) {
    Body.setPosition(ball, {
      x: x + WORLD_W/3*2,
      y: WORLD_H + ballRadius
    });
  }

  if (y > WORLD_H + ballRadius) {
    Body.setPosition(ball, {
      x: x - WORLD_W/3*2,
      y: -ballRadius
    });
  }
}
