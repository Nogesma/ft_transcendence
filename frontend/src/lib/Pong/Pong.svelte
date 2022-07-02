<script lang="ts">
  import {
    Canvas,
    Scene,
    PerspectiveCamera,
    PointLight,
    PCFSoftShadowMap,
    AmbientLight,
    BoxBufferGeometry,
    SphereBufferGeometry,
    PlaneBufferGeometry,
    Mesh,
    MeshStandardMaterial,
    WebGLRenderer,
    DoubleSide,
    MathUtils,
  } from "svelthree";
  import { onMount } from "svelte";
  import Wall from "./Wall.svelte";

  export let height;
  export let width;

  let params = {
    box: {
      width: 15,
      len: 30,
      height: 3,
      thick: 2,
    },
    speed: 0.2,
    tick_speed: 33,
  };

  let ball = {
    pos: [0, 0, 0],
    speed: [params.speed, 0, -params.speed],
    rad: 1,
  };

  let padLeft = {
    pos: [-(params.box.len / 2) + params.box.thick, 0, 0],
    speed: [0, 0, 0.1],
    dimensions: [1, params.box.height / 1.2, params.box.width / 4],
  };

  let padRight = {
    pos: [params.box.len / 2 - params.box.thick, 0, 0],
    speed: [0, 0, -0.1],
    dimensions: [1, params.box.height / 1.2, params.box.width / 4],
  };

  let sphereGeometry = new SphereBufferGeometry(ball.rad, 25, 25);
  let cubeGeometry = new BoxBufferGeometry(1, 1, 1);
  let sphereMaterial = new MeshStandardMaterial();
  let padMaterial = new MeshStandardMaterial();
  let floorGeometry = new PlaneBufferGeometry(
    params.box.len + 0.1,
    params.box.width + 0.1,
    1
  );
  let floorMaterial = new MeshStandardMaterial();

  let tickcount = 0;

  const checkBall = () => {
    let xlim = params.box.len / 2 - ball.rad;
    let zlim = params.box.width / 2 - ball.rad;
    let pad_lim = padLeft.pos[0] + ball.rad + 0.5;
    if (
      (ball.pos[0] > xlim && ball.speed[0] > 0) ||
      (ball.pos[0] < -xlim && ball.speed[0] < 0) ||
      (ball.pos[0] < pad_lim &&
        ball.speed[0] < 0 &&
        ball.pos[0] > pad_lim - params.speed &&
        ball.pos[2] < padLeft.pos[2] + params.box.width / 8 &&
        ball.pos[2] > padLeft.pos[2] - params.box.width / 8)
    )
      ball.speed[0] *= -1;
    if (
      (ball.pos[2] > zlim && ball.speed[2] > 0) ||
      (ball.pos[2] < -zlim && ball.speed[2] < 0)
    )
      ball.speed[2] *= -1;
  };

  const advance = (obj) => {
    obj.pos[0] += obj.speed[0];
    obj.pos[1] += obj.speed[1];
    obj.pos[2] += obj.speed[2];
  };

  const moveBall = () => {
    advance(ball);
    tickcount += 1;
    ball.pos[1] =
      (params.box.height - ball.rad * 2) *
      0.6 *
      Math.abs(Math.cos(0.1 * tickcount + 0.3));
  };

  const movePad = () => {
    advance(padLeft);
    advance(padRight);
  };

  const main_loop = () => {
    setTimeout(main_loop, params.tick_speed);
    checkBall();
    movePad();
    moveBall();
    padLeft.pos = padLeft.pos;
    ball.pos = ball.pos;
  };

  onMount(() => {
    main_loop();
  });
</script>

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
      pos={ball.pos}
      rot={[0, 0, 0]}
      castShadow
      receiveShadow
    />

    <!--Pad left-->
    <Mesh
      {scene}
      geometry={cubeGeometry}
      material={padMaterial}
      mat={{ roughness: 0.5, metalness: 0.5, color: 0x00ffff }}
      pos={padLeft.pos}
      scale={padLeft.dimensions}
      castShadow
      receiveShadow
    />

    <!--    Walls-->
    <Wall
      {scene}
      pos={[
        (params.box.len + params.box.thick) / 2,
        params.box.height / 2 - ball.rad,
        0,
      ]}
      rot={-90}
      len={params.box.width + params.box.thick * 2}
      height={params.box.height}
      thick={params.box.thick}
    />
    <Wall
      {scene}
      pos={[
        -(params.box.len + params.box.thick) / 2,
        params.box.height / 2 - ball.rad,
        0,
      ]}
      rot={-90}
      len={params.box.width + params.box.thick * 2}
      height={params.box.height}
      thick={params.box.thick}
    />
    <Wall
      {scene}
      pos={[
        0,
        params.box.height / 2 - ball.rad,
        (params.box.width + params.box.thick) / 2,
      ]}
      rot={0}
      len={params.box.len + params.box.thick * 2}
      height={params.box.height}
      thick={params.box.thick}
    />
    <Wall
      {scene}
      pos={[
        0,
        params.box.height / 2 - ball.rad,
        -(params.box.width + params.box.thick) / 2,
      ]}
      rot={0}
      len={params.box.len + params.box.thick * 2}
      height={params.box.height}
      thick={params.box.thick}
    />

    <!--Floor-->
    <Mesh
      {scene}
      geometry={floorGeometry}
      material={floorMaterial}
      mat={{ roughness: 2, metalness: 1, side: DoubleSide, color: 0xffffff }}
      pos={[0, -ball.rad, 0]}
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
