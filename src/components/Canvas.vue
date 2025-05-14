<template>
    <div class="w-full h-full relative bg-gray-800">
        <canvas ref="canvas"></canvas>
        <h1 class="absolute top-8 left-0 right-0 text-center text-4xl font-bold text-white z-10">
            {{ title }}
        </h1>
        <div class="absolute top-0 left-0 z-10 text-white">
            <slot></slot>
        </div>
        <button @click="saveToLocal"
            class="fixed bottom-4 right-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-20">
            保存图片到本地
        </button>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
const props = defineProps({
    title: {
        type: String,
        default: '默认标题'
    },
    saveToLocal: {
        type: Function,
        default: () => {}
    }
})
const canvas = ref(null);
defineExpose({
  canvas,
});
</script>