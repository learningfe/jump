import * as THREE from 'three';

interface GroundParameters {
  size?: number;
  color?: string | number | THREE.Color;
  offsetY?: number;
}

interface HelpersParameters {
  size?: number;
  grid?: boolean;
  axes?: boolean;
}

interface LightsParameters {
  ambient?: boolean;
  direction?: boolean;
}

export class GameScene extends THREE.Scene {

  public ground: THREE.Mesh;
  public helpers: THREE.Object3D[];
  public lights: THREE.Light[];

  constructor() {
    super();

    // set scene gackground color
    this.background = new THREE.Color(0x999999);

    // create ground
    this.ground = this.createGround({ offsetY: -0.15 });
    this.add(this.ground);

    // create helper
    this.helpers = this.createHelpers();
    this.add(...this.helpers);
  
    // create light
    this.lights = this.createLights();
    this.add(...this.lights);
  
  }

  /**
   * Create ground
   */
  private createGround(parameters: GroundParameters = {}) {

    Object.assign<GroundParameters, GroundParameters>(
      parameters,
      {
        size: 1000,
        color: 0xcccccc,
        offsetY: 0,
      },
    );
    
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(parameters.size, parameters.size),
      new THREE.MeshStandardMaterial({ color: parameters.color, side: THREE.DoubleSide })
    );

    ground.rotateX(- Math.PI / 2);
    ground.position.setY(parameters.offsetY);

    return ground;
  }

  /**
   * Create helpers
   */
  private createHelpers(parameters: HelpersParameters = {}) {

    Object.assign<HelpersParameters, HelpersParameters>(
      parameters,
      {
        size: 1000,
        grid: true,
        axes: true,
      },
    );
    
    const helpers: (THREE.GridHelper | THREE.AxesHelper)[] = [];

    if (parameters.grid) {
      const gridHelper = new THREE.GridHelper(parameters.size, parameters.size / 10);
      helpers.push(gridHelper);
    }

    if (parameters.axes) {
      const axesHelper = new THREE.AxesHelper(parameters.size);
      helpers.push(axesHelper);
    }

    return helpers;
  }

  /**
   * Create lights
   */
  private createLights(parameters: LightsParameters = {}) {

    Object.assign<LightsParameters, LightsParameters>(
      parameters,
      {
        ambient: true,
        direction: true,
      }
    );

    const lights: THREE.Light[] = [];

    if (parameters.ambient) {
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      lights.push(ambientLight);
    }

    if (parameters.direction) {
      const directionLight = new THREE.DirectionalLight(0xffffff);
      directionLight.position.set(1, 2, 3);
      lights.push(directionLight);
    }

    return lights;
  }

}
