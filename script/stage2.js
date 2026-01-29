function createStage2Bodies(){
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
    ),
    Matter.Bodies.fromVertices(
      0,
      WORLD_H/3,
      [
        { x: 0, y: 20},
        { x: 0, y: -20},
        { x: WORLD_W/3*2-20, y: 20},
        { x: WORLD_W/3*2-20, y: 30}
      ],
      {
        isStatic: true,
        label: "obstacle",
        render: {visible: false},
        restitution: 0.3
      },
      true
    ),
    Matter.Bodies.fromVertices(
      WORLD_W,
      WORLD_H/3*2-30,
      [
        { x: 0,   y: 20},
        { x: 0, y: -20},
        { x: -WORLD_W/3*2+20,  y: 20},
        { x: -WORLD_W/3*2+20,  y: 30}
      ],
      {
        isStatic: true,
        label: "obstacle",
        render: {visible: false},
        restitution: 0.3
      },
      true
    ),
    Matter.Bodies.fromVertices(
      0,
      WORLD_H-15,
      [
        { x: 0,   y: 20},
        { x: 0, y: -20},
        { x: WORLD_W/3*2,  y: 20}
      ],
      {
        isStatic: true,
        label: "obstacle",
        render: {visible: false},
        restitution: 0.3
      },
      true
    )
  ];
}



