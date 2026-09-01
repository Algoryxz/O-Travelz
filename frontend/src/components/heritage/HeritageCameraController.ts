/**
 * Smooth Orbit & Viewpoint Camera Controller for Heritage 3D Viewer.
 */
import * as THREE from 'three';
import type { CameraPreset } from '../../types/heritage';

export class HeritageCameraController {
  private camera: THREE.PerspectiveCamera;
  private domElement: HTMLElement;

  public target = new THREE.Vector3(0, 1.2, 0);
  public currentPosition = new THREE.Vector3(0, 2.2, 5.2);
  public desiredPosition = new THREE.Vector3(0, 2.2, 5.2);
  public desiredTarget = new THREE.Vector3(0, 1.2, 0);

  public minDistance = 1.5;
  public maxDistance = 18.0;
  public autoRotate = true;
  public autoRotateSpeed = 0.4; // deg/frame

  private isDragging = false;
  private isRightDragging = false;
  private prevMouseX = 0;
  private prevMouseY = 0;
  private touchStartDistance = 0;

  private spherical = { radius: 5.5, theta: 0.6, phi: 1.25 };
  private desiredSpherical = { radius: 5.5, theta: 0.6, phi: 1.25 };

  constructor(camera: THREE.PerspectiveCamera, domElement: HTMLElement) {
    this.camera = camera;
    this.domElement = domElement;
    this.setupListeners();
  }

  public applyPreset(preset: CameraPreset): void {
    this.desiredPosition.set(preset.position[0], preset.position[1], preset.position[2]);
    this.desiredTarget.set(preset.target[0], preset.target[1], preset.target[2]);
    this.minDistance = preset.min_distance;
    this.maxDistance = preset.max_distance;

    const offset = this.desiredPosition.clone().sub(this.desiredTarget);
    this.desiredSpherical.radius = THREE.MathUtils.clamp(offset.length(), this.minDistance, this.maxDistance);
    this.desiredSpherical.theta = Math.atan2(offset.x, offset.z);
    this.desiredSpherical.phi = Math.acos(THREE.MathUtils.clamp(offset.y / this.desiredSpherical.radius, -1, 1));

    this.spherical = { ...this.desiredSpherical };
  }

  public focusOnHotspot(position: [number, number, number], offset?: [number, number, number]): void {
    const focusTarget = new THREE.Vector3(position[0], position[1], position[2]);
    this.desiredTarget.copy(focusTarget);

    if (offset) {
      this.desiredPosition.set(offset[0], offset[1], offset[2]);
      const diff = this.desiredPosition.clone().sub(this.desiredTarget);
      this.desiredSpherical.radius = THREE.MathUtils.clamp(diff.length(), this.minDistance, this.maxDistance);
      this.desiredSpherical.theta = Math.atan2(diff.x, diff.z);
      this.desiredSpherical.phi = Math.acos(THREE.MathUtils.clamp(diff.y / this.desiredSpherical.radius, -1, 1));
    } else {
      this.desiredSpherical.radius = Math.max(this.minDistance + 0.8, this.desiredSpherical.radius * 0.7);
    }
  }

  public resetCamera(): void {
    this.desiredSpherical.radius = 5.5;
    this.desiredSpherical.theta = 0.6;
    this.desiredSpherical.phi = 1.25;
    this.desiredTarget.set(0, 1.2, 0);
  }

  public update(delta: number): void {
    if (this.autoRotate && !this.isDragging) {
      this.desiredSpherical.theta += (this.autoRotateSpeed * Math.PI) / 180 * delta * 60;
    }

    // Damping interpolation
    const damping = Math.min(1.0, 10.0 * delta);
    this.spherical.radius += (this.desiredSpherical.radius - this.spherical.radius) * damping;
    this.spherical.theta += (this.desiredSpherical.theta - this.spherical.theta) * damping;
    this.spherical.phi += (this.desiredSpherical.phi - this.spherical.phi) * damping;

    this.target.lerp(this.desiredTarget, damping);

    // Clamp phi to prevent singularity at poles
    this.spherical.phi = THREE.MathUtils.clamp(this.spherical.phi, 0.15, Math.PI - 0.15);

    const x = this.spherical.radius * Math.sin(this.spherical.phi) * Math.sin(this.spherical.theta);
    const y = this.spherical.radius * Math.cos(this.spherical.phi);
    const z = this.spherical.radius * Math.sin(this.spherical.phi) * Math.cos(this.spherical.theta);

    this.currentPosition.set(x, y, z).add(this.target);
    this.camera.position.copy(this.currentPosition);
    this.camera.lookAt(this.target);
  }

  private setupListeners(): void {
    const el = this.domElement;

    const onMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      if (e.button === 0) this.isDragging = true;
      if (e.button === 2) this.isRightDragging = true;
      this.prevMouseX = e.clientX;
      this.prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!this.isDragging && !this.isRightDragging) return;
      const dx = e.clientX - this.prevMouseX;
      const dy = e.clientY - this.prevMouseY;
      this.prevMouseX = e.clientX;
      this.prevMouseY = e.clientY;

      if (this.isDragging) {
        this.desiredSpherical.theta -= dx * 0.006;
        this.desiredSpherical.phi -= dy * 0.006;
        this.desiredSpherical.phi = THREE.MathUtils.clamp(this.desiredSpherical.phi, 0.15, Math.PI - 0.15);
      } else if (this.isRightDragging) {
        const panFactor = 0.003 * this.spherical.radius;
        const right = new THREE.Vector3().crossVectors(this.camera.up, this.camera.getWorldDirection(new THREE.Vector3())).normalize();
        this.desiredTarget.addScaledVector(right, dx * panFactor);
        this.desiredTarget.y += dy * panFactor;
      }
    };

    const onMouseUp = () => {
      this.isDragging = false;
      this.isRightDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomDelta = e.deltaY * 0.003;
      this.desiredSpherical.radius = THREE.MathUtils.clamp(
        this.desiredSpherical.radius + zoomDelta,
        this.minDistance,
        this.maxDistance
      );
    };

    const onContextMenu = (e: Event) => e.preventDefault();

    // Touch support for mobile
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.prevMouseX = e.touches[0].clientX;
        this.prevMouseY = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        this.isDragging = false;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        this.touchStartDistance = Math.sqrt(dx * dx + dy * dy);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && this.isDragging) {
        const dx = e.touches[0].clientX - this.prevMouseX;
        const dy = e.touches[0].clientY - this.prevMouseY;
        this.prevMouseX = e.touches[0].clientX;
        this.prevMouseY = e.touches[0].clientY;

        this.desiredSpherical.theta -= dx * 0.008;
        this.desiredSpherical.phi -= dy * 0.008;
        this.desiredSpherical.phi = THREE.MathUtils.clamp(this.desiredSpherical.phi, 0.15, Math.PI - 0.15);
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const delta = (this.touchStartDistance - dist) * 0.01;
        this.touchStartDistance = dist;

        this.desiredSpherical.radius = THREE.MathUtils.clamp(
          this.desiredSpherical.radius + delta,
          this.minDistance,
          this.maxDistance
        );
      }
    };

    const onTouchEnd = () => {
      this.isDragging = false;
    };

    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('contextmenu', onContextMenu);

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: true });
    el.addEventListener('touchend', onTouchEnd);

    this.dispose = () => {
      el.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('contextmenu', onContextMenu);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }

  public dispose = () => {};
}
