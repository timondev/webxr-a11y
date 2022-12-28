import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";

import { VRButton } from "./lib/VRButton.js";
import { slideshow } from "./lib/slideshow.js";
import { loadAsset, loadAssets } from "./lib/assetManager.js";

import { cameraDistanceTo, mobileAndTabletCheck } from "./lib/utils.js";
// import { angleToClock, readSurroundings, requestText, speak } from './lib/a11y.js'
import { convertAngleToClock, getElementDefinition, getElementName, getElementPath, getNextKeyInObject, isElementChild, speak, translate, updateElementList } from "./lib/accessibility.js";

// ECSY
import { World } from "ecsy";
import { SDFTextSystem } from "./systems/SDFTextSystem.js";
import { DebugHelperSystem } from "./systems/DebugHelperSystem.js";
import { AreaCheckerSystem } from "./systems/AreaCheckerSystem.js";
import { ControllersSystem } from "./systems/ControllersSystem.js";
import { HierarchySystem } from "./systems/HierarchySystem.js";
import { TransformSystem } from "./systems/TransformSystem.js";
import { BillboardSystem } from "./systems/BillboardSystem.js";

import { SystemsGroup } from "./systems/SystemsGroup.js";

import assets from "./assets.js";

import i18next from "i18next";

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
  Opacity,
} from "./components.js";

import { RayControl } from "./lib/RayControl.js";
import { Teleport } from "./lib/Teleport.js";

import * as roomHall from "./rooms/Hall.js";
import * as roomPanorama from "./rooms/Panorama.js";
import * as roomPanoramaStereo from "./rooms/PanoramaStereo.js";
import * as roomPhotogrammetryObject from "./rooms/PhotogrammetryObject.js";
import * as roomVertigo from "./rooms/Vertigo.js";
import * as roomSound from "./rooms/Sound.js";

import { shaders } from "./lib/shaders.js";

import WebXRPolyfill from "webxr-polyfill";
import { detectWebXR } from "./lib/utils.js";
import { Constants, fetchProfile } from "@webxr-input-profiles/motion-controllers";
const polyfill = new WebXRPolyfill();

let clock = new THREE.Clock();

let scene,
  parent,
  renderer,
  camera,
  spectator,
  controls,
  context = {};
let raycontrol,
  teleport,
  controllers = [];

let listener, ambientMusic;

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
  roomPanorama,
];

const roomNames = [
  "hall",
  "sound",
  "photogrammetry",
  "vertigo",
  "panoramastereo",
  "panorama1",
  "panorama2",
  "panorama3",
  "panorama4",
  "panorama5",
];

const musicThemes = [
  false,
  false,
  "chopin_snd",
  "wind_snd",
  false,
  "birds_snd",
  "birds_snd",
  "forest_snd",
  "wind_snd",
  "birds_snd",
];

const urlObject = new URL(window.location);
const roomName = urlObject.searchParams.get("room");
context.room =
  roomNames.indexOf(roomName) !== -1 ? roomNames.indexOf(roomName) : 0;
const debug = urlObject.searchParams.has("debug");
const handedness = urlObject.searchParams.has("handedness")
  ? urlObject.searchParams.get("handedness")
  : "right";

const defaultLanguage = urlObject.searchParams.has("language")
  ? urlObject.searchParams.get("language")
  : "de";

// Target positions when moving from one room to another
const targetPositions = {
  hall: {
    sound: new THREE.Vector3(0, 0, 0),
    photogrammetry: new THREE.Vector3(1, 0, 0),
    vertigo: new THREE.Vector3(0, 0, 0),
  },
  photogrammetry: {
    hall: new THREE.Vector3(-3.6, 0, 2.8),
  },
  sound: {
    hall: new THREE.Vector3(4.4, 0, 4.8),
  },
  vertigo: {
    hall: new THREE.Vector3(-1.8, 0, -5),
  },
};

const centerVec = new THREE.Vector3(0, 0, 0);
const upVec = new THREE.Vector3(0, 1, 0);

import en from './locales/en';
import de from './locales/de_new';
import { Vector3 } from "three";

i18next.init({
  lng: defaultLanguage,
  resources: {
    en: {
      translation: en,
    },
    de: {
      translation: de,
    },
  }
})

