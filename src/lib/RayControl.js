import { Constants, MotionController } from '@webxr-input-profiles/motion-controllers'
import * as THREE from 'three'
import { Matrix4 } from 'three'
import { Frustum } from 'three'
import { objects } from '../objects.js'
import { readRoom } from './a11y.js'
import { EventDispatcher } from './EventDispatcher.js'
import { getObjectDescription, requestTextToBeSpoken, sanitizedID } from './utils.js'

const tempMatrix = new THREE.Matrix4()
let rayMaterial
const validStateController = [
  'primary',
  'secondary',
  'both',
  'left',
  'right'
]

class RayControl extends EventDispatcher {
  enable () {
    this.setLineStyle(this.previousLineStyle)
    this.enabled = true
  }

  _sort () {
    this.currentStates = this.currentStates.sort((a, b) => {
      const pa = a.order || 0
      const pb = b.order || 0
      return pa - pb
    })
  }

  disable () {
    this.lineBasic.visible = this.line0.visible = false
    this.enabled = false
    this.controllers.forEach(controller => { controller.active = false })
  }

  changeHandedness (primary) {
    if (primary !== this.primary) {
      this.primary = primary
      this.secondary = primary === 'right' ? 'left' : 'right'

      this.dispatchEvent('handednessChanged', { primary: this.primary, secondary: this.secondary })
    }
  }

  hasAttachment (name) {
    this.attachements[name] !== null;
  }

  addAttachement (name, controller, scene) {
    this.attachements[name] = true;
    controller.add(scene);
  }

  removeAttachement (name, controllerData, scene) {
    delete this.attachements[name];
    controllerData.controller.remove(scene);
  }

  addControllerEventListener(name, modifiers, cooldown, instantReset, eventListener) {
    this.controllerEvents[name] = { modifiers, callback: eventListener, cooldown, activeCooldown: 0, instantReset };
  }

  addState (name, state, activate) {
    if (this.states[name]) {
      console.error(`RayControl state '${name}' already exist, please use a different name.`)
      return
    }

    state.name = name

    if (typeof state.raycaster === 'undefined') {
      state.raycaster = true
    }

    if (typeof state.controller === 'undefined') {
      state.controller = 'primary'
    } else if (!validStateController.includes(state.controller)) {
      console.warn('Invalid controller selector:', state.controller)
      state.controller = 'primary'
    }

    this.states[name] = state

    if (activate === true) {
      this.currentStates.push(state)
    }

    return state
  }

  activateState (name) {
    if (this.states[name]) {
      this.currentStates.push(this.states[name])
      this._sort()
    }
  }

  deactivateAll (name) {
    this.currentStates = []
    this.controllers.forEach(c => {
      this.currentStates.forEach(s => {
        if (c.intersections[s.name]) {
          c.intersections[s.name] = null
        }
      })
    })
  }

  deactivateState (name) {
    this.currentStates.splice(this.currentStates.indexOf(name), 1)
    this.controllers.forEach(c => {
      if (c.intersections[name]) {
        c.intersections[name] = null
      }
    })

    this._sort()
  }

  addController (controller, inputSource, { profile, assetPath, asset }) {
    const controllerData = {
      controller,
      inputSource,
      active: false,
      stateHit: {},
      intersections: {},
      currentIntersection: null,
      previousControllerStates: {},
      motionController: new MotionController(inputSource, profile, assetPath),
      hit: false
    }

    this.addTouchPointDots(controllerData.motionController, asset);

    // FIX HP Controller
    if(profile.profileId === 'hp-mixed-reality') {
      asset.scene.rotation.x += Math.PI / 8.0;
    }

    controller.add(asset.scene);

    this.controllers.push(controllerData)

    if (this.matchController(controllerData, 'primary')) {
      controller.add(this.raycasterContext)
    }

    if (this.matchController(controllerData, 'secondary')) {
      controller.add(this.secondaryRayCasterContext);
    }

    this.dispatchEvent('controllerConnected', controllerData)
  }

  removeController (controller) {
    const index = this.controllers.findIndex(controllerData => controllerData.controller === controller)
    const controllerData = this.controllers.find(controllerData => controllerData.controller === controller)
    this.controllers.splice(index, 1)
    this.dispatchEvent('controllerDisconnected', controllerData)
  }

  addTouchPointDots(motionController, asset) {
    Object.values(motionController.components).forEach((component) => {
      if (component.touchPointNodeName) {
        const touchPointRoot = asset.getObjectByName(component.touchPointNodeName);

        const sphereGeometry = new THREE.SphereGeometry(0.001);
        const material = new THREE.MeshBasicMaterial({ color: 0x0000FF });
        const touchPointDot = new THREE.Mesh(sphereGeometry, material);
        touchPointRoot.add(touchPointDot);
      }
    });
  }

