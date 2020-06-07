import * as THREE from 'three';

type Container = HTMLElement | string;

export class GameRenderer extends THREE.WebGLRenderer {

  public scene: THREE.Scene;
  public camera: THREE.Camera;

  private dom: Document;

  private animationId: number;

  constructor(container?: Container) {
    super();

    if (typeof document !== 'object' || typeof window !== 'object') {
      throw new Error('You are running this game instance out of browser!');
    }

    this.dom = document;

    // add to dom
    this.addToDom(container);
    
    // set renderer size
    this.setRendererStyle();

  }

  /**
   * Set current scene
   */
  public setScene(scene: THREE.Scene) {
    this.scene = scene;
  }

  /**
   * Set current camera
   */
  public setCamera(camera: THREE.Camera) {
    this.camera = camera;
  }

  /**
   * Start to render
   */
  public startRender() {
    if (!this.scene) {
      return console.error('Not set the scene to renderer yet!');
    }
    if (!this.camera) {
      return console.error('Not set the camera to renderer yet!');
    }
    if (this.animationId) {
      return false;
    }

    const animate = () => {
      this.animationId = requestAnimationFrame(animate);
      this.render(this.scene, this.camera);
    };
    animate();

    return true;
  }

  /**
   * Stop to render
   */
  public stopRender() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = undefined;
      return true;
    }

    return false;
  }

  /**
   * Add renderer domElement to document
   */
  private addToDom(container?: Container) {
    let containerElement: HTMLElement;
    
    if (container instanceof HTMLElement) {
      containerElement = containerElement;
    } else if (typeof container === 'string') {
      containerElement = this.dom.querySelector(container);
    } else {
      containerElement = this.dom.body;
    }

    containerElement.appendChild(this.domElement);
  }

  /**
   * Set renderer size and style
   */
  private setRendererStyle(ratio: number = 2) {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.setSize(width * ratio, height * ratio);

    this.domElement.style.position = 'fixed';
    this.domElement.style.top = '0';
    this.domElement.style.left = '0';
    this.domElement.style.width = width + 'px';
    this.domElement.style.height = height + 'px';
  }
  
}
