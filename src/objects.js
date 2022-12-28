import * as THREE from 'three'
import { speak } from './lib/accessibility';
import { cameraDistanceTo } from './lib/utils';
import { getCurrentNews } from './stations/NewsTicker';
import { activateStick, deactivateStick } from './stations/Xylophone';


const objectDictionary = {
  xylophone: {
    name: "xylophone_name",
    description: "xylophone_description",
    teleportation: {
      position: new THREE.Vector3(2.1643, 0.0, -2.517),
      rotation: new THREE.Vector3(-1.73, 0.0, 1.72),
    },
    interaction: {
      description: "",
      event: (ctx, controller, hand) => {
        let position = new THREE.Vector3();
        let elementName = (hand == 'left') ? "xylostick-left" : "xylostick-right";
        let target = ctx.scene.getObjectByName(elementName);

        if(controller.userData.grabbing !== null) {
          deactivateStick(controller);
          return speak('exit_xylophone');
        }

        target.getWorldPosition(position);
        let distance = cameraDistanceTo(ctx, position);

        if(distance > 0.99) {
          return speak('out_of_reach');
        }

        activateStick(ctx, 0, controller);
        return speak('enter_xylophone');
      }
    }
  },
  paintings: {
    name: "paintings_name",
    description: "paintings_description",
    teleportation: {
      position: new THREE.Vector3(1.8642, 0.0, -0.8037),
      rotation: new THREE.Vector3(-1.73, 0.0, 1.72),
    },
    children: {
      bosch: {
        name: "bosch_name",
        description: "bosch_description",
        teleportation: {
          position: new THREE.Vector3(5.05287, 0.0, -2.13125),
          rotation: new THREE.Vector3(-1.73, 0.0, 1.72),
        }
      },
      degas: {
        name: "degas_name",
        description: "degas_description",
        teleportation: {
          position: new THREE.Vector3(6.52162, 0.0, 1.63323),
          rotation: new THREE.Vector3(-1.73, 0.0, 1.72),
        }
      },
      rembrandt: {
        name: "rembrandt_name",
        description: "rembrandt_description",
        teleportation: {

        }
      },
      seurat: {
        name: "seurat_name",
        description: "seurat_description",
        teleportation: {
          position: new THREE.Vector3(6.52162, 0.0, 1.63323),
          rotation: new THREE.Vector3(-1.73, 0.0, 1.72),
        }
      },
      sorolla: {
        name: "sorolla_name",
        description: "sorolla_description",
        teleportation: {
          position: new THREE.Vector3(5.7982, 0.0, -5.6888),
          rotation: new THREE.Vector3(-1.73, 0.0, 1.72),
        }
      },
    },
  },
  door: {
    name: 'door_name',
    description: 'door_description',
    interaction: {
      description: "",
      event: (ctx) => {
        ctx.goto = 0;
        speak('return_back');
      }
    }
  },
  doorC: {
    name: 'door_c_name',
    description: 'door_c_description',
    interaction: {
      description: "",
      event: (ctx) => {
        ctx.goto = 3;
        speak('enter_room_c');
      }
    }
  },
  doorA: {
    name: 'door_a_name',
    description: 'door_a_description',
    interaction: {
      description: "",
      event: (ctx) => {
        ctx.goto = 1;
        speak('enter_room_a');
      }
    }
  },
  doorB: {
    name: 'door_b_name',
    description: 'door_b_description',
    interaction: {
      description: "",
      event: (ctx) => {
        ctx.goto = 2;
        speak('enter_room_b');
      }
    }
  },
  panoballmesh1: {
    name: "panoballmesh1_name",
    description: "panoballmesh1_description",
    interaction: {
      description: "",
      event: (ctx) => {
        ctx.goto = 4;
        speak('enter_panorama_1');
      }
    }
  },
  object: {
    name: "angel_name",
    description: "angel_description"
  },
  __fake__: {
    graffiti: {
      id: "graffiti",
      name: "graffiti_name",
      description: "graffiti_description",
      position: new THREE.Vector3(-0.738, 1.5, 6.249),
      room: 'hall',
      teleportation: {
        position: new THREE.Vector3(-0.82781, 0.0, 5.66473),
        rotation: new THREE.Vector3(0.0, 0.0, 0.0,)
      }
    },
    panoballs: {
      id: "panoballs",
      name: "panoballs_name",
      description: "panoballs_description",
      position: new THREE.Vector3(-0.480724, 1.25, -0.796223),
      room: 'hall',
      children: {
        panoballmesh2: {
          name: "panoballmesh2_name",
          description: "panoballmesh2_description",
          interaction: {
            description: "",
            event: (ctx) => {
              ctx.goto = 5;
              speak('enter_panorama_2');
            }
          }
        },
        panoballmesh3: {
          name: "panoballmesh3_name",
          description: "panoballmesh3_description",
          interaction: {
            description: "",
            event: (ctx) => {
              ctx.goto = 6;
              speak('enter_panorama_3');
            }
          }
        },
        panoballmesh4: {
          name: "panoballmesh4_name",
          description: "panoballmesh4_description",
          interaction: {
            description: "",
            event: (ctx) => {
              ctx.goto = 7;
              speak('enter_panorama_4');
            }
          }
        },
        panoballmesh5: {
          name: "panoballmesh5_name",
          description: "panoballmesh5_description",
          interaction: {
            description: "",
            event: (ctx) => {
              ctx.goto = 8;
              speak('enter_panorama_5');
            }
          }
        },
        panoballmesh6: {
          name: "panoballmesh6_name",
          description: "panoballmesh6_description",
          interaction: {
            description: "",
            event: (ctx) => {
              ctx.goto = 9;
              speak('enter_panorama_6');
            }
          }
        },
      }
    },
    newsticker: {
      id: "newsticker",
      name: "newsticker_name",
      description: "newsticker_description",
      position: new THREE.Vector3(-4.98878, 2.5, -0.95009),
      room: 'hall',
      teleportation: {
        position: new THREE.Vector3(-1.0, 1.25, -0.796223),
        rotation: new THREE.Vector3(-1.73, 0.0, 1.72),
      },
      interaction: {
        description: "newsticker_interaction_description",
        event: (ctx) => {
          let news = ctx.currentNews;
          speak('newsticker_message', { message: news.message, author: news.author });
        }
      }
    },
    viewpoint: {
      id: "viewpoint",
      name: "viewpoint_name",
      description: "viewpoint_description",
      position: new THREE.Vector3(0.06607, 1.5, -4.37845),
      room: 'vertigo',
      teleportation: {
        position: new THREE.Vector3(0.06607, 0.0, -4.37845),
        rotation: new THREE.Vector3(0.0, 0.0, 0.0),
      }
    }
  }
}

window.objectDictionary = objectDictionary;

export { objectDictionary }