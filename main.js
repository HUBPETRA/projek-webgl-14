function main() {
  const $ = id => document.getElementById(id),
    canvas = $('mycanvas'),
    play = $('play');

  function fail(message) {
    $('error').textContent = message;
    $('error').hidden = false;
  }
  const gl = canvas.getContext('webgl', {
    antialias: true,
    alpha: false,
    preserveDrawingBuffer: true
  });
  if (!gl) {
    fail('WebGL tidak tersedia. Aktifkan akselerasi grafis browser.');
    return;
  }
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  // Warna cadangan; Sky.js menggambar langit dan tanah luar pada frame sebenarnya.
  gl.clearColor(0.82, 0.88, 0.84, 1);
  let scene;
  try {
    const program = createShaderProgram(gl);
    if (!program) throw Error('Shader gagal dikompilasi.');
    scene = new SceneDirector(gl, program);
  } catch (e) {
    fail(e.message);
    console.error(e);
    return;
  }
  const camera = new Camera(canvas),
    cameraDirector = new CinematicCamera(scene, camera);
  let time = 0,
    playing = false,
    previous = null,
    mode = 'cinematic',
    solo = null,
    dirty = true;

  function updatePlay() {
    play.textContent = playing ? 'Pause' : 'Play';
    play.setAttribute('aria-pressed', String(playing));
  }

  function toggle() {
    if (time >= scene.duration) time = 0;
    playing = !playing;
    dirty = true;
    updatePlay();
  }

  function selectView(view) {
    mode = view === 'wide' ? 'cinematic' : view;
    dirty = true;
  }

  function resize() {
    const d = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(innerWidth * d);
    canvas.height = Math.round(innerHeight * d);
    gl.viewport(0, 0, canvas.width, canvas.height);
    dirty = true;
  }

  function restart() {
    time = 0;
    playing = true;
    solo = null;
    selectView('cinematic');    updatePlay();
  }
  play.onclick = toggle;
  $('restart').onclick = restart;
  const recording = new RecordingControls(resize, restart);
  addEventListener('resize', resize);
  resize();
  selectView('wide');  addEventListener('keydown', e => {
    if (!/INPUT|SELECT|BUTTON/.test(e.target.tagName) && e.code === 'Space') {
      e.preventDefault();
      toggle();
    }
  });
  canvas.addEventListener('webglcontextlost', e => {
    e.preventDefault();
    playing = false;
    updatePlay();
    fail('Konteks WebGL terputus. Muat ulang halaman.');
  });

  function render() {
    scene.update(time);
    cameraDirector.update(time, canvas.width / canvas.height, solo);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    scene.draw(camera.getViewMatrix(), Mat4.perspective(Math.PI / 3.2, canvas.width / canvas.height,
      0.1, 150), {
      solo
    });
    const line = DuelAnimation.dialogue(time);
    $('speaker').textContent = line.speaker;
    $('dialogue').textContent = line.text;
    dirty = false;
  }
  window.demo = {
    scene,
    camera,
    cameraDirector,
    recording,
    seek(t) {
      time = Math.max(0, Math.min(scene.duration, Number(t) || 0));
      playing = false;
      updatePlay();
      render();
    },
    view(v) {
      solo = Object.prototype.hasOwnProperty.call(cameraDirector.actors, v) ? v : null;
      selectView(v);
    },
    get mode() {
      return mode;
    },
    get shot() {
      return cameraDirector.activeShot;
    },
    get solo() {
      return solo;
    },
    get time() {
      return time;
    },
    get playing() {
      return playing;
    }
  };
  const params = new URLSearchParams(location.search);
  if (params.has('t')) time = Math.max(0, Math.min(scene.duration, Number(params.get('t')) || 0));
  updatePlay();

  function frame(now) {
    const dt = previous === null ? 0 : Math.min((now - previous) / 1000, 0.1);
    previous = now;
    if (playing) {
      time = Math.min(scene.duration, time + dt);
      dirty = true;
      if (time >= scene.duration) {
        playing = false;
        updatePlay();
      }
    }
    if (dirty) render();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
addEventListener('load', main);
