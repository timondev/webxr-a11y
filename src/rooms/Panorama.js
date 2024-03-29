import * as THREE from 'three'
import { Text, Position, ParentObject3D } from '../components.js'

let pano = null
let context
let panel
let panelText

const NUM_PANOS = 5

const DATA = [
  'Tiger and Turtle - Magic Mountain\nArt installation in Agerpark, Germany.',
  'Hiking trail at Lake Byllesby Regional Park near Cannon Falls, USA.',
  'Dellwiger Bach natural reserve in Dortmund, Germany.',
  'Zapporthorn summit in Lepontine Alps, Switzerland.',
  'Ruin of romanesque Paulinzella abbey (1106) in Thuringia, Germany.'
]

const panoMaterials = []

const setup = (ctx) => {
  const assets = ctx.assets
  const geometry = new THREE.SphereGeometry(500, 60, 40)
  for (let i = 0; i < NUM_PANOS; i++) {
    const panoName = 'pano' + (i + 2)
    panoMaterials[i] = new THREE.MeshBasicMaterial({
      map: assets[panoName],
      side: THREE.BackSide
    })
  }
  pano = new THREE.Mesh(geometry, panoMaterials[0])

  panel = assets.hall_model.scene.getObjectByName('infopanel')
  panel.material = new THREE.MeshBasicMaterial({ color: 0x040404 })
  panel.position.set(0, 0.1, 0)
  panel.parent.remove(panel)

  panelText = ctx.world.createEntity()
  panelText
    .addComponent(Text, {
      color: '#ffffff',
      fontSize: 0.02,
      anchor: 'left',
      textAlign: 'left',
      baseline: 'top',
      maxWidth: 0.34,
      lineHeight: 1.3,
      text: DATA[NUM_PANOS]
    })
    .addComponent(ParentObject3D, { value: panel })
    .addComponent(Position, { x: -0.17, y: 0.003, z: 0.01 })

  ctx.raycontrol.addState('panorama', {
    raycaster: false,
    onSelectEnd
  })
}

const enter = (ctx) => {
  ctx.renderer.setClearColor(0x000000)

  const room = ctx.room - 5
  panelText.getMutableComponent(Text).text = DATA[room]
  pano.material = panoMaterials[room]

  ctx.scene.add(pano)

  ctx.controllers[1].add(panel)

  ctx.raycontrol.activateState('panorama')

  context = ctx
}

const exit = (ctx) => {
  ctx.scene.remove(pano)
  ctx.controllers[1].remove(panel)

  ctx.raycontrol.deactivateState('panorama')
}

const execute = (ctx, delta, time) => {}

const onSelectEnd = (evt) => {
  context.goto = 0
}

export { setup, exit, enter, execute, onSelectEnd }
