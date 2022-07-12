<script lang="ts">
  import {
    BoxBufferGeometry,
    MathUtils,
    Mesh,
    MeshStandardMaterial,
  } from "svelthree";
  import type { Scene } from "svelthree-three";
  export let scene: Scene;
  export let pos: [number, number, number] = [0, 0, 0];
  export let rot = 0;
  export let len = 5;
  export let height = 2;
  export let thick = 0.2;
  export let color = 0x7424ff;
  let wallGeometry = new BoxBufferGeometry(len, height, thick);
  let wallMaterial = new MeshStandardMaterial();
</script>

<Mesh
  {scene}
  geometry={wallGeometry}
  material={wallMaterial}
  mat={{ roughness: 0.5, metalness: 0.5, color: color }}
  {pos}
  rot={[0, MathUtils.degToRad(rot), 0]}
  castShadow
  receiveShadow
/>
