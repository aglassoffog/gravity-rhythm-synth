function createStage1Bodies(){
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



