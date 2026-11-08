/**
 * Kontrol tampilan untuk rekaman layar. Tidak merekam atau mengunggah video.
 * F = fullscreen; H = sembunyikan/tampilkan UI; R = ulangi adegan.
 */
class RecordingControls {
  /**
   * @param {Function} onResize Menghitung ulang ukuran canvas dan framing kamera.
   * @param {Function} onRestart Mengulang waktu adegan ke nol dan memutarnya.
   */
  constructor(onResize, onRestart) {
    this.onResize = onResize;
    this.onRestart = onRestart;
    this.uiHidden = false;
    this.fullscreenButton = document.getElementById('fullscreen');
    this.hideButton = document.getElementById('hide-ui');
    this.subtitleCheckbox = document.getElementById('record-subtitles');
    this.message = document.getElementById('recording-message');

    this.fullscreenButton.onclick = () => this.toggleFullscreen();
    this.hideButton.onclick = () => this.toggleUI();
    this.subtitleCheckbox.onchange = () => this.updateSubtitlePreference();

    document.addEventListener('fullscreenchange', () => {
      this.updateFullscreenButton();
      this.onResize(); // Native Escape juga melewati event ini.
    });

    window.addEventListener('keydown', (event) => {
      const tag = event.target.tagName;
      const editingInput = tag === 'INPUT' &&
        !['checkbox', 'radio', 'range', 'button', 'submit'].includes(event.target.type);
      const editing = editingInput || tag === 'SELECT' || tag === 'TEXTAREA' || event.target.isContentEditable;
      // H/F/R tetap berfungsi setelah checkbox subtitle diklik.
      if (editing || event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;

      if (event.code === 'KeyF') {
        event.preventDefault();
        this.toggleFullscreen();
      } else if (event.code === 'KeyH') {
        event.preventDefault();
        this.toggleUI();
      } else if (event.code === 'KeyR') {
        event.preventDefault();
        this.onRestart();
      }
    });

    const params = new URLSearchParams(location.search);
    if (params.get('subtitles') === '1') this.subtitleCheckbox.checked = true;
    this.updateSubtitlePreference();
    this.updateFullscreenButton();
    if (params.get('clean') === '1') this.setUIHidden(true);
  }

  updateSubtitlePreference() {
    document.body.classList.toggle('keep-subtitles', this.subtitleCheckbox.checked);
  }

  /** @param {boolean} hidden true menyembunyikan semua kontrol, panel, dan subtitle. */
  setUIHidden(hidden) {
    this.uiHidden = Boolean(hidden);
    document.body.classList.toggle('ui-hidden', this.uiHidden);
    this.hideButton.setAttribute('aria-pressed', String(this.uiHidden));

    // Fokus pada tombol yang tersembunyi tidak boleh mengambil tombol Space.
    if (this.uiHidden && document.activeElement?.closest('.recording-ui')) {
      document.activeElement.blur();
    }
    this.onResize();
  }

  toggleUI() {
    this.setUIHidden(!this.uiHidden);
  }

  updateFullscreenButton() {
    const active = Boolean(document.fullscreenElement);
    this.fullscreenButton.textContent = active ? 'Keluar fullscreen' : 'Fullscreen';
    this.fullscreenButton.setAttribute('aria-pressed', String(active));
    this.fullscreenButton.title = 'F: ubah fullscreen. Esc: keluar fullscreen.';
  }

  async toggleFullscreen() {
    this.message.hidden = true;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      } else {
        throw new Error('Fullscreen tidak tersedia pada browser ini. Gunakan F11.');
      }
    } catch (error) {
      this.message.textContent = error.message || 'Fullscreen ditolak browser. Coba F11.';
      this.message.hidden = false;
    }
    this.updateFullscreenButton();
    this.onResize();
  }
}