const gotoRoom = (room) =>  {
  rooms[context.room].exit(context);
  raycontrol.deactivateAll();

  const prevRoom = roomNames[context.room];
  const nextRoom = roomNames[room];

  if (targetPositions[prevRoom] && targetPositions[prevRoom][nextRoom]) {
    let deltaPosition = new THREE.Vector3();
    const targetPosition = targetPositions[prevRoom][nextRoom];
    const camera = renderer.xr.getCamera(context.camera);

    deltaPosition.x = camera.position.x - targetPosition.x;
    deltaPosition.z = camera.position.z - targetPosition.z;

    context.cameraRig.position.sub(deltaPosition);
  }

  context.room = room;

  playMusic(room);

  rooms[context.room].enter(context);
}

const playMusic = (room) =>  {
  if (ambientMusic.source) ambientMusic.stop();

  const music = musicThemes[room];
  if (!music) {
    return;
  }
  ambientMusic.setBuffer(assets[music]);
  ambientMusic.setLoop(true);
  ambientMusic.setVolume(1.0);
  ambientMusic.offset = Math.random() * 60;
  ambientMusic.play();
}

const ecsyWorld = new World();
const systemsGroup = {};

const init = () =>  {
  document.getElementById(handedness + "hand").classList.add("activehand");

  detectWebXR();

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
    .registerComponent(Opacity);

  ecsyWorld
    .registerSystem(SDFTextSystem)
    .registerSystem(AreaCheckerSystem)
    .registerSystem(ControllersSystem)
    .registerSystem(DebugHelperSystem)
    .registerSystem(TransformSystem)
    .registerSystem(BillboardSystem)
    .registerSystem(HierarchySystem);

  systemsGroup["roomHall"] = new SystemsGroup(ecsyWorld, [
    AreaCheckerSystem,
    ControllersSystem,
    DebugHelperSystem,
  ]);

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    logarithmicDepthBuffer: false,
  });
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    80,
    window.innerWidth / window.innerHeight,
    0.005,
    10000
  );
  camera.position.set(0, 1.6, 0);
  listener = new THREE.AudioListener();
  camera.add(listener);

  spectator = new THREE.PerspectiveCamera(
    80,
    window.innerWidth / window.innerHeight,
    0.005,
    10000
  );
  spectator.position.set(0, 1.6, 0);

  ambientMusic = new THREE.Audio(listener);

  controls = new PointerLockControls(camera, renderer.domElement);
  scene.add(controls.getObject());

  parent = new THREE.Object3D();
  scene.add(parent);

  window.addEventListener("resize", onWindowResize, false);

  for (let i = 0; i < 2; i++) {
    controllers[i] = renderer.xr.getController(i);
    controllers[i].raycaster = new THREE.Raycaster();
    controllers[i].raycaster.near = 0.1;
    controllers[i].addEventListener("selectstart", onSelectStart);
    controllers[i].addEventListener("selectend", onSelectEnd);
  }

  // global lights
  const lightSun = new THREE.DirectionalLight(0xeeffff);
  lightSun.name = "sun";
  lightSun.position.set(0.2, 1, 0.1);
  const lightFill = new THREE.DirectionalLight(0xfff0ee, 0.3);
  lightFill.name = "fillLight";
  lightFill.position.set(-0.2, -1, -0.1);

  scene.add(lightSun, lightFill);

  const cameraRig = new THREE.Group();
  cameraRig.add(camera);
  cameraRig.add(controllers[0]);
  cameraRig.add(controllers[1]);
  cameraRig.position.set(0, 0, 2);
  scene.add(cameraRig);

  context.vrMode = false; // in vr
  context.assets = assets;
  context.shaders = shaders;
  context.scene = parent;
  context.renderer = renderer;
  context.camera = camera;
  context.spectator = spectator;
  context.audioListener = listener;
  context.goto = null;
  context.cameraRig = cameraRig;
  context.controllers = controllers;
  context.world = ecsyWorld;
  context.systemsGroup = systemsGroup;
  context.handedness = handedness;
  context.language = defaultLanguage;

  context.elements = [];
  context.currentElement = '';

  context.debugMode = !mobileAndTabletCheck();
  context.deltaTime = 0.0;

  window.context = context;

  const loadTotal = Object.keys(assets).length;

  loadAssets(
    renderer,
    "assets/",
    assets,
    () => {
      speak('intro');

      raycontrol = new RayControl(context, handedness);
      context.raycontrol = raycontrol;
      setupRayControl();

      teleport = new Teleport(context);
      context.teleport = teleport;

      setupControllers(renderer);
      roomHall.setup(context);
      roomPanorama.setup(context);
      roomPanoramaStereo.setup(context);
      roomPhotogrammetryObject.setup(context);
      roomVertigo.setup(context);
      roomSound.setup(context);

      rooms[context.room].enter(context);

      slideshow.setup(context);

      document.body.appendChild(renderer.domElement);
      document.body.appendChild(
        VRButton.createButton(renderer, (status) => {
          context.vrMode = status === "sessionStarted";
          if (context.vrMode) {
            gotoRoom(0);
            context.cameraRig.position.set(0, 0, 2);
            context.goto = null;

            window.setTimeout(() => {
              speak('enter_vr');
              window.setTimeout(() => { speak('enter_vr_2') }, 1000);
              window.setTimeout(() => { speak('enter_vr_3') }, 3000);
              window.setTimeout(() => { speak('enter_vr_4') }, 5000);
            }, 1000);
          } else {
            slideshow.setup(context);

            speak('exit_vr');
          }
        }, () => {
          rooms[context.room].exit(context);
        })
      );
      renderer.setAnimationLoop(animate);

      document.getElementById("loading").style.display = "none";
    },

    (loadProgress) => {
      document
        .querySelector("#progressbar")
        .setAttribute(
          "stroke-dashoffset",
          -(282 - Math.floor((loadProgress / loadTotal) * 282))
        );
    },
    debug
  );
}

