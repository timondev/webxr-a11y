import * as THREE from 'three'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js'

import { VRButton } from './lib/VRButton.js'
import { slideshow } from './lib/slideshow.js'
import { loadAssets } from './lib/assetManager.js'

// ECSY
import { World } from 'ecsy'
import { SDFTextSystem } from './systems/SDFTextSystem.js'
import { DebugHelperSystem } from './systems/DebugHelperSystem.js'
import { AreaCheckerSystem } from './systems/AreaCheckerSystem.js'
import { ControllersSystem } from './systems/ControllersSystem.js'
import { HierarchySystem } from './systems/HierarchySystem.js'
import { TransformSystem } from './systems/TransformSystem.js'
import { BillboardSystem } from './systems/BillboardSystem.js'

import { SystemsGroup } from './systems/SystemsGroup.js'

import assets from './assets.js'

import {
  Object3D,
  Rotation,
  Position,
  ParentObject3D,
  Text,
  BoundingBox,
  BoundingSphere,
  Area,
  AreaEntering,
  AreaExiting,
  AreaInside,
  AreaChecker,
  AreaReactor,
  DebugHelper,
  DebugHelperMesh,
  Billboard,
  Children,
  Opacity
} from './components.js'

import { RayControl } from './lib/RayControl.js'
import { Teleport } from './lib/Teleport.js'

import * as roomHall from './rooms/Hall.js'
import * as roomPanorama from './rooms/Panorama.js'
import * as roomPanoramaStereo from './rooms/PanoramaStereo.js'
import * as roomPhotogrammetryObject from './rooms/PhotogrammetryObject.js'
import * as roomVertigo from './rooms/Vertigo.js'
import * as roomSound from './rooms/Sound.js'

import { shaders } from './lib/shaders.js'

import WebXRPolyfill from 'webxr-polyfill'
import { detectWebXR } from './lib/utils.js'
// eslint-disable-next-line no-unused-vars
const polyfill = new WebXRPolyfill()

const clock = new THREE.Clock()

let scene
let parent
let renderer
let camera
let controls
const context = {}
let raycontrol
let teleport
const controllers = []

let listener, ambientMusic

const rooms = [
  roomHall,
  roomSound,
  roomPhotogrammetryObject,
  roomVertigo,
  roomPanoramaStereo,
  roomPanorama,
  roomPanorama,
  roomPanorama,
  roomPanorama,
  roomPanorama
]

const roomNames = [
  'hall',
  'sound',
  'photogrammetry',
  'vertigo',
  'panoramastereo',
  'panorama1',
  'panorama2',
  'panorama3',
  'panorama4',
  'panorama5'
]

const musicThemes = [
  false,
  false,
  'chopin_snd',
  'wind_snd',
  false,
  'birds_snd',
  'birds_snd',
  'forest_snd',
  'wind_snd',
  'birds_snd'
]

const urlObject = new URL(window.location)
const roomName = urlObject.searchParams.get('room')
context.room =
  roomNames.indexOf(roomName) !== -1 ? roomNames.indexOf(roomName) : 0
const debug = urlObject.searchParams.has('debug')
const handedness = urlObject.searchParams.has('handedness')
  ? urlObject.searchParams.get('handedness')
  : 'right'

// Target positions when moving from one room to another
const targetPositions = {
  hall: {
    sound: new THREE.Vector3(0, 0, 0),
    photogrammetry: new THREE.Vector3(1, 0, 0),
    vertigo: new THREE.Vector3(0, 0, 0)
  },
  photogrammetry: {
    hall: new THREE.Vector3(-3.6, 0, 2.8)
  },
  sound: {
    hall: new THREE.Vector3(4.4, 0, 4.8)
  },
  vertigo: {
    hall: new THREE.Vector3(-1.8, 0, -5)
  }
}

