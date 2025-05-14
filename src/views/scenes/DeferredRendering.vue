<template>
    <Canvas :title="title" :saveToLocal="saveToLocal" ref="canvasRef"></Canvas>
</template>


<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import Canvas from '@/components/Canvas.vue'
import { saveScene } from '@/utils/threeUtils.js'
//shader
import gBufferVertexShader from '@/shaders/gBuffer.vert?raw'
import gBufferFragmentShader from '@/shaders/gBuffer.frag?raw'
import lightingVertexShader from '@/shaders/lighting.vert?raw'
import lightingFragmentShader from '@/shaders/lighting.frag?raw'

import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

const title = ref('延迟渲染')
const canvasRef = ref(null)
let scene, camera, renderer, controls, axesHelper, gridHelper, deferredScene
let animationId = null

const CreateScene = () => {
    scene = new THREE.Scene()
    deferredScene = new THREE.Scene()
    axesHelper = new THREE.AxesHelper(500)
    gridHelper = new THREE.GridHelper(10, 10)
    scene.add(axesHelper, gridHelper)
    deferredScene.add(axesHelper,gridHelper)
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
    const lightingMaterial = new THREE.ShaderMaterial({
        vertexShader: lightingVertexShader,
        fragmentShader: lightingFragmentShader,
        uniforms: {
            tAlbedo: { value: gBuffer.textures[0] },
            tNormal: { value: gBuffer.textures[1] },
            tWorldPos: { value: gBuffer.textures[2] },
            tMetallicRoughness: { value: gBuffer.textures[3] },
            debugMode: { value: 0 },
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
    const quad = new THREE.Mesh(quadGeometry, deferredMaterial);
    deferredScene.add(quad);
    // 控制器
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    // 动画循环
    const animate = () => {
        animationId = requestAnimationFrame(animate)
        controls.update()

        //G-Buffer Stage
        renderer.setRenderTarget(gBuffer)
        renderer.render(scene, camera)
        // Lighting Stage
        renderer.setRenderTarget(null)
        renderer.render(deferredScene, camera)
    }
    animate()
}


const handleResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
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