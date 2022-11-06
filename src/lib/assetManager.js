import * as THREE from "three";
import { BasisTextureLoader } from "three/examples/jsm/loaders/BasisTextureLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";

//const BASIS_LIB_PATH = 'src/vendor/';
const BASIS_LIB_PATH = "vendor/";
const DRACO_LIB_PATH = "vendor/";

const getLoadedCount = (assets) =>  {
  let count = 0;
  for (let i in assets) {
    if (assets[i].loading !== true) {
      count++;
    }
  }
  return count;
}

const allAssetsLoaded = (assets) =>  {
  for (let i in assets) {
    if (assets[i].loading === true) {
      return false;
    }
  }
  return true;
}

const loadAsset = async (
  renderer,
  asset
) => {
  const basisLoader = new BasisTextureLoader();
  basisLoader.setTranscoderPath(BASIS_LIB_PATH);
  basisLoader.detectSupport(renderer);

  const gltfLoader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath(DRACO_LIB_PATH);
  gltfLoader.setDRACOLoader(dracoLoader);

  const texLoader = new THREE.TextureLoader();
  const objLoader = new OBJLoader();
  const fontLoader = new FontLoader();
  const audioLoader = new THREE.AudioLoader();

  const loaders = {
    gltf: gltfLoader,
    glb: gltfLoader,
    obj: objLoader,
    gif: texLoader,
    png: texLoader,
    jpg: texLoader,
    basis: basisLoader,
    font: fontLoader,
    ogg: audioLoader,
  };

  let assetPath = asset.url;
  let ext = assetPath.substr(assetPath.lastIndexOf(".") + 1).toLowerCase();

  return new Promise((resolve) => { loaders[ext].load(
    assetPath,
    (loadedAsset) => {
      const options = asset.options;
      asset = ext == "font" ? loadedAsset.data : loadedAsset;

      if (typeof options !== "undefined") {
        if (typeof options.repeat !== "undefined") {
          asset.repeat.set(options.repeat[0], options.repeat[1]);
          delete options.repeat;
        }
        for (let opt in options) {
          asset[opt] = options[opt];
        }
      }

      resolve(asset)
    },
    () => {
      /* on progress */
    },
    (e) => {
      console.error("Error loading asset", e);
    }
  )});
}

function loadAssets(
  renderer,
  basePath,
  assets,
  onComplete,
  onProgress,
  debug
) {
  if (basePath && basePath[basePath.length - 1] != "/") {
    basePath += "/";
  }

  const basisLoader = new BasisTextureLoader();
  basisLoader.setTranscoderPath(BASIS_LIB_PATH);
  basisLoader.detectSupport(renderer);

  const gltfLoader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath(DRACO_LIB_PATH);
  gltfLoader.setDRACOLoader(dracoLoader);

  const texLoader = new THREE.TextureLoader();
  const objLoader = new OBJLoader();
  const fontLoader = new FontLoader();
  const audioLoader = new THREE.AudioLoader();

  const loaders = {
    gltf: gltfLoader,
    glb: gltfLoader,
    obj: objLoader,
    gif: texLoader,
    png: texLoader,
    jpg: texLoader,
    basis: basisLoader,
    font: fontLoader,
    ogg: audioLoader,
  };

  for (let i in assets) {
    let assetId = i;
    let assetPath = assets[i].url;
    assets[i].loading = true;
    let ext = assetPath.substr(assetPath.lastIndexOf(".") + 1).toLowerCase();
    loaders[ext].load(
      basePath + assetPath,
      (asset) => {
        if (debug) {
          console.info(`%c ${assetPath} loaded`, "color:green");
        }
        const options = assets[assetId].options;
        assets[assetId] = ext == "font" ? asset.data : asset;

        if (typeof options !== "undefined") {
          if (typeof options.repeat !== "undefined") {
            assets[assetId].repeat.set(options.repeat[0], options.repeat[1]);
            delete options.repeat;
          }
          for (let opt in options) {
            assets[assetId][opt] = options[opt];
          }

          if (onProgress) {
            onProgress(getLoadedCount(assets));
          }
        }

        if (onComplete && allAssetsLoaded(assets)) {
          onComplete();
        }
      },
      () => {
        /* on progress */
      },
      (e) => {
        console.error("Error loading asset", e);
      }
    );
  }
}

export { loadAsset, loadAssets };