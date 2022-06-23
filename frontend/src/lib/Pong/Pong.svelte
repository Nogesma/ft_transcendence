<script lang="ts">
  import {
    Canvas,
    Scene,
    PerspectiveCamera,
    DirectionalLight,
    PointLight,
    PCFSoftShadowMap,
    AmbientLight,
    BoxBufferGeometry,
    SphereBufferGeometry,
    PlaneBufferGeometry,
    Mesh,
    MeshStandardMaterial,
    WebGLRenderer,
    OrbitControls,
    DoubleSide,
    MathUtils,
  } from "svelthree";
  import { onMount } from "svelte";
  import Wall from "./Wall.svelte";

  export let height;
  export let width;

  const box_width = 15;
  const box_len = 30;
  const box_height = 3;
  const wall_thick = 2;

  const ball_rad = 1;
  const speed = 0.2;

  const tickSpeed = 33;

  //KB
  let keys = {
    up: false,
    down: false,
  };

  //todo Extremement moche a refactor!
  let sphereGeometry = new SphereBufferGeometry(ball_rad, 25, 25);
  let padGeometry = new BoxBufferGeometry(1, box_height / 1.2, box_width / 4);
  let sphereMaterial = new MeshStandardMaterial();
  let padMaterial = new MeshStandardMaterial();
  let floorGeometry = new PlaneBufferGeometry(
    box_len + 0.1,
    box_width + 0.1,
    1
  );
  let floorMaterial = new MeshStandardMaterial();

  let padPos = [-(box_len / 2) + wall_thick, 0, 0];
  let ballPos = [0, 0, 0];
  let ball_speed = [speed, 0, -speed];
  let tickcount = 0;

  function checkBall() {
    let xlim = box_len / 2 - ball_rad;
    let zlim = box_width / 2 - ball_rad;
    let pad_lim = padPos[0] + ball_rad + 0.5;
    if (
      (ballPos[0] > xlim && ball_speed[0] > 0) ||
      (ballPos[0] < -xlim && ball_speed[0] < 0) ||
      (ballPos[0] < pad_lim &&
        ball_speed[0] < 0 &&
        ballPos[0] > pad_lim - speed &&
        ballPos[2] < padPos[2] + box_width / 8 &&
        ballPos[2] > padPos[2] - box_width / 8)
    )
      ball_speed[0] *= -1;
    if (
      (ballPos[2] > zlim && ball_speed[2] > 0) ||
      (ballPos[2] < -zlim && ball_speed[2] < 0)
    )
      ball_speed[2] *= -1;
  }

  function moveBall() {
    ballPos[0] += ball_speed[0];
    ballPos[1] += ball_speed[1];
    ballPos[2] += ball_speed[2];
    tickcount += 1;
    ballPos[1] =
      (box_height - ball_rad * 2) *
      0.6 *
      Math.abs(Math.cos(0.1 * tickcount + 0.3));
  }

  function movePad() {
    if (keys.up && padPos[2] > (-3 / 8) * box_width) padPos[2] -= 0.2;
    if (keys.down && padPos[2] < (3 / 8) * box_width) padPos[2] += 0.2;
  }

  function main_loop() {
    setTimeout(main_loop, tickSpeed);
    checkBall();
    movePad();
    moveBall();
  }

  function handleKeydown(event) {
    if (event.key === "ArrowUp") keys.up = true;
    else if (event.key === "ArrowDown") keys.down = true;
  }

  function handleKeyup(event) {
    if (event.key === "ArrowUp") keys.up = false;
    else if (event.key === "ArrowDown") keys.down = false;
  }

  onMount(() => {
    main_loop();
  });
</script>

<svelte:window on:keydown={handleKeydown} on:keyup={handleKeyup} />

<Canvas let:sti w={width} h={height}>
  <Scene {sti} let:scene id="scene1" props={{ background: 0xffffff }}>
    <PerspectiveCamera {scene} id="cam1" pos={[0, 30, 0]} lookAt={[0, 0, 0]} />
    <AmbientLight {scene} intensity={1.25} />
    <PointLight
      {scene}
      pos={[1, 10, 0]}
      intensity={0.7}
      shadowMapSize={512 * 8}
      castShadow
    />

    <!--Ball-->
    <Mesh
      {scene}
      geometry={sphereGeometry}
      material={sphereMaterial}
      mat={{ roughness: 0.5, metalness: 0.5, color: 0xffffff }}
      pos={ballPos}
      rot={[0, 0, 0]}
      castShadow
      receiveShadow
    />

    <!--Pad left-->
    <Mesh
      {scene}
      geometry={padGeometry}
      material={padMaterial}
      mat={{ roughness: 0.5, metalness: 0.5, color: 0x00ffff }}
      pos={padPos}
      rot={[0, 0, 0]}
      castShadow
      receiveShadow
    />

    <!--Walls-->
    <Wall
      {scene}
      pos={[(box_len + wall_thick) / 2, box_height / 2 - ball_rad, 0]}
      rot={-90}
      len={box_width + wall_thick * 2}
      height={box_height}
      thick={wall_thick}
    />
    <Wall
      {scene}
      pos={[-(box_len + wall_thick) / 2, box_height / 2 - ball_rad, 0]}
      rot={-90}
      len={box_width + wall_thick * 2}
      height={box_height}
      thick={wall_thick}
    />
    <Wall
      {scene}
      pos={[0, box_height / 2 - ball_rad, (box_width + wall_thick) / 2]}
      rot={0}
      len={box_len + wall_thick * 2}
      height={box_height}
      thick={wall_thick}
    />
    <Wall
      {scene}
      pos={[0, box_height / 2 - ball_rad, -(box_width + wall_thick) / 2]}
      rot={0}
      len={box_len + wall_thick * 2}
      height={box_height}
      thick={wall_thick}
    />

    <!--Floor-->
    <Mesh
      {scene}
      geometry={floorGeometry}
      material={floorMaterial}
      mat={{ roughness: 2, metalness: 1, side: DoubleSide, color: 0xffffff }}
      pos={[0, -ball_rad, 0]}
      rot={[MathUtils.degToRad(-90), 0, 0]}
      scale={[1, 1, 1]}
      receiveShadow
    />
  </Scene>

  <WebGLRenderer
    {sti}
    sceneId="scene1"
    camId="cam1"
    config={{ antialias: true, alpha: true }}
    enableShadowMap
    shadowMapType={PCFSoftShadowMap}
  />
</Canvas>
