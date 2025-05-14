<template>
    <Canvas :title="title" :saveToLocal="saveToLocal" ref="canvasRef">
    </Canvas>
</template>


<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import Canvas from '@/components/Canvas.vue'
import { saveScene } from '@/utils/threeUtils.js'
import { TransformControls } from 'three-stdlib'
//shader
import gBufferVertexShader from '@/shaders/gBuffer.vert?raw'
import gBufferFragmentShader from '@/shaders/gBuffer.frag?raw'
import lightingVertexShader from '@/shaders/lighting.vert?raw'
import lightingFragmentShader from '@/shaders/lighting.frag?raw'

import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
const title = ref('延迟渲染')
const canvasRef = ref(null)
let scene, camera, renderer, controls, axesHelper, gridHelper, deferredScene,forwardScene,lightingMaterial
let animationId = null
let pointLightIndex = 0
let pointLights = []
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
            glslVersion: THREE.GLSL3,
        }
    )
    const cube = new THREE.Mesh(geometry, gBufferMaterial)
    scene.add(cube)

    // lighting
    for(let i = 0; i < 10; i++) {
        const light = new THREE.PointLight(0xffffff, 1, 100)
        light.position.set(Math.random() * 10 - 5, Math.random() * 10 - 5, Math.random() * 10 - 5)
        light.color.setHSL(Math.random(), 1, 0.5)
        deferredScene.add(light)
        pointLights.push(light)
    }
    lightingMaterial = new THREE.ShaderMaterial({
        vertexShader: lightingVertexShader,
        fragmentShader: lightingFragmentShader,
        depthWrite: false,
        uniforms: {
            tAlbedo: { value: gBuffer.textures[0] },
            tNormal: { value: gBuffer.textures[1] },
            tPosition: { value: gBuffer.textures[2] },
            tMetallicRoughness: { value: gBuffer.textures[3] },
            debugMode: { value: 1 },
            pointLightPosition : { value: pointLights.map(light => light.position) },
            pointLightColor : { value: pointLights.map(light => light.color) },
            pointLightIntensity : { value: pointLights.map(light => light.intensity) }
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
    const gui = new GUI();
    gui.domElement.classList.add('light')
    const debugFolder = gui.addFolder('Debug')
    debugFolder.add(lightingMaterial.uniforms.debugMode, 'value', [0,1,2,3,4]).name('Debug Mode').onChange(changeRender)
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
    lightFolder.add({ lightIndex: pointLightIndex }, 'lightIndex', pointLights.map((_, index) => index)).name('Light Index').onChange((index) => {
        pointLightIndex = index
    })
    lightFolder.add(pointLights[pointLightIndex].position, 'x', -5, 5, 0.1).name('Light X Position')
    lightFolder.add(pointLights[pointLightIndex].position, 'y', -5, 5, 0.1).name('Light Y Position')
    lightFolder.add(pointLights[pointLightIndex].position, 'z', -5, 5, 0.1).name('Light Z Position')
    lightFolder.add(pointLights[pointLightIndex], 'intensity', 0, 10, 0.1).name('Light Intensity')
    lightFolder.addColor(pointLights[pointLightIndex], 'color').name('Light Color').onChange((color) => {
        pointLights[pointLightIndex].color.set(color)
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