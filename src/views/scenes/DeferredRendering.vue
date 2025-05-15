<template>
    <Canvas :title="title" :saveToLocal="saveToLocal" ref="canvasRef">
    </Canvas>
</template>


<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import Canvas from '@/components/Canvas.vue'
import { saveScene } from '@/utils/threeUtils.js'
//shader
import gBufferVertexShader from '@/shaders/gBuffer.vert?raw'
import gBufferFragmentShader from '@/shaders/gBuffer.frag?raw'
import lightingVertexShader from '@/shaders/lighting.vert?raw'
import lightingFragmentShader from '@/shaders/lighting.frag?raw'

import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { TransformControls } from 'three-stdlib'
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
const title = ref('延迟渲染')
const canvasRef = ref(null)
const textureLoader = new THREE.TextureLoader()
let scene, camera, renderer, controls, axesHelper, gridHelper, deferredScene,forwardScene,lightingMaterial
let animationId = null
let directionalLightIndex = 0
let directionalLights = []
const CreateScene = () => {
    scene = new THREE.Scene()
    deferredScene = new THREE.Scene()
    forwardScene = new THREE.Scene()
    axesHelper = new THREE.AxesHelper(500)
    gridHelper = new THREE.GridHelper(10, 10)
    forwardScene.add(axesHelper, gridHelper)
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.set(2, 3, 4)
    camera.lookAt(0, 0, 0)

    renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.value.canvas,
        antialias: true
    })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x000000)
    const rock_wall_albedo = textureLoader.load('textures/rock_wall/rock_wall_13_diff_4k.png')
    const rock_wall_normal = textureLoader.load('textures/rock_wall/rock_wall_13_nor_gl_4k.png')
    const rock_wall_arm = textureLoader.load('textures/rock_wall/rock_wall_13_arm_4k.png')
    // G-Buffer
    const gBuffer = new THREE.WebGLRenderTarget(
        window.innerWidth,
        window.innerHeight,
        {
            samples: 4,
            type: THREE.FloatType,
            colorSpace: THREE.LinearSRGBColorSpace,
            format: THREE.RGBAFormat,
            count: 4 //1.albedo 2.normal 3.world pos 4.metallic/roughness
        }
    )

    // 创建立方体
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const gBufferMaterial = new THREE.ShaderMaterial(
        {
            vertexShader: gBufferVertexShader,
            fragmentShader: gBufferFragmentShader,
            uniforms:{
                uAlbedo: { value: rock_wall_albedo },
                uArm: { value: rock_wall_arm },
                uNormal: { value: rock_wall_normal },
                albedo: { value: new THREE.Vector3(1, 1, 1) },
                metallic: { value: 0.5 },
                roughness: { value: 0.5 },
                normal: { value: 1 },
            },
            glslVersion: THREE.GLSL3,
        }
    )
    const cube = new THREE.Mesh(geometry, gBufferMaterial)
    scene.add(cube)

    // lighting
    for(let i = 0; i < 2; i++) {
        const light = new THREE.DirectionalLight(0xffffff, 1, 100)
        light.position.set(2,2,2)
        deferredScene.add(light)
        directionalLights.push(light)
        const sphereSize = 1;
        const directionalLightHelper = new THREE.DirectionalLightHelper( light, sphereSize );
        deferredScene.add( directionalLightHelper );
    }
    lightingMaterial = new THREE.ShaderMaterial({
        vertexShader: lightingVertexShader,
        fragmentShader: lightingFragmentShader,
        depthWrite: false,
        uniforms: {
            tAlbedo: { value: gBuffer.textures[0] },
            tNormal: { value: gBuffer.textures[1] },
            tPosition: { value: gBuffer.textures[2] },
            tArm: { value: gBuffer.textures[3] },
            debugMode: { value: 0 },
            directionalLightPosition : { value: directionalLights.map(light => light.position) },
            directionalLightColor : { value: directionalLights.map(light => light.color) },
            directionalLightIntensity : { value: directionalLights.map(light => light.intensity) }
        },
        glslVersion: THREE.GLSL3
    })
    const quadGeometry = new THREE.BufferGeometry();
    quadGeometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0], 3)
    );
    quadGeometry.setAttribute(
        'uv',
        new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 1], 2)
    );
    quadGeometry.setIndex([0, 1, 2, 0, 2, 3]);
    const quad = new THREE.Mesh(quadGeometry, lightingMaterial);
    deferredScene.add(quad);
    // 控制器
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    const transformControls = new TransformControls(camera, renderer.domElement);
    transformControls.setMode('translate');
    scene.add(transformControls);
    transformControls.addEventListener('dragging-changed', (event) => {
        orbitControls.enabled = !event.value;
    });
    const gui = new GUI();
    gui.domElement.classList.add('light')
    const debugFolder = gui.addFolder('Debug')
    debugFolder.add(lightingMaterial.uniforms.debugMode, 'value', [0,1,2,3,4,5]).name('Debug Mode').onChange(changeRender)
    const cubeFolder = gui.addFolder('Cube')
    cubeFolder.add(cube.position, 'x', -5, 5, 0.1).name('Cube X Position');
    cubeFolder.add(cube.position, 'y', -5, 5, 0.1).name('Cube Y Position');
    cubeFolder.add(cube.position, 'z', -5, 5, 0.1).name('Cube Z Position');
    cubeFolder.add(cube.rotation, 'x', 0, Math.PI * 2, 0.1).name('Cube Rotation X');
    cubeFolder.add(cube.rotation, 'y', 0, Math.PI * 2, 0.1).name('Cube Rotation Y');
    cubeFolder.add(cube.rotation, 'z', 0, Math.PI * 2, 0.1).name('Cube Rotation Z');
    cubeFolder.add(cube.scale, 'x', 0, 5, 0.1).name('Cube Scale X');
    cubeFolder.add(cube.scale, 'y', 0, 5, 0.1).name('Cube Scale Y');
    cubeFolder.add(cube.scale, 'z', 0, 5, 0.1).name('Cube Scale Z');
    const lightFolder = gui.addFolder('Light')
    lightFolder.add({ lightIndex: directionalLightIndex }, 'lightIndex', directionalLights.map((_, index) => index)).name('Light Index').onChange((index) => {
        directionalLightIndex = index
    })
    lightFolder.add(directionalLights[directionalLightIndex].position, 'x', -5, 5, 0.1).name('Light X Position')
    lightFolder.add(directionalLights[directionalLightIndex].position, 'y', -5, 5, 0.1).name('Light Y Position')
    lightFolder.add(directionalLights[directionalLightIndex].position, 'z', -5, 5, 0.1).name('Light Z Position')
    lightFolder.add(directionalLights[directionalLightIndex], 'intensity', 0, 10, 0.1).name('Light Intensity')
    lightFolder.addColor(directionalLights[directionalLightIndex], 'color').name('Light Color').onChange((color) => {
        directionalLights[directionalLightIndex].color.set(color)
    })
    // 动画循环
    const animate = () => {
        animationId = requestAnimationFrame(animate)
        controls.update()
        //G-Buffer Stage
        renderer.setRenderTarget(gBuffer)
        renderer.clear();
        renderer.render(scene, camera)
        // Lighting Stage
        renderer.setRenderTarget(null)
        renderer.clear();
        renderer.render(deferredScene, camera)
    }
    animate()
}

const saveToLocal = () => {
    saveScene({
        controls: controls,
        renderer: renderer,
        canvas: canvasRef.value.canvas,
        filename: 'deferred_scene.png',
        scene: scene,
        camera: camera
    })
}

const handleResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
}
const changeRender = (value) => {
    lightingMaterial.uniforms.debugMode.value = value;
}
onMounted(() => {
    CreateScene()
    window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize)
    cancelAnimationFrame(animationId)
    // 手动清理资源
    controls?.dispose()
    renderer?.dispose()
    scene?.traverse(obj => {
        if (obj.isMesh) {
            obj.geometry.dispose()
            obj.material.dispose()
        }
    })
})
</script>