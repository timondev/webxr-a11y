import * as THREE from 'three'
import { PositionalAudioPolyphonic } from '../lib/PositionalAudioPolyphonic.js'

let
  listener
const xyloSticks = [null, null]
const xyloStickBalls = [null, null]
const xyloNotes = new Array(13)
const bbox = new THREE.Box3()
let hallRef = null

const auxVec = new THREE.Vector3()

const NUM_NOTES = 13

const stickNotesColliding = [
  new Array(NUM_NOTES).fill(false),
  new Array(NUM_NOTES).fill(false)
]

let _ctx = null

const setup = (ctx, hall) => {
  _ctx = ctx
  const audioLoader = new THREE.AudioLoader()
  listener = new THREE.AudioListener()
  hallRef = hall

  for (let i = 0; i < NUM_NOTES; i++) {
    const noteName = 'xnote0' + (i < 10 ? '0' + i : i)
    const note = hall.getObjectByName(noteName)
    note.geometry.computeBoundingBox()
    note.geometry.boundingBox.translate(note.position).translate(note.parent.position)
    note.material = new THREE.MeshLambertMaterial()
    note.material.color.setHSL(i / 13, 0.9, 0.2)
    note.material.emissive = note.material.color.clone()
    note.material.emissiveIntensity = 0
    xyloNotes[i] = note
    note.userData.animation = 0
    note.userData.resetY = note.position.y
    note.userData.sound = new PositionalAudioPolyphonic(listener, 10)
    audioLoader.load('assets/ogg/xylophone' + (i + 1) + '.ogg', buffer => {
      note.userData.sound.setBuffer(buffer)
    })
  }

  xyloSticks[0] = hall.getObjectByName('xylostick-left')
  xyloSticks[1] = hall.getObjectByName('xylostick-right')
  xyloSticks[0].userData.resetPosition = xyloSticks[0].position.clone()
  xyloSticks[1].userData.resetPosition = xyloSticks[1].position.clone()
  xyloSticks[0].userData.resetRotation = xyloSticks[0].rotation.clone()
  xyloSticks[1].userData.resetRotation = xyloSticks[1].rotation.clone()
  xyloSticks[0].userData.grabbedBy = null
  xyloSticks[1].userData.grabbedBy = null
  xyloSticks[0].userData.animation = 0
  xyloSticks[1].userData.animation = 0
  xyloStickBalls[0] = hall.getObjectByName('xylostickball-left')
  xyloStickBalls[1] = hall.getObjectByName('xylostickball-right')
  xyloStickBalls[0].geometry.computeBoundingBox()
  xyloStickBalls[1].geometry.computeBoundingBox()
}

const enter = (ctx) => {
  ctx.camera.add(listener)

  const selectStart = onSelectStart.bind(this)
  const selectEnd = onSelectEnd.bind(this)

  ctx.controllers[0].addEventListener('selectstart', selectStart)
  ctx.controllers[1].addEventListener('selectstart', selectStart)
  ctx.controllers[0].addEventListener('selectend', selectEnd)
  ctx.controllers[1].addEventListener('selectend', selectEnd)
}

const exit = (ctx) => {
  ctx.camera.remove(listener)

  const selectStart = onSelectStart.bind(this)
  const selectEnd = onSelectEnd.bind(this)

  ctx.controllers[0].removeEventListener('selectstart', selectStart)
  ctx.controllers[1].removeEventListener('selectstart', selectStart)
  ctx.controllers[0].removeEventListener('selectend', selectEnd)
  ctx.controllers[1].removeEventListener('selectend', selectEnd)
}

const hitTest = (obj1, obj2) => {
  bbox.setFromObject(obj2)
  if (obj1.boundingBox.intersectsBox(bbox)) {
    return true
  }
  return false
}

const setStickColor = (stick, color) => {
  xyloStickBalls[stick].material.color.set(color)
}

const execute = (ctx, delta, time) => {
  const controllers = ctx.controllers

  if (!controllers) { return }

  for (let c = 0; c < 2; c++) {
    if (controllers[c].userData.grabbing === null) {
      let stick0 = hitTest(controllers[0], xyloSticks[0])
      let stick1 = hitTest(controllers[0], xyloSticks[1])

      if (stick0 || stick1) {
        ctx.raycontrol.disable()
      } else {
        ctx.raycontrol.enable()
      }

      if (!xyloSticks[0].userData.grabbedBy) {
        if (!stick0) stick0 = hitTest(controllers[1], xyloSticks[0])
        setStickColor(0, stick0 ? 0xffffff : 0xaaaaaa)
      }
      if (!xyloSticks[1].userData.grabbedBy) {
        if (!stick1) stick1 = hitTest(controllers[1], xyloSticks[1])
        setStickColor(1, stick1 ? 0xffffff : 0xaaaaaa)
      }
    } else {
      // controller grabbing stick
      const stick = controllers[c].userData.grabbing.children[0]
      bbox.setFromObject(stick).expandByScalar(-0.01)
      for (let i = 0; i < xyloNotes.length; i++) {
        const note = xyloNotes[i]
        if (note.userData.animation > 0) {
          note.userData.animation = Math.max(0, note.userData.animation - delta * 4)
          note.material.emissiveIntensity = note.userData.animation
          note.position.y = note.userData.resetY - note.userData.animation * 0.005
        }

        if (bbox.intersectsBox(note.geometry.boundingBox)) {
          if (!stickNotesColliding[c][i]) {
            stickNotesColliding[c][i] = true
            note.userData.sound.play()
            note.userData.animation = 1
            setStickColor(c, 0xffffff)
          }
        } else {
          if (stickNotesColliding[c][i]) {
            stickNotesColliding[c][i] = false
            setStickColor(c, 0xaaaaaa)
          }
        }
      }
    }
    if (xyloSticks[c].userData.animation > 0) {
      auxVec.copy(xyloSticks[c].userData.resetPosition).sub(xyloSticks[c].position)
      auxVec.multiplyScalar(0.1)
      xyloSticks[c].position.add(auxVec)
      if (auxVec.length < 0.01) { xyloSticks[c].userData.animation = 0 }
    }
  }
}

const onSelectStart = (evt) => {
  const controller = evt.target
  if (controller.userData.grabbing !== null) { return }

  // hand grabs stick
  for (let i = 0; i < 2; i++) {
    bbox.setFromObject(xyloSticks[i])
    if (controller.boundingBox.intersectsBox(bbox)) {
      setStickColor(i, 0xaaaaaa)

      _ctx.raycontrol.disable()

      // stick grabbed from the other hand
      if (xyloSticks[i].userData.grabbedBy) {
        xyloSticks[i].userData.grabbedBy.userData.grabbing = null
      }
      xyloSticks[i].position.set(0, 0, 0)
      xyloSticks[i].rotation.set(0, 0, 0)
      controller.add(xyloSticks[i])
      xyloSticks[i].userData.animation = 0
      controller.userData.grabbing = xyloSticks[i]
      xyloSticks[i].userData.grabbedBy = controller
      return false
    }
  }
  return true
}

const onSelectEnd = (evt) => {
  _ctx.raycontrol.enable()

  const controller = evt.target
  if (controller.userData.grabbing !== null) {
    const stick = controller.userData.grabbing
    stick.getWorldPosition(auxVec)
    hallRef.add(stick)
    stick.position.copy(auxVec)
    stick.rotation.copy(stick.userData.resetRotation)
    stick.userData.grabbedBy = null
    stick.userData.animation = 1
    controller.userData.grabbing = null
    return false
  }
  return true
}

export { setup, enter, exit, execute, onSelectStart, onSelectEnd }
