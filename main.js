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

  function rubric() {
    const key = $('rubric-character').value,
      r = CharacterRubric[key],
      box = $('rubric-content');
    box.replaceChildren();
    for (const [label, text] of [
        ['3D Curve', r.curve],
        ['Object 1', r.object1],
        ['Object 2', r.object2],
        ['Object 3 · Quadric', r.object3],
      ['Aesthetic', r.aesthetic]
      ]) {
      const p = document.createElement('p'),
        strong = document.createElement('strong');
      strong.textContent = label + ': ';
      p.append(strong, text);
      box.append(p);
    }
    const hint = document.createElement('small');
    hint.textContent = 'Pilih contoh untuk memutar gerak karakter ini.';
    box.append(hint);
    for (const [label, t, description] of r.examples) {
      const b = document.createElement('button');
      b.textContent = label + ' · ' + t + ' s';
      b.title = description;
      b.onclick = () => {
        time = t;
        playing = true;
        solo = key;
        selectView(key);
        updatePlay();
      };
      box.append(b);
    }
    const p = document.createElement('p');
    p.textContent = r.hierarchy;
    box.append(p);
  }

  function restart() {
    time = 0;
    playing = true;
    solo = null;
    selectView('cinematic');
    $('rubric-panel').hidden = true;
    $('rubric-toggle').setAttribute('aria-expanded', 'false');
    updatePlay();
  }
  play.onclick = toggle;
  $('restart').onclick = restart;
  const recording = new RecordingControls(resize, restart);
  $('rubric-toggle').onclick = () => {
    const panel = $('rubric-panel');
    panel.hidden = !panel.hidden;
    $('rubric-toggle').setAttribute('aria-expanded', String(!panel.hidden));
    if (panel.hidden) {
      solo = null;
      selectView('cinematic');
    } else {
      playing = false;
      solo = $('rubric-character').value;
      selectView(solo);
      updatePlay();
    }
    dirty = true;
  };
  $('rubric-character').onchange = () => {
    rubric();
    solo = $('rubric-character').value;
    selectView(solo);
  };
  addEventListener('resize', resize);
  resize();
  selectView('wide');
  rubric();
  addEventListener('keydown', e => {
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
      solo = CharacterRubric[v] ? v : null;
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
  const params = new URLSearchParams(location.search),
    actor = params.get('actor');
  if (actor && CharacterRubric[actor]) {
    $('rubric-character').value = actor;
    rubric();
    solo = actor;
    selectView(actor);
    $('rubric-panel').hidden = false;
    $('rubric-toggle').setAttribute('aria-expanded', 'true');
    playing = true;
  }
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