const gotoRoom = (room) => {
  rooms[context.room].exit(context)
  raycontrol.deactivateAll()

  const prevRoom = roomNames[context.room]
  const nextRoom = roomNames[room]

  if (targetPositions[prevRoom] && targetPositions[prevRoom][nextRoom]) {
    const deltaPosition = new THREE.Vector3()
    const targetPosition = targetPositions[prevRoom][nextRoom]
    const camera = renderer.xr.getCamera(context.camera)

    deltaPosition.x = camera.position.x - targetPosition.x
    deltaPosition.z = camera.position.z - targetPosition.z

    context.cameraRig.position.sub(deltaPosition)
  }

  context.room = room

  playMusic(room)

  rooms[context.room].enter(context)
}

const playMusic = (room) => {
  if (ambientMusic.source) ambientMusic.stop()

  const music = musicThemes[room]
  if (!music) {
    return
  }
  ambientMusic.setBuffer(assets[music])
  ambientMusic.setLoop(true)
  ambientMusic.setVolume(1.0)
  ambientMusic.offset = Math.random() * 60
  ambientMusic.play()
}

const ecsyWorld = new World()
const systemsGroup = {}

const init = () => {
  document.getElementById(handedness + 'hand').classList.add('activehand')

  detectWebXR()

  ecsyWorld
    .registerComponent(Object3D)
    .registerComponent(Rotation)
    .registerComponent(Position)
    .registerComponent(ParentObject3D)
    .registerComponent(Text)
    .registerComponent(BoundingBox)
    .registerComponent(BoundingSphere)
    .registerComponent(Area)
    .registerComponent(AreaEntering)
    .registerComponent(AreaExiting)
    .registerComponent(AreaInside)
    .registerComponent(AreaChecker)
    .registerComponent(AreaReactor)
    .registerComponent(DebugHelper)
    .registerComponent(DebugHelperMesh)
    .registerComponent(Billboard)
    .registerComponent(Children)
    .registerComponent(Opacity)

  ecsyWorld
    .registerSystem(SDFTextSystem)
    .registerSystem(AreaCheckerSystem)
    .registerSystem(ControllersSystem)
    .registerSystem(DebugHelperSystem)
    .registerSystem(TransformSystem)
    .registerSystem(BillboardSystem)
    .registerSystem(HierarchySystem)

  systemsGroup.roomHall = new SystemsGroup(ecsyWorld, [
    AreaCheckerSystem,
    ControllersSystem,
    DebugHelperSystem
  ])

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    logarithmicDepthBuffer: false
  })
  renderer.outputEncoding = THREE.sRGBEncoding
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.xr.enabled = true

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(
    80,
    window.innerWidth / window.innerHeight,
    0.005,
    10000
  )
  camera.position.set(0, 1.6, 0)
  listener = new THREE.AudioListener()
  camera.add(listener)

  ambientMusic = new THREE.Audio(listener)

  controls = new PointerLockControls(camera, renderer.domElement)
  scene.add(controls.getObject())

  parent = new THREE.Object3D()
  scene.add(parent)

  window.addEventListener('resize', onWindowResize, false)

  for (let i = 0; i < 2; i++) {
    controllers[i] = renderer.xr.getController(i)
    controllers[i].raycaster = new THREE.Raycaster()
    controllers[i].raycaster.near = 0.1
    controllers[i].addEventListener('selectstart', onSelectStart)
    controllers[i].addEventListener('selectend', onSelectEnd)
  }

  // global lights
  const lightSun = new THREE.DirectionalLight(0xeeffff)
  lightSun.name = 'sun'
  lightSun.position.set(0.2, 1, 0.1)
  const lightFill = new THREE.DirectionalLight(0xfff0ee, 0.3)
  lightFill.name = 'fillLight'
  lightFill.position.set(-0.2, -1, -0.1)

  scene.add(lightSun, lightFill)

  const cameraRig = new THREE.Group()
  cameraRig.add(camera)
  cameraRig.add(controllers[0])
  cameraRig.add(controllers[1])
  cameraRig.position.set(0, 0, 2)
  scene.add(cameraRig)

  context.vrMode = false // in vr
  context.assets = assets
  context.shaders = shaders
  context.scene = parent
  context.renderer = renderer
  context.camera = camera
  context.audioListener = listener
  context.goto = null
  context.cameraRig = cameraRig
  context.controllers = controllers
  context.world = ecsyWorld
  context.systemsGroup = systemsGroup
  context.handedness = handedness

  window.context = context

  const loadTotal = Object.keys(assets).length

  loadAssets(
    renderer,
    'assets/',
    assets,
    () => {
      raycontrol = new RayControl(context, handedness)
      context.raycontrol = raycontrol

      teleport = new Teleport(context)
      context.teleport = teleport

      setupControllers()
      roomHall.setup(context)
      roomPanorama.setup(context)
      roomPanoramaStereo.setup(context)
      roomPhotogrammetryObject.setup(context)
      roomVertigo.setup(context)
      roomSound.setup(context)

      rooms[context.room].enter(context)

      slideshow.setup(context)

      document.body.appendChild(renderer.domElement)
      document.body.appendChild(
        VRButton.createButton(renderer, (_, status) => {
          context.vrMode = status === 'sessionStarted'
          if (context.vrMode) {
            gotoRoom(0)
            context.cameraRig.position.set(0, 0, 2)
            context.goto = null
          } else {
            slideshow.setup(context)
          }
        })
      )
      renderer.setAnimationLoop(animate)

      document.getElementById('loading').style.display = 'none'
    },

    (loadProgress) => {
      document
        .querySelector('#progressbar')
        .setAttribute(
          'stroke-dashoffset',
          -(282 - Math.floor((loadProgress / loadTotal) * 282))
        )
    },
    debug
  )
}

