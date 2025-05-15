<template>
    <Canvas :title="title" :saveToLocal="saveToLocal" ref="canvasRef"></Canvas>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import Canvas from '@/components/Canvas.vue'

import { saveScene } from '@/utils/threeUtils.js'

import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { TransformControls } from 'three-stdlib'
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

const title = ref('基础场景')

const canvasRef = ref(null)
let scene, camera, renderer, orbitControls, axesHelper, gridHelper,helperScene
let animationId = null

// 2. 初始化场景
const CreateScene = () => {
    // 创建核心对象
    scene = new THREE.Scene()
    helperScene = new THREE.Scene()
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
    const material = new THREE.MeshPhysicalMaterial({
        color: 0x00ff00,
        metalness: 0.5,
        roughness: 0.5,
        clearcoat: 1,
        clearcoatRoughness: 0.1
    })
    const cube = new THREE.Mesh(geometry, material)
    scene.add(cube)
    // 添加光源
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(5, 5, 5)
    scene.add(directionalLight)
    const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 1)
    directionalLightHelper.children.forEach(child => {
        child.geometry.computeBoundingSphere(); // 计算包围球
        child.userData.raycastable = true;      // 标记为可检测
    });
    scene.add(directionalLightHelper)
    const ambientLight = new THREE.AmbientLight(0x404040, 1)
    scene.add(ambientLight)
    const pointLight = new THREE.PointLight(0xffffff, 1, 100)
    pointLight.position.set(-2, -2, -2)
    scene.add(pointLight)
    const pointLightHelper = new THREE.PointLightHelper(pointLight, 1)
    scene.add(pointLightHelper)
    // 设置相机
    camera.position.z = 5
    camera.lookAt(0, 0, 0)

    // 控制器
    orbitControls = new OrbitControls(camera, renderer.domElement)
    orbitControls.enableDamping = true
    const transformControls = new TransformControls(camera, renderer.domElement);
    transformControls.setMode('translate');
    scene.add(transformControls);
    transformControls.addEventListener('dragging-changed', (event) => {
        orbitControls.enabled = !event.value;
    });
    renderer.domElement.addEventListener('click', (event) => {
        const px = event.offsetX;
        const py = event.offsetY;
        const width = canvasRef.value.canvas.width;
        const height = canvasRef.value.canvas.height;
        const x = (px / width) * 2 - 1;
        const y = -(py / height) * 2 + 1;
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
        const intersects = raycaster.intersectObjects([cube, directionalLightHelper, pointLightHelper]);
        if (intersects.length > 0) 
        {
            const selectedObject = intersects[0].object;
            if (selectedObject === cube) 
            {
                transformControls.attach(cube);
            } 
            else if (selectedObject === directionalLightHelper) 
            {
                transformControls.attach(directionalLight);
            } 
            else if (selectedObject === pointLightHelper) 
            {
                transformControls.attach(pointLight);
            }
        }
    });
    const gui = new GUI();
    const cubeFolder = gui.addFolder('Transform');
    cubeFolder.add(cube.position, 'x', -5, 5, 0.1).name('Cube X Position');
    cubeFolder.add(cube.position, 'y', -5, 5, 0.1).name('Cube Y Position');
    cubeFolder.add(cube.position, 'z', -5, 5, 0.1).name('Cube Z Position');
    cubeFolder.add(cube.rotation, 'x', 0, Math.PI * 2, 0.1).name('Cube X Rotation');
    cubeFolder.add(cube.rotation, 'y', 0, Math.PI * 2, 0.1).name('Cube Y Rotation');
    cubeFolder.add(cube.rotation, 'z', 0, Math.PI * 2, 0.1).name('Cube Z Rotation');
    cubeFolder.add(cube.scale, 'x', 0, 5, 0.1).name('Cube X Scale');
    cubeFolder.add(cube.scale, 'y', 0, 5, 0.1).name('Cube Y Scale');
    cubeFolder.add(cube.scale, 'z', 0, 5, 0.1).name('Cube Z Scale');
    cubeFolder.add({mode:'translate'}, 'mode', ['translate', 'rotate', 'scale']).name('Transform Mode').onChange((value) => {
        transformControls.setMode(value)
    })
    const lightFolder = gui.addFolder('Light');
    lightFolder.add(directionalLight.position, 'x', -5, 5, 0.1).name('Directional Light X Position');
    lightFolder.add(directionalLight.position, 'y', -5, 5, 0.1).name('Directional Light Y Position');
    lightFolder.add(directionalLight.position, 'z', -5, 5, 0.1).name('Directional Light Z Position');
    lightFolder.addColor(directionalLight, 'color').name('Directional Light Color');
    lightFolder.add(directionalLight, 'intensity', 0, 2, 0.1).name('Directional Light Intensity');
    lightFolder.add(pointLight.position, 'x', -5, 5, 0.1).name('Point Light X Position');
    lightFolder.add(pointLight.position, 'y', -5, 5, 0.1).name('Point Light Y Position');
    lightFolder.add(pointLight.position, 'z', -5, 5, 0.1).name('Point Light Z Position');
    lightFolder.addColor(pointLight, 'color').name('Point Light Color');
    lightFolder.add(pointLight, 'intensity', 0, 2, 0.1).name('Point Light Intensity');
    lightFolder.add(pointLight, 'distance', 0, 100, 1).name('Point Light Distance');
    lightFolder.add(ambientLight, 'intensity', 0, 2, 0.1).name('Ambient Light Intensity');
    lightFolder.addColor(ambientLight, 'color').name('Ambient Light Color');
    transformControls.addEventListener('change', () => {
       gui.controllers.forEach(controller => controller.updateDisplay());
    });
    // 动画循环
    const animate = () => {
        animationId = requestAnimationFrame(animate)
        orbitControls.update()
        renderer.autoClear = false  
        renderer.clear()
        renderer.render(scene, camera)
        // renderer.render(helperScene, camera)
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
    saveScene({
        controls: orbitControls,
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
    orbitControls?.dispose()
    renderer?.dispose()
    scene?.traverse(obj => {
        if (obj.isMesh) {
            obj.geometry.dispose()
            obj.material.dispose()
        }
    })
})
</script>