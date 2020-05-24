import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { tween, ColdSubscription, easing } from 'popmotion';

export enum Animation {
  MOVE_PLAYER = 1001,
  MOVE_CAMERA = 1002,
}

export default class Jump {

  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  // private controls: OrbitControls;

  private player: THREE.Mesh;

  private blocks: THREE.Mesh[] = [];

  private animations = new Map<Animation, ColdSubscription>();

  public restart() {

    window.THREE = THREE;
    
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer();
    this.camera = new THREE.PerspectiveCamera(60, 1, 1, 1000);

    // set renderer
    this.renderer.setSize(1024, 1024);
    
    // add dom
    document.body.appendChild(this.renderer.domElement);
    this.renderer.domElement.style.width = 512 + 'px';
    this.renderer.domElement.style.height = 512 + 'px';

    // set background
    this.scene.background = new THREE.Color(0x999999);
    
    // set camrera
    this.camera.position.set(-1, 1, -1);
    this.camera.lookAt(0, 0, 0);

    // create light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const directionLight = new THREE.DirectionalLight(0xffffff);
    directionLight.position.set(1, 2, 3);
    this.scene.add(directionLight);

    // create helper
    const gridHelper = new THREE.GridHelper(1000, 100);
    this.scene.add(gridHelper);

    const axesHelper = new THREE.AxesHelper(1000);
    this.scene.add(axesHelper);
  
    // create ground
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(1000, 1000),
      new THREE.MeshStandardMaterial({ color: 0xcccccc, side: THREE.DoubleSide })
    );
    ground.rotateX(- Math.PI / 2);
    ground.position.setY(-0.15);
    this.scene.add(ground);

    // controls
    // this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    // jumper
    this.player = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.08, 0.4, 12),
      new THREE.MeshStandardMaterial({ color: 0x007acc })
    );
    this.player.geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 0.2, 0));
    this.player.userData.currentIndex = 0;
    this.scene.add(this.player);

    // box
    const count = 10;
    for (let i = 0; i < count; i ++) {
      // size: 0.5m - 1m
      const size = Math.random() * 0.5 + 0.5;
      // distance: 0m - 5m
      // edge to edge, not center to center
      const edgeDistance = Math.random() * 3;
      const prevBlock = this.blocks[this.blocks.length - 1];
      const prevSize = prevBlock && prevBlock.userData.size / 2 || 0;
      const distance = edgeDistance + size / 2 + prevSize;
      const direction = Math.random() > 0.5 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 0, 1);
      const position = prevBlock && prevBlock.position.clone().addScaledVector(direction, distance) || new THREE.Vector3();

      const height = 0.3;
      const color = Math.floor(Math.random() * 0xffffff);
      const block = new THREE.Mesh(
        new THREE.BoxGeometry(size, height, size),
        new THREE.MeshStandardMaterial({ color }),
      );
      block.userData.size = size;
      block.userData.direction = direction;
      block.geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, -height / 2, 0));
      block.position.copy(position);
      this.scene.add(block);
      this.blocks.push(block);
    }

    this.resetCamera();
    
    // render animate
    this.animate();

    this.registerEvent();
  }

  private animate() {
    this.renderer.render(this.scene, this.camera);
    // this.controls.update();

    requestAnimationFrame(() => this.animate());
  }

  private registerEvent() {
    let startTime: number = 0;

    let interval;

    const onStart = () => {
      startTime = Date.now();
      interval = setInterval(() => {
        const width = (Date.now() - startTime) / 1000 * 20;
        document.getElementById('progress').style.width = Math.min(width, 100) + '%';
      }, 16);
    }

    const onFinish = () => {
      this.renderer.domElement.removeEventListener('touchend', onFinish);
      document.getElementById('progress').style.width = '0';
      clearInterval(interval);
      const pressTime = Date.now() - startTime;

      this.movePlayer(pressTime / 1000);
      
    };

    this.renderer.domElement.addEventListener('touchstart', () => {
      onStart();
      this.renderer.domElement.addEventListener('touchend', onFinish);
    });
    this.renderer.domElement.addEventListener('mousedown', () => {
      onStart();
      this.renderer.domElement.addEventListener('mouseup', onFinish);
    });
  }

  private movePlayer(time: number) {

    if (time < 0.1) { return console.warn(`You are so short! (${time}s)`); }
    if (this.animations.size) { return console.warn(`Wait a minute, fuck!`); }

    if (this.player.userData.currentIndex >= this.blocks.length) {
      return console.warn('No more blocks !');
    }

    const nextBlock = this.blocks[++ this.player.userData.currentIndex];

    // const direction = nextBlock.userData.direction;
    const direction = nextBlock.position.clone().sub(this.player.position).normalize();

    let subscription = this.animations.get(Animation.MOVE_PLAYER);
    if (subscription) {
      subscription.stop();
    }

    const angle = Math.PI / 8;
    const gravity = 10;

    const height = 0.5 * gravity * Math.pow((time / 2), 2);
    const distance = 8 * Math.tan(angle) * height;

    const speedX = distance / time;
    const speedY = 4 * height / time;

    const start = this.player.position.clone();
    const end = start.clone().addScaledVector(direction, distance);

    const getY = (t: number) => speedY * t - 0.5 * gravity * Math.pow(t, 2);

      const points: THREE.Vector3[] = [start];

    subscription = tween({
      from: {
        x: start.x,
        y: start.y,
        z: start.z,
        time: 0,
        rotation: 0,
      },
      to: {
        x: end.x,
        y: end.y,
        z: end.z,
        time: time,
        rotation: Math.PI * 2,
      },
      ease: easing.linear,
      duration: time * 1000,
    }).start({
      update: (v: {x: number; y: number; z: number; time: number; rotation: number}) => {
        const pos = new THREE.Vector3(v.x, v.y, v.z);
        const y = getY(v.time);
        pos.setY(start.y + y);
        
        this.player.position.copy(pos);

        points.push(pos);
      },
      complete: () => {
        this.animations.delete(Animation.MOVE_PLAYER);
        this.resetCamera();

        const line = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(points),
          new THREE.LineBasicMaterial({ color: 0xff3300 })
        );
        this.scene.add(line);

        // check die
        const pos = this.player.position.clone().setY(0);
        const box = new THREE.Box3().setFromObject(this.blocks[this.player.userData.currentIndex]);
        box.applyMatrix4(new THREE.Matrix4().makeTranslation(0, box.getSize(new THREE.Vector3()).y / 2, 0));
        const isOK = box.containsPoint(pos);
        if (!isOK) {
          console.warn('Game over, mother fuck!');
          // console.warn(box, pos);
        }
      }
    });
    this.animations.set(Animation.MOVE_PLAYER, subscription);
  }

  private moveObject(animationKey: Animation, object: THREE.Object3D, end: THREE.Vector3, duration: number = 1000) {
    let subscription = this.animations.get(animationKey);
    if (subscription) {
      subscription.stop();
    }
    subscription = tween({
      from: object.position.clone().toArray(),
      to: end.clone().toArray(),
      duration,
    }).start({
      update: posArray => {
        object.position.fromArray(posArray);
      },
      complete: () => {
        this.animations.delete(animationKey);
      }
    });
    this.animations.set(animationKey, subscription);
  }

  private resetCamera() {
    const end = this.getCameraPosition();
    this.moveObject(Animation.MOVE_CAMERA, this.camera, end, 800);
  }

  private getCameraPosition() {
    return this.player.position.clone().addScaledVector(
      new THREE.Vector3(-1, 2, -1).normalize(),
      3,
    );
  }

}
