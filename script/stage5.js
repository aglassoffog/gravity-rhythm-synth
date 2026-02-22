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
