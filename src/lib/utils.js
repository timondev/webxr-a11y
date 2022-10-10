import * as THREE from 'three'

const newMarker = (x, y, z, color) => {
  const geo = new THREE.SphereGeometry(0.04)
  const mat = new THREE.MeshBasicMaterial({ color: color || 0xff0000 })
  const mesh = new THREE.Mesh(geo, mat)
  if (typeof x === 'object') {
    mesh.position.copy(x)
  } else {
    mesh.position.set(x, y, z)
  }
  return mesh
}

const angleBetween = (point1, point2) => {
  return Math.atan2(point2.x - point1.x, point2.y - point1.y)
}

const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min)) + min
}

const detectWebXR = () => {
  if ('xr' in navigator) {
    navigator.xr.isSessionSupported('immersive-vr').then((supported) => {
      if (!supported) { document.getElementById('no-webxr').classList.remove('hidden') }
    })
  } else {
    document.getElementById('no-webxr').classList.remove('hidden')
  }
}

export { newMarker, angleBetween, getRandomInt, detectWebXR }