const setupControllers = async (renderer) =>  {
  for (let i = 0; i < 2; i++) {
    let controller = controllers[i];
    controller.boundingBox = new THREE.Box3();
    controller.userData.grabbing = null;
    controller.addEventListener("connected", async (event) => {
      const { profile, assetPath } = await fetchProfile(event.data, '/profiles')
      const asset = await loadAsset(renderer, { url: assetPath })
      raycontrol.addController(controller, event.data, { profile, assetPath, asset });
      speak('controller_connected');
    });
    controller.addEventListener("disconnect", async () => {
      controller.remove(controller.children[0]);
      raycontrol.removeController(controller, event.data);
      speak('controller_disconnected');
    });
  }
}

const setupRayControl = () => {
  raycontrol.addControllerEventListener(
    'selectNext',
    [
      { id: 'right-a', isStateModifier: true, state: Constants.ComponentState.PRESSED },
      { id: 'right-squeeze', isStateModifier: true, state: Constants.ComponentState.DEFAULT },
    ],
    0.5,
    false,
    (ctx, states) => {
      if(ctx.elements.length == 0) {
        return speak('no_objects_available');
      }

      if(ctx.currentElement != '') {
        let elementName = getElementName(ctx.currentElement);

        if(isElementChild(ctx.currentElement)) {
          let parent = getElementDefinition(getElementPath(ctx.currentElement));
          ctx.currentElement = getElementPath(ctx.currentElement) + '.' + getNextKeyInObject(parent.children, elementName);
          speak(getElementDefinition(ctx.currentElement).name);
          return;
        }

        console.log(ctx.currentElement, ctx.elements.indexOf(elementName), ctx.elements);
        let index = ctx.elements.indexOf(elementName);
        ctx.currentElement = ctx.elements[(index != -1 && index < ctx.elements.length - 1) ? index + 1 : 0];
        speak(getElementDefinition(ctx.currentElement).name);
        return;
      }

      ctx.currentElement = ctx.elements[0];
      speak(getElementDefinition(ctx.currentElement).name);
    }
  )
  raycontrol.addControllerEventListener(
    'getDescription',
    [
      { id: 'right-b', isStateModifier: true, state: Constants.ComponentState.PRESSED },
      { id: 'right-squeeze', isStateModifier: true, state: Constants.ComponentState.DEFAULT },
    ],
    1.0,
    false,
    (ctx, states) => {
      if(ctx.elements.length == 0) {
        return speak('no_objects_available');
      }

      if(ctx.currentElement != '') {
        let definition = getElementDefinition(ctx.currentElement);
        return speak(definition.description);
      }

      return speak('no_element_selected');
    }
  )
  raycontrol.addControllerEventListener(
    'changeLevel',
    [
      { id: 'right-a', isStateModifier: true, state: Constants.ComponentState.PRESSED },
      { id: 'right-squeeze', isStateModifier: true, state: Constants.ComponentState.PRESSED },
    ],
    1.0,
    false,
    (ctx, states) => {
      if(ctx.elements.length == 0) {
        ctx.currentElement = '';
        return speak('lost_focus');
      }

      if(isElementChild(ctx.currentElement)) {
        ctx.currentElement = getElementPath(ctx.currentElement);
        speak(getElementDefinition(ctx.currentElement).name);
        return;
      }

      let parent = getElementDefinition(ctx.currentElement);

      if(parent.children != null) {
        ctx.currentElement += '.' + getNextKeyInObject(parent.children, '');
        speak(getElementDefinition(ctx.currentElement).name);
        return;
      }

      speak('no_children');
    }
  )
  raycontrol.addControllerEventListener(
    'debug',
    [
      { id: 'left-squeeze', isStateModifier: true, state: Constants.ComponentState.DEFAULT },
      { id: 'left-thumbstick', isStateModifier: true, state: Constants.ComponentState.PRESSED }
    ],
    0.2,
    false,
    (ctx, states) => {
      // console.log('camera-positon', ctx.renderer.xr.getCamera(ctx.camera).position);
      // console.log('camera-rotation', ctx.camera.rotation);
      ctx.scene.traverseVisible((element) => {
        if(element.name != '') console.log(element.name);
      });
    }
  )
  raycontrol.addControllerEventListener(
    'teleport',
    [
      { id: 'right-squeeze', isStateModifier: true, state: Constants.ComponentState.PRESSED },
      { id: 'right-thumbstick', isStateModifier: true, state: Constants.ComponentState.PRESSED }
    ],
    0.2,
    false,
    (ctx, states) => {
      if(ctx.currentElement != null) {
        let definition = getElementDefinition(ctx.currentElement);
        if(definition != null && definition.teleportation != null) {
          const { position, rotation } = definition.teleportation;
          const camera = ctx.renderer.xr.getCamera(ctx.camera);
    
          ctx.cameraRig.position.sub(new THREE.Vector3(camera.position.x - position.x, 0.0, camera.position.z - position.z));

          // camera.lookAt(rotation);
          speak('teleport', { object: translate(definition.name) });
        } else {
          speak('no_teleport');
        }
      }
    }
  )
  raycontrol.addControllerEventListener(
    'interactLeft',
    [
      { id: 'left-squeeze', isStateModifier: true, state: Constants.ComponentState.PRESSED },
      { id: 'left-y', isStateModifier: true, state: Constants.ComponentState.PRESSED },
    ],
    0.5,
    false,
    (ctx, states, controllerIndex) => {
      if(ctx.elements.length == 0) {
        return speak('no_objects_available');
      }
      
      if(ctx.currentElement != '') {
        let definition = getElementDefinition(ctx.currentElement);
        if(definition != null && definition.interaction != null && definition.interaction.event != null) {
          let controller = ctx.renderer.xr.getController(controllerIndex);
          return definition.interaction.event(ctx, controller, 'left');
        } else {
          return speak('no_interaction_available');
        }
      }

      return speak('no_element_selected');
    }
  )
  raycontrol.addControllerEventListener(
    'interactRight',
    [
      { id: 'right-squeeze', isStateModifier: true, state: Constants.ComponentState.PRESSED },
      { id: 'right-b', isStateModifier: true, state: Constants.ComponentState.PRESSED },
    ],
    0.5,
    false,
    (ctx, states, controllerIndex) => {
      if(ctx.elements.length == 0) {
        return speak('no_objects_available');
      }
      
      if(ctx.currentElement != '') {
        let definition = getElementDefinition(ctx.currentElement);
        if(definition != null && definition.interaction != null && definition.interaction.event != null) {
          let controller = ctx.renderer.xr.getController(controllerIndex);
          return definition.interaction.event(ctx, controller, 'right');
        } else {
          return speak('no_interaction_available');
        }
      }

      return speak('no_element_selected');
    }
  )
  raycontrol.addControllerEventListener(
    'navigation',
    [
      { id: 'right-squeeze', isStateModifier: true, state: Constants.ComponentState.DEFAULT },
      { id: 'right-thumbstick', isStateModifier: true, state: Constants.ComponentState.PRESSED }
    ],
    0.2,
    false,
    (ctx, states) => {
      if(ctx.elements.length == 0) {
        return speak('no_objects_available');
      }

      if(ctx.currentElement == '') return speak('no_element_selected');
      let elementName = getElementName(ctx.currentElement);
      let object = ctx.scene.getObjectByName(elementName);

      if(object == null) {
        let definition = getElementDefinition(ctx.currentElement);

        if(definition == null || definition.position == null) return speak('no_element_selected');

        object = definition;
      }

      let position = object.position;
      const cameraPosition = ctx.camera.position;

      let vector = new THREE.Vector3();
      ctx.camera.getWorldDirection(vector);

      // camera -> object
      const u = new THREE.Vector2(position.x - cameraPosition.x, -1 * (position.z - cameraPosition.z)); 
      u.normalize();

      // camera -> view
      const v = new THREE.Vector3(1, 1, -1); 
      v.multiply(vector);

      let angle = Math.atan2(u.x * v.z - u.y * v.x, u.x * v.x + u.y * v.z) * 180 / Math.PI;
      if(angle < 0) angle += 360.0;

      let objectDistancePositon = new THREE.Vector3();
      (object.room == null) ? object.getWorldPosition(objectDistancePositon) : objectDistancePositon.copy(position);

      const distance = cameraDistanceTo(ctx, objectDistancePositon);

      speak('navigation_text', { x: translate('clock', { clock: convertAngleToClock(angle) }), y: distance.toFixed(1) });
    }
  )
}

