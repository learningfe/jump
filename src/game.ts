import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default class Jump {

  private domElement: HTMLCanvasElement;

  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;

  public restart() {
    
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer();
    this.camera = new THREE.PerspectiveCamera(60, 1, 1, 1000);

    // set renderer
    this.renderer.setSize(800, 800);
    
    // add dom
    document.body.appendChild(this.renderer.domElement);
    this.renderer.domElement.style.width = 800 + 'px';
    this.renderer.domElement.style.height = 800 + 'px';

    // set background
    this.scene.background = new THREE.Color(0x999999);
    
    // set camrera
    this.camera.position.set(100, 100, 100);
    this.camera.lookAt(0, 0, 0);

    // create light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(ambientLight);

    const directionLight = new THREE.DirectionalLight(0xaaabac);
    directionLight.target.position.set(1, -1, 1);
    this.scene.add(directionLight);
  
    // create ground
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.MeshLambertMaterial({ color: 0xcccccc })
    );
    ground.rotateX(- Math.PI / 2);
    this.scene.add(ground);

    // controls
    new OrbitControls(this.camera, this.renderer.domElement);

    // render animate
    this.animate();

  }

  private animate() {
    this.renderer.render(this.scene, this.camera);

    requestAnimationFrame(() => this.animate());
  }
  
}
