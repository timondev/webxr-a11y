import * as THREE from "three";
import { TagComponent, Component, SystemStateComponent, Types } from "ecsy";

class Object3D extends Component {
  constructor() {
    super();
    this.value = null;
  }

  reset() {
    this.value = null;
  }
}

Object3D.schema = {
  value: { type: Types.Ref },
};

class Rotation extends Component {
  constructor() {
    super();
    this.rotation = new THREE.Vector3();
  }

  reset() {}
}

Rotation.schema = {
  rotation: { type: Types.Ref },
};

class Position extends Component {
  constructor() {
    super();
    this.position = new THREE.Vector3();
  }

  reset() {}
}

Position.schema = {
  position: { type: Types.Ref },
};

class ParentObject3D extends Component {
  constructor() {
    super();
    this.value = null;
  }

  reset() {
    this.value = null;
  }
}

ParentObject3D.schema = {
  value: { type: Types.Ref },
};

class Text extends Component {
  constructor() {
    super();
    this.text = "";
    this.textAlign = "left"; // ['left', 'right', 'center']
    this.anchorX = "center"; // ['left', 'right', 'center', 'align']
    this.baseline = "center"; // ['top', 'center', 'bottom']
    this.color = "#FFF";
    this.font = "https://code.cdn.mozilla.net/fonts/ttf/ZillaSlab-SemiBold.ttf";
    this.fontSize = 0.2;
    this.letterSpacing = 0;
    this.lineHeight = 0;
    this.maxWidth = Infinity;
    this.overflowWrap = "normal"; // ['normal', 'break-word']
    this.whiteSpace = "normal"; // ['normal', 'nowrap']
    this.opacity = 1;
  }

  reset() {
    this.text = "";
  }
}

Text.schema = {
  text: { type: Types.String },
  textAlign: { type: Types.String },
  anchorX: { type: Types.String },
  baseline: { type: Types.String },
  color: { type: Types.String },
  font: { type: Types.String },
  fontSize: { type: Types.Number },
  letterSpacing: { type: Types.Number },
  lineHeight: { type: Types.Number },
  maxWidth: { type: Types.Number },
  overflowWrap: { type: Types.String },
  whiteSpace: { type: Types.String },
  opacity: { type: Types.Number },
};

class BoundingBox extends Component {
  constructor() {
    super();
    this.min = new THREE.Vector3();
    this.max = new THREE.Vector3();
    // this.box3?
  }

  reset() {
    this.min.set(0, 0, 0);
    this.max.set(0, 0, 0);
  }
}

BoundingBox.schema = {
  min: { type: Types.Ref },
  max: { type: Types.Ref },
};

class BoundingSphere extends Component {
  constructor() {
    super();
    this.debug = true;
    this.center = new THREE.Vector3();
    this.radius = 0;
    //this.sphere?
  }

  reset() {
    this.center.set(0, 0, 0);
    this.radius = 0;
  }
}

BoundingSphere.schema = {
  debug: { type: Types.Boolean },
  center: { type: Types.Ref },
  radius: { type: Types.Number },
};

class Area extends TagComponent {}
class AreaEntering extends TagComponent {}
class AreaExiting extends TagComponent {}
class AreaInside extends TagComponent {}
class AreaChecker extends TagComponent {}

const empty = () => {};

class AreaReactor extends Component {
  constructor() {
    super();
    this.reset();
  }

  reset() {
    this.onEntering = empty;
    this.onExiting = empty;
  }
}

AreaReactor.schema = {
  onEntering: { type: Types.Ref },
  onExiting: { type: Types.Ref },
};

class DebugHelper extends TagComponent {}

class DebugHelperMesh extends SystemStateComponent {
  constructor() {
    super();
    this.boxHelper = new THREE.BoxHelper();
  }
}

DebugHelperMesh.schema = {
  boxHelper: { type: Types.Ref },
};

class Billboard extends Component {
  constructor() {
    super();
    this.camera3D = null;
  }

  reset() {
    this.camera3D = null;
  }
}

Billboard.schema = {
  camera3D: { type: Types.Ref },
};

class Children extends Component {
  constructor() {
    super();
    this.value = [];
  }

  reset() {
    this.value.array.length = 0;
  }
}

Children.schema = {
  value: { type: Types.Array },
};

class Opacity extends Component {
  constructor() {
    super();
    this.opacity = 0;
  }

  reset() {
    this.opacity = 0;
  }
}

Opacity.schema = {
  opacity: { type: Types.Number },
};

export {
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
};
