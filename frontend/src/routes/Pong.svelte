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
    import { onMount } from 'svelte';

    //todo Extremement moche a refactor!
    let cubeGeometry = new SphereBufferGeometry(0.5, 25, 25);
    let wallGeometry = new BoxBufferGeometry(5, 2, 0.2);
    let sideWallGeometry = new BoxBufferGeometry(10, 2, 0.2);
    let cubeMaterial = new MeshStandardMaterial();
    let wallMaterial = new MeshStandardMaterial();
    let floorGeometry = new PlaneBufferGeometry(10, 5, 1);
    let floorMaterial = new MeshStandardMaterial();

    let cubePos = [0,-0.25,0];
    let speed = 0.1;
    let cubeSpeed = [speed, 0, -speed];
    let tickcount = 0;
    let tickSpeed = 33;

    function moveCube(){
        if ((cubePos[0] > 4.3 && cubeSpeed[0] > 0)
        || (cubePos[0] < -4.3 && cubeSpeed[0] < 0))
            cubeSpeed[0] *= -1;
        if ((cubePos[2] > 1.8 && cubeSpeed[2] > 0)
            || (cubePos[2] < -1.8 && cubeSpeed[2] < 0))
            cubeSpeed[2] *= -1;
        cubePos[0] += cubeSpeed[0];
        cubePos[1] += cubeSpeed[1];
        cubePos[2] += cubeSpeed[2];
        tickcount += 1;
        cubePos[1] = 0.4 * (Math.cos(0.1 * tickcount + 0.3) + 1);
        setTimeout(moveCube, tickSpeed);
    }

    onMount(() => {
        moveCube();
    });


</script>

<Canvas let:sti w={1000} h={500}>

    <Scene {sti} let:scene id="scene1" props={{ background: 0xedf2f7 }}>

        <PerspectiveCamera {scene} id="cam1" pos={[0, 2, 4]} lookAt={[0, 0, 0]} />
        <AmbientLight {scene} intensity={1.25} />
        <PointLight
                {scene}
                pos={[1, 3, 0]}
                intensity={0.7}
                shadowMapSize={512 * 8}
                castShadow />


        <!--Cube-->
        <Mesh
            {scene}
            geometry={cubeGeometry}
            material={cubeMaterial}
            mat={{ roughness: 0.5, metalness: 0.5, color: 0xffffff }}
            pos={cubePos}
            rot={[0, 0, 0]}
            castShadow
            receiveShadow
        />

        <Mesh
                {scene}
                geometry={wallGeometry}
                material={wallMaterial}
                mat={{ roughness: 0.5, metalness: 0.5, color: 0x7424ff }}
                pos={[4.9, 0.5, 0]}
                rot={[0, MathUtils.degToRad(-90), 0]}
                castShadow
                receiveShadow
        />

        <Mesh
                {scene}
                geometry={wallGeometry}
                material={wallMaterial}
                mat={{ roughness: 0.5, metalness: 0.5, color: 0x7424ff }}
                pos={[-4.9, 0.5, 0]}
                rot={[0, MathUtils.degToRad(-90), 0]}
                castShadow
                receiveShadow
        />

        <Mesh
                {scene}
                geometry={sideWallGeometry}
                material={wallMaterial}
                mat={{ roughness: 0.5, metalness: 0.5, color: 0x7424ff }}
                pos={[0, 0.5, 2.4]}
                rot={[0, 0, 0]}
                castShadow
                receiveShadow
        />

        <Mesh
                {scene}
                geometry={sideWallGeometry}
                material={wallMaterial}
                mat={{ roughness: 0.5, metalness: 0.5, color: 0x7424ff }}
                pos={[0, 0.5, -2.4]}
                rot={[0, 0, 0]}
                castShadow
                receiveShadow
        />

        <Mesh
            {scene}
            geometry={floorGeometry}
            material={floorMaterial}
            mat={{ roughness: 2, metalness: 1, side: DoubleSide, color: 0xffffff }}
            pos={[0, -0.501, 0]}
            rot={[MathUtils.degToRad(-90), 0, 0]}
            scale={[1, 1, 1]}
            receiveShadow
        />

        <OrbitControls {scene} enableDamping />

    </Scene>

    <WebGLRenderer
            {sti}
            sceneId="scene1"
            camId="cam1"
            config={{ antialias: true, alpha: true }}
            enableShadowMap
            shadowMapType={PCFSoftShadowMap} />

</Canvas>