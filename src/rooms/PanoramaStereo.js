import * as THREE from "three";
let panoL, panoR, context;

const setup = (ctx) =>  {
  const assets = ctx.assets;
  const geometry = new THREE.SphereGeometry(500, 60, 40);
  const materialL = new THREE.MeshBasicMaterial({
    map: assets["stereopanoR"],
    side: THREE.BackSide,
  });
  const materialR = new THREE.MeshBasicMaterial({
    map: assets["stereopanoL"],
    side: THREE.BackSide,
  });
  panoL = new THREE.Mesh(geometry, materialL);
  panoL.layers.set(1);
  panoR = new THREE.Mesh(geometry, materialR);
  panoR.layers.set(2);

  ctx.raycontrol.addState("panoramaStereo", {
    raycaster: false,
    onSelectEnd: onSelectEnd,
  });
}

const enter = (ctx) =>  {
  ctx.renderer.setClearColor(0x000000);
  ctx.scene.add(panoL);
  ctx.scene.add(panoR);
  ctx.camera.layers.enable(1);
  ctx.spectator.layers.enable(1);
  context = ctx;

  ctx.raycontrol.activateState("panoramaStereo");
}

const exit = (ctx) =>  {
  ctx.scene.remove(panoL);
  ctx.scene.remove(panoR);
  ctx.camera.layers.disable(1);
  ctx.spectator.layers.disable(1);
  ctx.raycontrol.deactivateState("panoramaStereo");
}

const execute = (ctx, delta, time) =>  {}

const onSelectEnd = (evt) =>  {
  context.goto = 0;
}

export { setup, exit, enter, execute, onSelectEnd };