export const saveScene = (params) => {
  const { controls, renderer,scene,camera, canvas, filename = 'scene.png' } = params
  
  if (!controls || !renderer || !canvas) {
    console.error('缺少必要的 Three.js 参数')
    return
  }

  controls.update()
  renderer.render(scene, camera)
  
  const link = document.createElement('a')
  link.href = canvas.toDataURL('image/png')
  link.download = filename
  link.click()
}