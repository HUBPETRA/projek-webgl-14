// Kamera pasif: seluruh posisi dikendalikan CinematicCamera, tanpa input mouse.
class Camera {
  constructor(canvas) {
    this.canvas = canvas;
    this.target = [0, 2.5, 0];
    this.distance = 20;
    this.yaw = 0;
    this.pitch = 0.12;
  }
  getPosition() {
    const c = Math.cos(this.pitch);
    return [this.target[0] + this.distance * c * Math.sin(this.yaw), this.target[1] + this
      .distance * Math.sin(this.pitch), this.target[2] + this.distance * c * Math.cos(this.yaw)
    ];
  }
  getViewMatrix() {
    return this.lookAt(this.getPosition(), this.target, [0, 1, 0]);
  }
  lookAt(eye, center, up) {
    const norm = v => {
        const n = Math.hypot(...v) || 1;
        return v.map(x => x / n);
      },
      cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[
        1] * b[0]],
      dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
    const z = norm(eye.map((v, i) => v - center[i])),
      x = norm(cross(up, z)),
      y = cross(z, x);
    return new Float32Array([x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -dot(
      x, eye), -dot(y, eye), -dot(z, eye), 1]);
  }
}