  updateMotionControllerModel(motionController, controllerRoot) {
    Object.values(motionController.components).forEach((component) => {
      Object.values(component.visualResponses).forEach((visualResponse) => {
        // Find the topmost node in the visualization
        const valueNode = controllerRoot.getObjectByName(visualResponse.valueNodeName);
  
        // Calculate the new properties based on the weight supplied
        if (visualResponse.valueNodeProperty === 'visibility') {
          valueNode.visible = visualResponse.value;
        } else if (visualResponse.valueNodeProperty === 'transform') {
          const minNode = controllerRoot.getObjectByName(visualResponse.minNodeName);
          const maxNode = controllerRoot.getObjectByName(visualResponse.maxNodeName);

          if(visualResponse.value < 0 || visualResponse.value > 1) {
            return;
          }

          valueNode.quaternion.slerpQuaternions(
            minNode.quaternion,
            maxNode.quaternion,
            visualResponse.value
          );
  
          valueNode.position.lerpVectors(
            minNode.position,
            maxNode.position,
            visualResponse.value
          );
        }
      });
    })

  }

  constructor (ctx, primary) {
    super()
    this.ctx = ctx

    if (typeof primary === 'undefined') {
      this.primary = 'right'
      this.secondary = 'left'
    } else {
      this.primary = primary
      this.secondary = primary === 'right' ? 'left' : 'right'
    }

    this.controllers = []

    this.previousLineStyle = 'pretty'
    this.enabled = true
    this.raycaster = new THREE.Raycaster()
    this.states = {}
    this.currentStates = []
    this.attachements = {}
    this.controllerEvents = {}

    const line = ctx.assets.teleport_model.scene.getObjectByName('beam')

    ctx.assets.beam_tex.wrapT = THREE.RepeatWrapping
    ctx.assets.beam_tex.wrapS = THREE.RepeatWrapping
    rayMaterial = line.material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        active: { value: 0 },
        tex: { value: ctx.assets.beam_tex }
      },
      vertexShader: ctx.shaders.basic_vert,
      fragmentShader: ctx.shaders.beam_frag,
      blending: THREE.AdditiveBlending,
      transparent: true
    })

    line.renderOrder = 10

    line.name = 'line'
    this.rayLength = 5
    line.scale.z = this.rayLength

    this.line0 = line.clone();
    this.line0.visible = true;

    this.secondaryLine0 = line.clone();
    this.secondaryLine0.visible = false;

    this.raycasterContext = new THREE.Group()
    this.raycasterContext.add(this.line0)
    this.raycasterContext.name = 'raycasterContext'

    this.secondaryRayCasterContext = new THREE.Group()
    this.secondaryRayCasterContext.add(this.secondaryLine0)
    this.secondaryRayCasterContext.name = 'raycasterContext'

    const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -1)]);

    this.lineBasic = new THREE.Line(geometry);
    this.lineBasic.name = 'line';
    this.lineBasic.scale.z = 5;
    this.lineBasic.visible = false;
    this.raycasterContext.add(this.lineBasic);
    this.secondaryRayCasterContext.add(this.lineBasic.clone());
  }

  setLineStyle (lineStyle) {
    const basic = lineStyle === 'basic'
    this.lineBasic.visible = basic
    this.line0.visible = !basic
    this.previousLineStyle = lineStyle
  }

  /*
  selector could be: left, right, both, primary, secondary
  */
  matchController (controllerData, selector) {
    const handedness = controllerData.inputSource.handedness

    return (
      (selector === handedness) ||
      (selector === 'both' && (handedness === 'right' || handedness === 'left')) ||
      (selector === 'primary' && this.primary === handedness) ||
      (selector === 'secondary' && this.secondary === handedness)
    )
  }

  onSelectStart (evt) {
    if (!this.enabled) { return }

    const controller = evt.target
    const controllerData = this.controllers.find(c => c.controller === controller)
    if (controllerData) {
      controllerData.active = true
      if (controllerData.currentIntersection) {
        const state = controllerData.currentIntersection.state
        if (state.onSelectStart) {
          state.onSelectStart(controllerData.currentIntersection.intersection, controllerData.controller)
        }
      }

      // Check no raycaster states
      this.currentStates.forEach(state => {
        if (state.onSelectStart && !state.raycaster) {
          state.onSelectStart(controllerData.intersections[state.name], controller)
        }
      })
    }
  }

  execute (ctx, delta, time) {
    if (!this.enabled || this.currentStates.length === 0) { return }

    rayMaterial.uniforms.time.value = time

    for (let c = 0; c < this.controllers.length; c++) {
      const controllerData = this.controllers[c]

      // update motion controller
      const motionController = controllerData.motionController
      motionController.updateFromGamepad()

      // update visual controller
      this.updateMotionControllerModel(motionController, controllerData.controller)

      for (let i = 0; i < this.currentStates.length; i++) {
        const state = this.currentStates[i]
        if (!state.raycaster) {
          continue
        }

        // Check if this controller should be active on this state
        if (!this.matchController(controllerData, state.controller)) {
          continue
        }

        const controller = controllerData.controller
        const intersections = this.getIntersections(controller, state.colliderMesh)

        if (intersections.length > 0) {
          // Use just the closest object
          controllerData.intersections[state.name] = intersections[0]
          controllerData.stateHit[state.name] = true
        } else {
          controllerData.intersections[state.name] = null
        }
      }
    }

    this.line0.scale.z = Math.min(this.rayLength, 1)
    this.lineBasic.scale.z = Math.min(this.rayLength, 1)

    // For each controller, find the closest intersection from all the states
    for (let c = 0; c < this.controllers.length; c++) {
      const controllerData = this.controllers[c]
      const intersections = Object.entries(controllerData.intersections).filter(i => i[1] !== null)

      const motionController = controllerData.motionController;
      let states = {};
      for(let d = 0; d < motionController.data.length; d++) {
        const id = sanitizedID(motionController.data[d].id, motionController.xrInputSource.handedness);
        states[id] = motionController.data[d];
      }

      const keys = Object.keys(this.controllerEvents);
      for(let ck = 0; ck < keys.length; ck++) {
        const { modifiers, callback, cooldown, activeCooldown, instantReset } = this.controllerEvents[keys[ck]];
        let toBeExecuted = true;
        for(let m = 0; m < modifiers.length; m++) {
          if(states[modifiers[m].id] == null || (modifiers[m].isStateModifier == true && (states[modifiers[m].id].state == null || states[modifiers[m].id].state != modifiers[m].state)) || (modifiers[m].isXAxisModifier && (states[modifiers[m].id].xAxis == null || Math.abs(states[modifiers[m].id].xAxis) < modifiers[m].xAxis)) ||
          (modifiers[m].isYAxisModifier && (states[modifiers[m].id].yAxis == null || Math.abs(states[modifiers[m].id].yAxis) < modifiers[m].yAxis))) {
            toBeExecuted = false;
            break;
          }
        }

        if(toBeExecuted) {
          if(activeCooldown < (time - cooldown)) {
            callback(ctx, states, c);
            this.controllerEvents[keys[ck]].activeCooldown = time;
          }
        } else if(instantReset) {
          this.controllerEvents[keys[ck]].activeCooldown = 0;
        }
      }

      if (intersections.length > 0) {
        intersections.sort((a, b) => {
          return a[1].distance - b[1].distance
        })

        const intersectionData = intersections[0]
        const intersection = intersectionData[1]
        const state = this.states[intersectionData[0]]

        controllerData.prevIntersection = controllerData.currentIntersection
        controllerData.currentIntersection = {
          state, intersection
        }

        if (state.lineStyleOnIntersection) {
          this.setLineStyle(state.lineStyleOnIntersection)
        } else {
          this.setLineStyle('advanced')
        }

        state.onHover && state.onHover(intersection, controllerData.active, controllerData.controller)
        this.line0.scale.z = Math.min(intersection.distance, 1)
        this.lineBasic.scale.z = Math.min(intersection.distance, 1)
      } else {
        controllerData.currentIntersection = null
      }
    }

    // Handle onHoverLeave
    for (let c = 0; c < this.controllers.length; c++) {
      const controllerData = this.controllers[c]
      if (!controllerData.prevIntersection) {
        continue
      }

      // If we can't find the previous intersection currently enabled, we should emit hoverLeave
      if (!this.controllers.find(c => {
        const prev = controllerData.prevIntersection
        const current = c.currentIntersection
        return current && prev.state.name === current.state.name &&
          prev.intersection.object === current.intersection.object
      }
      )) {
        controllerData.prevIntersection.state.onHoverLeave(
          controllerData.prevIntersection.intersection,
          false,
          controllerData.controller
        )

        controllerData.prevIntersection = null
      }
    }
  }

  getIntersections (controller, colliderMesh) {
    const raycasterContext = controller.getObjectByName('raycasterContext')
    if (!raycasterContext) {
      console.warn('No raycasterContext found for this controller', controller)
      return []
    }

    tempMatrix.identity().extractRotation(raycasterContext.matrixWorld)

    this.raycaster.ray.origin.setFromMatrixPosition(raycasterContext.matrixWorld)
    this.raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix)

    if (Array.isArray(colliderMesh)) {
      return this.raycaster.intersectObjects(colliderMesh, true)
    } else {
      return this.raycaster.intersectObject(colliderMesh, true)
    }
  }

  onSelectEnd (evt) {
    if (!this.enabled) { return }

    const controllerData = this.controllers.find(c => c.controller === evt.target)
    if (!controllerData || !controllerData.active) { return }

    if (controllerData) {
      if (controllerData.currentIntersection) {
        const state = controllerData.currentIntersection.state
        if (state.onSelectEnd) {
          state.onSelectEnd(controllerData.currentIntersection.intersection, controllerData.controller)
        }
      }

      // Check no raycaster states
      this.currentStates.forEach(state => {
        if (state.onSelectEnd && !state.raycaster) {
          state.onSelectEnd(null, controllerData.controller)
        }
      })
    }

    controllerData.active = false
  }
}

export { rayMaterial, RayControl }
