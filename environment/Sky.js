// Langit prosedural digambar tepat pada layar, sebelum semua mesh 3D.
// Tidak memakai gambar tekstur atau kubus langit yang sangat besar.
class Sky {
  static vertexSource = `
    attribute vec2 screenPosition;
    uniform vec2 tanHalfFov;
    uniform vec3 cameraRight;
    uniform vec3 cameraUp;
    uniform vec3 cameraForward;
    varying vec3 viewRay;

    void main() {
      viewRay = cameraForward
        + cameraRight * screenPosition.x * tanHalfFov.x
        + cameraUp * screenPosition.y * tanHalfFov.y;
      gl_Position = vec4(screenPosition, 1.0, 1.0);
    }
  `;

  static fragmentSource = `
    #ifdef GL_FRAGMENT_PRECISION_HIGH
      precision highp float;
    #else
      precision mediump float;
    #endif
    varying vec3 viewRay;
    uniform vec3 eyePosition;
    uniform vec3 horizonColor;
    uniform vec3 zenithColor;
    uniform vec3 groundColor;
    uniform vec3 sunDirection;
    uniform float groundHeight;

    // Noise deterministik: awan tidak berubah ketika pause, seek, atau replay.
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }
    float noise(vec2 p) {
      vec2 cell = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(cell), hash(cell + vec2(1.0, 0.0)), f.x),
        mix(hash(cell + vec2(0.0, 1.0)), hash(cell + vec2(1.0, 1.0)), f.x), f.y);
    }
    float cloudNoise(vec2 p) {
      return 0.57 * noise(p) + 0.28 * noise(p * 2.03 + 7.1)
        + 0.15 * noise(p * 4.07 + 16.3);
    }

    void main() {
      vec3 ray = normalize(viewRay);
      float altitude = pow(smoothstep(-0.02, 0.80, ray.y), 0.70);
      vec3 color = mix(horizonColor, zenithColor, altitude);

      // Awan putih lembut mengikuti arah pandang dunia, bukan menempel pada layar.
      vec2 cloudUV = ray.xz / max(ray.y + 0.12, 0.12) * 1.55 + vec2(3.7, -4.2);
      float clouds = smoothstep(0.51, 0.73, cloudNoise(cloudUV));
      clouds *= smoothstep(0.035, 0.20, ray.y);
      color = mix(color, vec3(0.99, 0.975, 0.93), clouds * 0.76);

      // Matahari hanya elemen visual; lighting model tetap di shader.js.
      float sunCosine = dot(ray, normalize(sunDirection));
      color += vec3(0.16, 0.10, 0.025) * pow(max(sunCosine, 0.0), 40.0);
      float sunDisc = smoothstep(0.9991, 0.9997, sunCosine);
      color = mix(color, vec3(1.0, 0.93, 0.72), sunDisc * 0.90);

      // Tanah luar berupa bidang Y tetap yang dihitung per piksel.
      // Ini mengisi sisa frame tanpa membangun halaman atau peta yang berlebihan.
      if (ray.y < -0.001) {
        float distanceToGround = (groundHeight - eyePosition.y) / ray.y;
        vec2 groundXZ = eyePosition.xz + ray.xz * distanceToGround;
        float variation = (noise(groundXZ * 0.16) - 0.5) * 0.025;
        vec3 land = groundColor + variation;
        float haze = smoothstep(24.0, 100.0, distanceToGround);
        color = mix(land, horizonColor, haze);
      }
      gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
    }
  `;

  /** @param {WebGLRenderingContext} gl Konteks WebGL dari canvas utama. */
  constructor(gl) {
    this.gl = gl;
    this.settings = {
      horizonColor: [0.82, 0.88, 0.84], // RGB dekat cakrawala, 0..1.
      zenithColor: [0.30, 0.57, 0.78], // RGB langit bagian atas, 0..1.
      groundColor: [0.36, 0.43, 0.29], // RGB tanah di luar halaman ubin.
      groundHeight: -0.65, // Tinggi tanah luar, sedikit di bawah fondasi.
      sunDirection: [-0.55, 0.35, -0.76] // Arah matahari dalam koordinat dunia.
    };
    const vertex = compileShader(gl, Sky.vertexSource, gl.VERTEX_SHADER);
    const fragment = compileShader(gl, Sky.fragmentSource, gl.FRAGMENT_SHADER);
    if (!vertex || !fragment) throw Error('Shader langit gagal dikompilasi.');
    this.program = gl.createProgram();
    gl.attachShader(this.program, vertex);
    gl.attachShader(this.program, fragment);
    gl.linkProgram(this.program);
    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      throw Error('Program langit gagal ditautkan: ' + gl.getProgramInfoLog(this.program));
    }
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    this.position = gl.getAttribLocation(this.program, 'screenPosition');
    this.uniforms = {};
    for (const name of ['tanHalfFov', 'cameraRight', 'cameraUp', 'cameraForward',
      'eyePosition', 'horizonColor', 'zenithColor', 'groundColor', 'groundHeight',
      'sunDirection']) this.uniforms[name] = gl.getUniformLocation(this.program, name);
    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    // Empat sudut layar -1..1, dirangkai menjadi dua segitiga dengan TRIANGLE_STRIP.
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  }

  /**
   * @param {Float32Array} view Matriks pandangan dari Camera.getViewMatrix().
   * @param {Float32Array} projection Matriks perspektif, termasuk rasio canvas.
   * @returns {Object} Basis kamera dan posisi mata untuk shader serta pemeriksaan.
   */
  frame(view, projection) {
    const right = [view[0], view[4], view[8]];
    const up = [view[1], view[5], view[9]];
    const forward = [-view[2], -view[6], -view[10]];
    const eye = [0, 1, 2].map(i => -right[i] * view[12] - up[i] * view[13]
      + forward[i] * view[14]);
    return {right, up, forward, eye, tanHalfFov: [1 / projection[0], 1 / projection[5]]};
  }

  /** Menggambar latar tanpa menulis depth; objek 3D kemudian digambar di depannya. */
  draw(view, projection) {
    const gl = this.gl, f = this.frame(view, projection), u = this.uniforms;
    gl.disable(gl.DEPTH_TEST);
    gl.depthMask(false);
    gl.useProgram(this.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.vertexAttribPointer(this.position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.position);
    for (const [name, value] of Object.entries({cameraRight:f.right, cameraUp:f.up,
      cameraForward:f.forward, eyePosition:f.eye, horizonColor:this.settings.horizonColor,
      zenithColor:this.settings.zenithColor, groundColor:this.settings.groundColor,
      sunDirection:this.settings.sunDirection})) gl.uniform3fv(u[name], value);
    gl.uniform2fv(u.tanHalfFov, f.tanHalfFov);
    gl.uniform1f(u.groundHeight, this.settings.groundHeight);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.depthMask(true);
    gl.enable(gl.DEPTH_TEST);
  }
}