// @FIXME Hack for Oculus Browser issue
const selectStartSkip = {};
const selectEndSkip = {};
const OculusBrowser =
  navigator.userAgent.indexOf("OculusBrowser") !== -1 &&
  parseInt(navigator.userAgent.match(/OculusBrowser\/([0-9]+)./)[1]) < 8;

// <@FIXME

const onSelectStart = (ev) =>  {
  // @FIXME Hack for Oculus Browser issue
  if (OculusBrowser) {
    const controller = ev.target;
    if (!selectStartSkip[controller]) {
      selectStartSkip[controller] = true;
      return;
    }
    selectStartSkip[controller] = false;
  }
  // <@FIXME

//  const trigger = ev.target.getObjectByName("trigger");
//  trigger.rotation.x = -0.3;
  raycontrol.onSelectStart(ev);
}

const onSelectEnd = (ev) =>  {
  // @FIXME Hack for Oculus Browser issue
  if (OculusBrowser) {
    const controller = ev.target;
    if (!selectEndSkip[controller]) {
      selectEndSkip[controller] = true;
      return;
    }
    selectEndSkip[controller] = false;
  }
  // <@FIXME

//  const trigger = ev.target.getObjectByName("trigger");
//  trigger.rotation.x = 0;
  raycontrol.onSelectEnd(ev);
}

