function createStage5Bodies(){
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

function drawStage5(){
  const lightX = 300;
  const lightY = 50;

  let ball = balls[0];
  let bx = ball.position.x;
  let by = ball.position.y;

  const grad = wctx.createRadialGradient(
    lightX, lightY, 0,
    bx, by, ballRadius
  );

  grad.addColorStop(0, "rgba(255,255,200,1)");
  grad.addColorStop(1, "rgba(255,255,200,0)");
  wctx.fillStyle = grad;
  wctx.beginPath();
  wctx.moveTo(lightX, lightY);
  wctx.lineTo(bx - ballRadius, by); 
  wctx.lineTo(bx + ballRadius, by);
  wctx.closePath();
  wctx.fill(); 

  balls.slice(1).forEach(v => {
    bx = v.position.x;
    by = v.position.y;
    const ballGrad = wctx.createRadialGradient(
       lightX, lightY, 0,
       bx, by, ballRadius
    );

    ballGrad.addColorStop(0, "rgba(122,162,255,1)");
    ballGrad.addColorStop(1, "rgba(122,162,255,0)");
    wctx.fillStyle = ballGrad;
    wctx.beginPath();
    wctx.moveTo(lightX, lightY);
    wctx.lineTo(bx - ballRadius, by); 
    wctx.lineTo(bx + ballRadius, by);
    wctx.closePath();
    wctx.fill();
  });

}
