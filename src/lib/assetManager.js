import * as THREE from 'three'
import { BasisTextureLoader } from 'three/examples/jsm/loaders/BasisTextureLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'

// const BASIS_LIB_PATH = 'src/vendor/';
const BASIS_LIB_PATH = 'vendor/'
const DRACO_LIB_PATH = 'vendor/'

const getLoadedCount = (assets) => {
  let count = 0
  for (const i in assets) {
    if (assets[i].loading !== true) {
      count++
    }
  }
  return count
}

const allAssetsLoaded = (assets) => {
  for (const i in assets) {
    if (assets[i].loading === true) {
      return false
    }
  }
  return true
}

function loadAssets (
  renderer,
  basePath,
  assets,
  onComplete,
  onProgress,
  debug
) {
  if (basePath && basePath[basePath.length - 1] !== '/') {
    basePath += '/'
  }

  const basisLoader = new BasisTextureLoader()
  basisLoader.setTranscoderPath(BASIS_LIB_PATH)
  basisLoader.detectSupport(renderer)

  const gltfLoader = new GLTFLoader()
  const dracoLoader = new DRACOLoader()
  dracoLoader.setDecoderPath(DRACO_LIB_PATH)
  gltfLoader.setDRACOLoader(dracoLoader)

  const texLoader = new THREE.TextureLoader()
  const objLoader = new OBJLoader()
  const fontLoader = new FontLoader()
  const audioLoader = new THREE.AudioLoader()

  const loaders = {
    gltf: gltfLoader,
    glb: gltfLoader,
    obj: objLoader,
    gif: texLoader,
    png: texLoader,
    jpg: texLoader,
    basis: basisLoader,
    font: fontLoader,
    ogg: audioLoader
  }

  for (const i in assets) {
    const assetId = i
    const assetPath = assets[i].url
    assets[i].loading = true
    const ext = assetPath.substr(assetPath.lastIndexOf('.') + 1).toLowerCase()
    loaders[ext].load(
      basePath + assetPath,
      (asset) => {
        if (debug) {
          console.info(`%c ${assetPath} loaded`, 'color:green')
        }
        const options = assets[assetId].options
        assets[assetId] = ext === 'font' ? asset.data : asset

        if (typeof options !== 'undefined') {
          if (typeof options.repeat !== 'undefined') {
            assets[assetId].repeat.set(options.repeat[0], options.repeat[1])
            delete options.repeat
          }
          for (const opt in options) {
            assets[assetId][opt] = options[opt]
          }

          if (onProgress) {
            onProgress(getLoadedCount(assets))
          }
        }

        if (onComplete && allAssetsLoaded(assets)) {
          onComplete()
        }
      },
      () => {
        /* on progress */
      },
      (e) => {
        console.error('Error loading asset', e)
      }
    )
  }
}

export { loadAssets }
