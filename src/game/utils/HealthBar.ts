import * as THREE from 'three';

const WIDTH = 1.0;
const HEIGHT = 0.14;

/** A simple billboarded enemy health bar made of two camera-facing sprites. */
export class HealthBar {
  private group: THREE.Group;
  private fill: THREE.Sprite;

  constructor(heightAboveOrigin: number) {
    this.group = new THREE.Group();
    this.group.position.y = heightAboveOrigin;

    const bg = new THREE.Sprite(
      new THREE.SpriteMaterial({ color: 0x2a2336, depthTest: false })
    );
    bg.scale.set(WIDTH + 0.06, HEIGHT + 0.06, 1);
    bg.renderOrder = 998;

    this.fill = new THREE.Sprite(
      new THREE.SpriteMaterial({ color: 0x5dd66b, depthTest: false })
    );
    this.fill.scale.set(WIDTH, HEIGHT, 1);
    this.fill.renderOrder = 999;

    this.group.add(bg);
    this.group.add(this.fill);
  }

  getObject(): THREE.Object3D {
    return this.group;
  }

  setRatio(ratio: number): void {
    const r = Math.max(0, Math.min(1, ratio));
    this.fill.scale.x = WIDTH * r;
    // keep the bar anchored to the left as it drains
    this.fill.position.x = -(WIDTH - this.fill.scale.x) / 2;
    const mat = this.fill.material as THREE.SpriteMaterial;
    mat.color.setHex(r > 0.5 ? 0x5dd66b : r > 0.25 ? 0xf2c94c : 0xeb5757);
  }

  setVisible(visible: boolean): void {
    this.group.visible = visible;
  }

  dispose(): void {
    this.group.traverse((obj) => {
      const sprite = obj as THREE.Sprite;
      if (sprite.material) (sprite.material as THREE.Material).dispose();
    });
  }
}
