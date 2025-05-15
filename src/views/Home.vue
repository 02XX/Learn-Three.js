<template>
    <div class="container mx-auto max-w-[1200px] p-8">
        <nav class="text-center mb-12">
            <h1 class="text-4xl text-gray-800">Three.js实验室</h1>
        </nav>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <!-- 场景卡片循环 -->
            <div v-for="scene in scenes" :key="scene.id"
                class="bg-white rounded-lg overflow-hidden shadow-md transition-all duration-300 ease-in-out cursor-pointer hover:-translate-y-1 hover:shadow-lg"
                @click="navigateTo(scene)">
                <!--缩略图容器 -->
                <div class=" relative w-full h-48 overflow-hidden">
                    <img v-if="scene.thumbnail" :src="scene.thumbnail" :alt="scene.name"
                        class="w-full h-full object-cover transition-transform duration-300 ease-in-out hover:scale-105">
                    <!-- 默认缩略图 -->
                    <div v-else
                        class="w-full h-full bg-gradient-to-br from-green-400 to-gray-800 flex items-center justify-center text-white text-5xl font-bold">
                        {{ scene.name.charAt(0) }}
                    </div>
                </div>

                <!-- 场景信息 -->
                <div class="p-6">
                    <h3 class="text-xl text-gray-800 mb-2">{{ scene.name }}</h3>
                    <p class="text-gray-600 text-sm mb-4 line-clamp-2">
                        {{ scene.description }}
                    </p>
                    <span class="inline-block px-3 py-1 bg-green-600 text-white rounded text-sm">
                        点击查看
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

// 场景数据
const scenes = [
    {
        id: 1,
        name: '基础场景',
        path: '/basic',
        description: '展示基础场景',
        thumbnail: './thumbnails/basic.png'
    },
    {
        id: 2,
        name: '延迟渲染',
        path: '/deferred',
        description: '展示延迟渲染',
        thumbnail: './thumbnails/deferred.png'
    },
    {
        id: 3,
        name: 'PBR渲染',
        path: '/pbr',
        description: '展示PBR渲染',
        thumbnail: './thumbnails/basic.png'
    },
    {
        id: 4,
        name: '自定义场景',
        path: '/custom',
        description: '上传并查看您的3D模型',
        thumbnail: null
    },
    {
        id: 5,
        name: '自定义场景',
        path: '/custom',
        description: '上传并查看您的3D模型',
        thumbnail: null
    }
]

// 路由跳转
const navigateTo = (scene) => {
    router.push({
        path: scene.path
    })
}
</script>