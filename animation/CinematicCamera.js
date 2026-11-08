// Kamera dihitung dari waktu adegan. Pause, replay, seek dan penilaian tetap sinkron.
class CinematicCamera {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.fov = Math.PI / 3.2;
    this.cache = new WeakMap();
    this.actors = {
      kai: {
        root: scene.kai.root,
        parts: scene.kai.builder.parts
      },
      oogway: {
        root: scene.oogwayRoot,
        parts: scene.oogway.builder.parts
      },
      ping: {
        root: scene.pingRoot,
        parts: scene.ping.builder.parts
      }
    };
    this.relative = {
      kai: this.empty(),
      oogway: this.empty(),
      ping: this.empty()
    };
    this.story = {
      kai: this.empty(),
      reaction: this.empty(),
      oogway: this.empty(),
      ping: this.empty()
    };
    this.fight = this.empty();
    // Envelope seluruh pose mencegah zoom berdenyut karena langkah dan ayunan tangan.
    const saved = scene.time || 0;
    for (let t = 0; t <= scene.duration; t += 0.5) {
      scene.update(t);
      for (const [name, actor] of Object.entries(this.actors)) {
        const bounds = this.bounds(actor.parts),
          relative = {
            min: bounds.min.map((v, i) => v - actor.root.position[i]),
            max: bounds.max.map((v, i) => v - actor.root.position[i])
          };
        this.include(this.relative[name], relative);
        if (name === 'kai' && t <= 8.5) this.include(this.story.kai, relative);
        if (name === 'kai' && t >= 42) this.include(this.story.reaction, relative);
        if (name === 'ping' && (t >= 8 && t <= 15 || t >= 38 && t <= 42)) this.include(this.story
          .ping, relative);
        if (name === 'oogway' && t >= 14 && t <= 20) this.include(this.story.oogway, relative);
        if (t >= 19 && t <= 39) this.include(this.fight, bounds);
      }
      if (t >= 19 && t <= 39)
        for (const weapon of scene.kai.weapons) this.include(this.fight, this.bounds(weapon
          .builder.parts));
    }
    scene.update(saved);
    this.activeShot = 'kai';
  }
  empty() {
    return {
      min: [Infinity, Infinity, Infinity],
      max: [-Infinity, -Infinity, -Infinity]
    };
  }
  include(a, b) {
    for (let i = 0; i < 3; i++) {
      a.min[i] = Math.min(a.min[i], b.min[i]);
      a.max[i] = Math.max(a.max[i], b.max[i]);
    }
    return a;
  }
  corners(b) {
    const points = [];
    for (const x of [b.min[0], b.max[0]])
      for (const y of [b.min[1], b.max[1]])
        for (const z of [b.min[2], b.max[2]]) points.push([x, y, z]);
    return points;
  }
  local(mesh) {
    if (this.cache.has(mesh)) return this.cache.get(mesh);
    const b = this.empty(),
      v = mesh.vertices;
    for (let n = 0; n < v.length; n += 6)
      for (let i = 0; i < 3; i++) {
        b.min[i] = Math.min(b.min[i], v[n + i]);
        b.max[i] = Math.max(b.max[i], v[n + i]);
      }
    const points = this.corners(b);
    this.cache.set(mesh, points);
    return points;
  }
  bounds(parts) {
    const b = this.empty();
    for (const mesh of parts) {
      if (mesh.visible === false) continue;
      for (const p of this.local(mesh)) {
        const w = Mat4.point(mesh.MODEL_MATRIX, p);
        for (let i = 0; i < 3; i++) {
          b.min[i] = Math.min(b.min[i], w[i]);
          b.max[i] = Math.max(b.max[i], w[i]);
        }
      }
    }
    return b;
  }
  smooth(a, b, t) {
    const u = Math.max(0, Math.min(1, (t - a) / (b - a)));
    return u * u * (3 - 2 * u);
  }
  fit(bounds, yaw, pitch, aspect) {
    const target = bounds.min.map((v, i) => (v + bounds.max[i]) * 0.5);
    target[1] -= (bounds.max[1] - bounds.min[1]) * 0.10;
    const cp = Math.cos(pitch),
      sp = Math.sin(pitch),
      sy = Math.sin(yaw),
      cy = Math.cos(yaw),
      forward = [cp * sy, sp, cp * cy],
      right = [cy, 0, -sy],
      up = [-sp * sy, cp, -sp * cy];
    const tan = Math.tan(this.fov / 2),
      dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
    let distance = 6;
    for (const p of this.corners(bounds)) {
      const delta = p.map((v, i) => v - target[i]),
        x = dot(delta, right),
        y = dot(delta, up),
        z = dot(delta, forward);
      // Sisakan ruang untuk subtitle dan toolbar, juga pada layar potret.
      const required = Math.max(Math.abs(x) / (tan * aspect * 0.84), Math.abs(y) / (tan * (y >= 0 ?
        0.80 : 0.53)));
      distance = Math.max(distance, z + required);
    }
    return {
      target,
      distance: distance * 1.055 + 0.25,
      yaw,
      pitch
    };
  }
  shot(name, t, aspect, assessment = false) {
    if (name === 'wide') return this.fit(this.fight, 0.08 + 0.09 * this.smooth(20, 38, t), 0.18,
      aspect);
    const actor = this.actors[name],
      relative = assessment ? this.relative[name] : this.story[name === 'kai' && t >= 41.6 ?
        'reaction' : name],
      bounds = {
        min: relative.min.map((v, i) => v + actor.root.position[i]),
        max: relative.max.map((v, i) => v + actor.root.position[i])
      };
    const yaw = {
      kai: 0.38,
      ping: -0.04,
      oogway: -0.24
    } [name] + 0.035 * Math.sin(t * 0.18);
    return this.fit(bounds, yaw, 0.12, aspect);
  }
  blend(from, to, start, end, t, aspect) {
    const a = this.shot(from, t, aspect),
      b = this.shot(to, t, aspect),
      u = this.smooth(start, end, t),
      mix = (x, y) => x + (y - x) * u;
    this.activeShot = from + ' → ' + to;
    return {
      target: a.target.map((v, i) => mix(v, b.target[i])),
      distance: mix(a.distance, b.distance) + Math.sin(Math.PI * u) * 0.8,
      yaw: mix(a.yaw, b.yaw),
      pitch: mix(a.pitch, b.pitch)
    };
  }
  update(t, aspect, solo = null) {
    let shot;
    if (solo && this.actors[solo]) {
      this.activeShot = solo;
      shot = this.shot(solo, t, aspect, true);
    } else {
      const transitions = [
        ['kai', 'ping', 8.3, 9.3],
        ['ping', 'oogway', 14.5, 15.7],
        ['oogway', 'wide', 18.5, 20],
        ['wide', 'ping', 38.5, 39.6],
        ['ping', 'kai', 41.6, 42.6]
      ];
      let name = 'kai';
      for (const [from, to, start, end] of transitions) {
        if (t < start) break;
        if (t < end) {
          shot = this.blend(from, to, start, end, t, aspect);
          break;
        }
        name = to;
      }
      if (!shot) {
        this.activeShot = name;
        shot = this.shot(name, t, aspect);
      }
    }
    Object.assign(this.camera, shot);
  }
}