const onWindowResize = () =>  {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);

  if (context.debugMode) {
    spectator.aspect = window.innerWidth / window.innerHeight;
    spectator.updateProjectionMatrix();
  }
}

const animate = () =>  {
  const delta = clock.getDelta();
  const elapsedTime = clock.elapsedTime;

  ecsyWorld.execute(delta, elapsedTime);

  // update controller bounding boxes
  for (let i = 0; i < controllers.length; i++) {
    const model = controllers[i].getObjectByName("Scene");
    if (model) {
      controllers[i].boundingBox.setFromObject(model);
    }
  }

  // render current room
  context.raycontrol.execute(context, delta, elapsedTime);
  rooms[context.room].execute(context, delta, elapsedTime);
  if (!context.vrMode) {
    slideshow.execute(context, delta, elapsedTime);
  }

  renderer.render(scene, camera);
  if (context.goto !== null) {
    gotoRoom(context.goto);
    context.goto = null;
  }

  updateElementList(context);
  if (context.debugMode && renderer.xr.isPresenting) {
    const xrCamera = renderer.xr.getCamera(camera)

    spectator.projectionMatrix.copy(camera.projectionMatrix);
    spectator.position.copy(xrCamera.position);
    spectator.quaternion.copy(xrCamera.quaternion);

    const currentRenderTarget = renderer.getRenderTarget();

    renderer.xr.isPresenting = false;
    // render to the canvas on our main display
    renderer.setRenderTarget(null);
    renderer.render(scene, spectator);

    // reset back to enable WebXR
    renderer.setRenderTarget(currentRenderTarget);
    renderer.xr.isPresenting = true;
  }
}

window.onload = () => {
  init();
};

export { init };