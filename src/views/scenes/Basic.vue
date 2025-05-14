<template>
    <Canvas :title="title" :saveToLocal="handleSave" ref="canvasRef"></Canvas>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import Canvas from '@/components/Canvas.vue'

import { saveScene } from '@/utils/threeUtils.js'

import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

const title = ref('基础场景')

const canvasRef = ref(null)
let scene, camera, renderer, controls, axesHelper, gridHelper
let animationId = null

// 2. 初始化场景
const CreateScene = () => {
    // 创建核心对象
    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.set(2, 3, 4)
    renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.value.canvas,
        antialias: true
    })

    // 设置渲染器
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x000000)

    // 添加辅助工具
    axesHelper = new THREE.AxesHelper(500)
    gridHelper = new THREE.GridHelper(10, 10)
    scene.add(axesHelper, gridHelper)

    // 创建立方体
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
    const cube = new THREE.Mesh(geometry, material)
    scene.add(cube)

    // 设置相机
    camera.position.z = 5
    camera.lookAt(0, 0, 0)

    // 控制器
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true

    // 动画循环
    const animate = () => {
        animationId = requestAnimationFrame(animate)
        controls.update()
        renderer.render(scene, camera)
    }
    animate()
}

// 3. 响应式处理
const handleResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
}
const handleSave = () => {
    saveScene({
        controls: controls,
        renderer: renderer,
        canvas: canvasRef.value.canvas,
        filename: 'basic_scene.png',
        scene: scene,
        camera: camera
    })
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