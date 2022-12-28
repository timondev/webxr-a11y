import * as THREE from 'three';
import { objectDictionary } from '../objects';
import { configureTextBuilder, Text } from 'troika-three-text';
import i18next from 'i18next';

const frustum = new THREE.Frustum();
const aabb = new THREE.Box3()
const sphere = new THREE.Sphere();
const cameraObjectPosition = new THREE.Vector3();
const position = new THREE.Vector3();

window.Box3 = THREE.Box3;

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

const readSurroundings = (ctx) => {
  const xrCamera = ctx.renderer.xr.getCamera(ctx.camera)

  let distance = -1.0;
  let cameraPosition = xrCamera.position;
  ctx.objects = [];

  if(ctx.values.debugMode) {
    document.querySelector('#a11y-points').innerHTML = '';
  }

  xrCamera.updateProjectionMatrix();
  frustum.setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices( ctx.camera.projectionMatrix, ctx.camera.matrixWorldInverse ))

  ctx.scene.updateWorldMatrix(true, true);
  ctx.scene.traverseVisible((object) => {
    if(object.name == '' || objectDictionary[object.name] == null || object instanceof Text) return;
    if(object.isMesh && !frustum.intersectsObject(object)) {
      return;
    }

    if(object.isObject3D && object.isMesh !== true) {
      aabb.setFromObject(object, true);
      aabb.getBoundingSphere(sphere);
      sphere.applyMatrix4(object.matrixWorld);
  
      if(!frustum.intersectsSphere(sphere)) return;
    }

    object.getWorldPosition(position);
    // position.applyMatrix4(object.matrixWorld);
    distance = cameraPosition.distanceTo(position);

    const objectDefinition = objectDictionary[object.name];
    ctx.objects.push({ definition: objectDefinition, object });

    if (ctx.values.debugMode) {
      object.getWorldPosition(cameraObjectPosition);
      cameraObjectPosition.project(ctx.camera);

      const onCameraPosition = new THREE.Vector2(
        cameraObjectPosition.x * (window.innerWidth / 2) + (window.innerWidth / 2),
        -cameraObjectPosition.y * (window.innerHeight / 2) + (window.innerHeight / 2)
      );

      const element = document.createElement('div');
      element.classList.add('a11y-point');
      element.style.left = `${onCameraPosition.x}px`;
      element.style.top = `${onCameraPosition.y}px`;
      element.innerText = object.name + ' · ' + distance.toFixed(2);

      element.dataset.name = object.name;

      document.querySelector('#a11y-points').appendChild(element);
    }
  });

  Object.values(objectDictionary.__fake__).forEach((point) => {
    if(!frustum.containsPoint(point.position) || point.room !== roomNames[ctx.room]) {
      return;
    }

    distance = cameraPosition.distanceTo(point.position);
    const object = ctx.scene.getObjectByName(point.id);
    ctx.objects.push({ definition: point, object });

    if (ctx.values.debugMode) {
      cameraObjectPosition.copy(point.position);
      cameraObjectPosition.project(ctx.camera);

      const onCameraPosition = new THREE.Vector2(
        cameraObjectPosition.x * (window.innerWidth / 2) + (window.innerWidth / 2),
        -cameraObjectPosition.y * (window.innerHeight / 2) + (window.innerHeight / 2)
      );

      const element = document.createElement('div');
      element.classList.add('a11y-point');
      element.style.left = `${onCameraPosition.x}px`;
      element.style.top = `${onCameraPosition.y}px`;
      element.innerText = point.name + ' · ' + distance.toFixed(2);

      element.dataset.name = point.name;

      document.querySelector('#a11y-points').appendChild(element);
    }
  })
}

const angleToClock = (angle, language) => {
  if(angle >= 345.0 || angle < 15.0)  return i18next.t('clock', { clock: 12, lng: language });
  if(angle >= 15.0  && angle < 45.0)  return i18next.t('clock', { clock:  1, lng: language });
  if(angle >= 45.0  && angle < 75.0)  return i18next.t('clock', { clock:  2, lng: language });
  if(angle >= 75.0  && angle < 105.0) return i18next.t('clock', { clock:  3, lng: language });
  if(angle >= 105.0 && angle < 135.0) return i18next.t('clock', { clock:  4, lng: language });
  if(angle >= 135.0 && angle < 165.0) return i18next.t('clock', { clock:  5, lng: language });
  if(angle >= 165.0 && angle < 195.0) return i18next.t('clock', { clock:  6, lng: language });
  if(angle >= 195.0 && angle < 225.0) return i18next.t('clock', { clock:  7, lng: language });
  if(angle >= 225.0 && angle < 255.0) return i18next.t('clock', { clock:  8, lng: language });
  if(angle >= 255.0 && angle < 285.0) return i18next.t('clock', { clock:  9, lng: language });
  if(angle >= 285.0 && angle < 315.0) return i18next.t('clock', { clock: 10, lng: language });
  if(angle >= 315.0 && angle < 345.0) return i18next.t('clock', { clock: 11, lng: language });

  return i18next.t('clock_unkown', { lng: language });;
}

const requestText = (identifier, modifiers, language = 'de') => {
  speak(i18next.t(identifier, { ...modifiers, lng: language }));
}

const speak = (text) => {
  const ariaOutput = document.getElementById('aria-output');

  ariaOutput.innerHTML = '';
  ariaOutput.innerText = text;
}

const readRoom = (ctx) => {
  let zeroPoint = new THREE.Vector2(0.0, 0.0);
  objects.sort((o1, o2) => {
    return (Math.abs(o1.distance - o2.distance) < 0.5) ? Math.abs(o1.position.distanceTo(zeroPoint)) - Math.abs(o2.position.distanceTo(zeroPoint)) : Math.abs(o1.distance) - Math.abs(o2.distance)
  })

  return objects
}

export { readRoom, requestText, angleToClock, speak, readSurroundings, getChildOfObject };