const setupControllers = () => {
  const model = assets.generic_controller_model.scene
  const material = new THREE.MeshLambertMaterial({
    map: assets.controller_tex
  })
  model.getObjectByName('body').material = material
  model.getObjectByName('trigger').material = material

  for (let i = 0; i < 2; i++) {
    const controller = controllers[i]
    controller.boundingBox = new THREE.Box3()
    controller.userData.grabbing = null
    controller.addEventListener('connected', function (event) {
      this.add(model.clone())
      raycontrol.addController(this, event.data)
    })
    controller.addEventListener('disconnect', function () {
      this.remove(this.children[0])
      raycontrol.removeController(this, event.data)
    })
  }
}

// @FIXME Hack for Oculus Browser issue
const selectStartSkip = {}
const selectEndSkip = {}
const OculusBrowser =
  navigator.userAgent.indexOf('OculusBrowser') !== -1 &&
  parseInt(navigator.userAgent.match(/OculusBrowser\/([0-9]+)./)[1]) < 8

// <@FIXME

const onSelectStart = (ev) => {
  // @FIXME Hack for Oculus Browser issue
  if (OculusBrowser) {
    const controller = ev.target
    if (!selectStartSkip[controller]) {
      selectStartSkip[controller] = true
      return
    }
    selectStartSkip[controller] = false
  }
  // <@FIXME

  const trigger = ev.target.getObjectByName('trigger')
  trigger.rotation.x = -0.3
  raycontrol.onSelectStart(ev)
}

const onSelectEnd = (ev) => {
  // @FIXME Hack for Oculus Browser issue
  if (OculusBrowser) {
    const controller = ev.target
    if (!selectEndSkip[controller]) {
      selectEndSkip[controller] = true
      return
    }
    selectEndSkip[controller] = false
  }
  // <@FIXME

  const trigger = ev.target.getObjectByName('trigger')
  trigger.rotation.x = 0
  raycontrol.onSelectEnd(ev)
}

const onWindowResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

const animate = () => {
  const delta = clock.getDelta()
  const elapsedTime = clock.elapsedTime

  ecsyWorld.execute(delta, elapsedTime)

  // update controller bounding boxes
  for (let i = 0; i < controllers.length; i++) {
    const model = controllers[i].getObjectByName('Scene')
    if (model) {
      controllers[i].boundingBox.setFromObject(model)
    }
  }

  // render current room
  context.raycontrol.execute(context, delta, elapsedTime)
  rooms[context.room].execute(context, delta, elapsedTime)
  if (!context.vrMode) {
    slideshow.execute(context, delta, elapsedTime)
  }

  renderer.render(scene, camera)
  if (context.goto !== null) {
    gotoRoom(context.goto)
    context.goto = null
  }
}

window.onload = () => {
  init()
}

export { init }
