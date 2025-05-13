<template>
    <div class="w-full h-full relative bg-gray-800">
        <canvas ref="canvas"></canvas>
        <h1 class="absolute top-8 left-0 right-0 text-center text-4xl font-bold text-white z-10">
            {{ title }}
        </h1>
        <button @click="saveToLocal"
            class="fixed bottom-4 right-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-20">
            保存图片到本地
        </button>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

const route = useRoute()
const title = ref(route.meta?.title || '默认标题')

const canvas = ref(null)
let scene, camera, renderer, controls, axesHelper, gridHelper
let animationId = null

// 2. 初始化场景
const CreateScene = () => {
    // 创建核心对象
    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.set(2, 3, 4)
    renderer = new THREE.WebGLRenderer({
        canvas: canvas.value,
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
const saveToLocal = () => {
    controls.update()
    renderer.render(scene, camera)
    const imageData = canvas.value.toDataURL('image/png')
    const link = document.createElement('a')
    link.href = imageData
    link.download = 'basic-scene.png'
    link.click()
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