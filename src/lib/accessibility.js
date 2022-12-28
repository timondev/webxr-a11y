import i18next from 'i18next';
import * as THREE from 'three';
import { objectDictionary } from '../objects';
import { cameraDistanceTo } from './utils';

let ARIA_OUTPUT = document.getElementById('aria-output');

const frustum = new THREE.Frustum();
const aabb = new THREE.Box3()
const sphere = new THREE.Sphere();
const cameraObjectPosition = new THREE.Vector3();
const position = new THREE.Vector3();

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

const updateElementList = (ctx) => {
  const xrCamera = ctx.renderer.xr.getCamera(ctx.camera);

  // reset element list
  ctx.elements = [];
  let distances = {};

  // clear screen in debugMode
  if(ctx.debugMode) {
    document.querySelector('#a11y-points').innerHTML = '';
  }

  // update camera, frustum and world matrix
  xrCamera.updateProjectionMatrix();
  frustum.setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices( ctx.camera.projectionMatrix, ctx.camera.matrixWorldInverse ));
  ctx.scene.updateWorldMatrix(true, true);

  // traverse visible scene
  ctx.scene.traverseVisible((element) => {
    if(element.name == '' || objectDictionary[element.name] == null || element instanceof Text) return;

    // ignore meshes outside of frustum
    if(element.isMesh && !frustum.intersectsObject(element)) {
      return;
    }

    // ignore elements outside of frustum
    if(element.isObject3D && element.isMesh !== true) {
      aabb.setFromObject(element, true);
      aabb.getBoundingSphere(sphere);
      sphere.applyMatrix4(element.matrixWorld);
  
      if(!frustum.intersectsSphere(sphere)) return;
    }
    
    element.getWorldPosition(cameraObjectPosition);
    let distance = cameraDistanceTo(ctx, cameraObjectPosition);

    // insert element into list
    ctx.elements.push(element.name);
    distances[element.name] = distance;

    // update on screen position of element
    if (ctx.debugMode) {
      cameraObjectPosition.project(ctx.camera);

      const onCameraPosition = new THREE.Vector2(
        cameraObjectPosition.x * (window.innerWidth / 2) + (window.innerWidth / 2),
        -cameraObjectPosition.y * (window.innerHeight / 2) + (window.innerHeight / 2)
      );

      const debugElement = document.createElement('div');
      debugElement.classList.add('a11y-point');
      debugElement.style.left = `${onCameraPosition.x}px`;
      debugElement.style.top = `${onCameraPosition.y}px`;
      debugElement.innerText = element.name + ' · ' + distance.toFixed(2);

      document.querySelector('#a11y-points').appendChild(debugElement);
    }
  });

  // loop through points that do not have a physical element
  Object.values(objectDictionary.__fake__).forEach((point) => {
    // ignore points which 
    if(!frustum.containsPoint(point.position) || point.room !== roomNames[ctx.room]) {
      return;
    }

    cameraObjectPosition.copy(point.position);
    let distance = cameraDistanceTo(ctx, point.position);

    ctx.elements.push(point.id);
    distances[point.id] = distance;

    if (ctx.debugMode) {
      cameraObjectPosition.project(ctx.camera);

      const onCameraPosition = new THREE.Vector2(
        cameraObjectPosition.x * (window.innerWidth / 2) + (window.innerWidth / 2),
        -cameraObjectPosition.y * (window.innerHeight / 2) + (window.innerHeight / 2)
      );

      const debugElement = document.createElement('div');
      debugElement.classList.add('a11y-point');
      debugElement.style.left = `${onCameraPosition.x}px`;
      debugElement.style.top = `${onCameraPosition.y}px`;
      debugElement.innerText = point.id + ' · ' + distance.toFixed(2);

      document.querySelector('#a11y-points').appendChild(debugElement);
    }
  });

  ctx.elements.sort((e1, e2) => {
    return Math.abs(distances[e1] - distances[e2]) < 0.5 ? ('' + e1).localeCompare(e2) : Math.abs(distances[e1]) - Math.abs(distances[e2]);
  })

  if(ctx.currentElement != '') {
    const elementName = getElementName(ctx.currentElement);
    const element = ctx.scene.getObjectByName(elementName);

    if (element == null && (objectDictionary['__fake__'][elementName] == null || objectDictionary['__fake__'][elementName].room !== roomNames[ctx.room])) {
      ctx.currentElement = '';
      // speak('lost_focus');
    }
  }
}

const isElementChild = (elementPath) => {
  return elementPath.indexOf('.') !== -1;
}

const getElementPath = (elementPath) => {
  return elementPath.substring(0, elementPath.lastIndexOf('.'));
}

const getElementName = (elementPath) => {
  return elementPath.split('.').pop();
}

const getNextKeyInObject = (object, key) => {
  let keys = Object.keys(object);
  let index = keys.indexOf(key);

  if(keys.length == 0) return '';
  return keys[(index < keys.length - 1) ? index + 1 : 0];
}

const getElementDefinition = (elementPath) => {
  let elementSections = elementPath.split('.');
  let pathName = elementSections.shift();
  let startingPoint = objectDictionary[pathName] ?? objectDictionary['__fake__'][pathName];

  while(startingPoint != null && elementSections.length > 0) {
    pathName = elementSections.shift();
    if(startingPoint.children == null) return null;
    startingPoint = startingPoint.children[pathName];
  }

  return startingPoint;
}

const convertAngleToClock = (angle) => {
  return Math.round(angle * (12.0 / 360.0)) || 12;
}

const speak = (message, options = {}) => {
  if(ARIA_OUTPUT == null) {
    ARIA_OUTPUT = document.getElementById('aria-output');
  }

  ARIA_OUTPUT.innerHTML = '';
  ARIA_OUTPUT.innerText = translate(message, options);
}

const translate = (identifier, options = {}) => {
  return i18next.t(identifier, { ...options, interpolation: { skipOnVariables: false }})
}

export { convertAngleToClock, isElementChild, getNextKeyInObject, getElementPath, getElementName, getElementDefinition, speak, translate, updateElementList }