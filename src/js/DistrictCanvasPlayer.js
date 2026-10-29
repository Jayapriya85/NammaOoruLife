import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export class DistrictCanvasPlayer {
  constructor(options = {}) {
    this.container = document.getElementById('district-walkthrough');
    this.stageWrapper = document.getElementById('dw-stage-wrapper');
    this.scrollTrack = document.getElementById('dw-scroll-track');
    this.canvas = document.getElementById('dw-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;

    this.typographySafezone = document.getElementById('dw-typography-safezone');
    this.stopsList = document.getElementById('dw-stops-list');
    this.progressBar = document.getElementById('dw-progress-bar');
    this.portalBtn = document.getElementById('dw-portal-btn');
    this.portalTargetName = document.getElementById('dw-portal-target-name');
    this.portalContainer = document.getElementById('dw-portal-container');
    this.backBtn = document.getElementById('dw-btn-back');

    this.mainEl = document.querySelector('main');
    this.hudEl = document.getElementById('hud');
    this.footerEl = document.getElementById('site-footer');

    this.onCloseCallback = options.onClose || null;
    this.onSwitchDistrictCallback = options.onSwitchDistrict || null;
    this.lenis = options.lenis || null;

    this.currentDistrict = null;
    this.allActiveDistricts = options.activeDistricts || [];
    this.progress = 0;
    this.currentStopIndex = 0;
    this.isOpen = false;
    this.previousScrollY = 0;

    // Frame sequence cache
    this.totalFrames = 50;
    this.frames = [];
    this.loadedFramesCount = 0;
    this.currentFrameIndex = -1;

    // ScrollTrigger instance
    this.scrollTrigger = null;

    this.initCanvasSize();
    this.bindDOMEvents();
    window.addEventListener('resize', this.onResize.bind(this));
  }

  initCanvasSize() {
    if (!this.canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    if (this.ctx) {
      this.ctx.imageSmoothingEnabled = true;
      this.ctx.imageSmoothingQuality = 'high';
    }
  }

  onResize() {
    this.initCanvasSize();
    if (this.isOpen && this.currentFrameIndex >= 0) {
      this.drawFrame(this.currentFrameIndex);
    }
  }

  bindDOMEvents() {
    if (this.backBtn) {
      this.backBtn.addEventListener('click', () => this.close());
    }

    if (this.portalBtn) {
      this.portalBtn.addEventListener('click', () => {
        const next = this.getNextDistrict();
        if (next) {
          this.switchDistrict(next);
        }
      });
    }
  }

  getNextDistrict() {
    if (!this.currentDistrict || !this.allActiveDistricts.length) return null;
    const currentIndex = this.allActiveDistricts.findIndex((d) => d.id === this.currentDistrict.id);
    const nextIndex = (currentIndex + 1) % this.allActiveDistricts.length;
    return this.allActiveDistricts[nextIndex];
  }

  preloadFrames(districtId, onFirstFrameReady) {
    this.frames = new Array(this.totalFrames);
    this.loadedFramesCount = 0;
    this.currentFrameIndex = -1;

    // Create / reset loading indicator line
    let loaderBar = document.getElementById('dw-canvas-loader');
    if (!loaderBar) {
      loaderBar = document.createElement('div');
      loaderBar.id = 'dw-canvas-loader';
      loaderBar.className = 'dw-canvas-loader';
      this.stageWrapper.appendChild(loaderBar);
    }
    loaderBar.style.width = '0%';
    loaderBar.style.opacity = '1';

    // Priority Tier 1: Eager load frames 1, 15, 30, 50
    const priorityIndices = [1, 15, 30, 50];
    const loadFrame = (frameNum) => {
      const img = new Image();
      const idx = frameNum - 1;
      const padNum = String(frameNum).padStart(3, '0');
      img.src = `/assets/${districtId}/ezgif-frame-${padNum}.jpg`;

      img.onload = () => {
        this.frames[idx] = img;
        this.loadedFramesCount++;

        const percent = (this.loadedFramesCount / this.totalFrames) * 100;
        if (loaderBar) loaderBar.style.width = `${percent}%`;

        // If first frame is ready, paint it immediately
        if (frameNum === 1 && onFirstFrameReady) {
          onFirstFrameReady();
        }

        // Fade out loader once almost all frames are cached
        if (this.loadedFramesCount >= this.totalFrames - 2 && loaderBar) {
          gsap.to(loaderBar, { opacity: 0, duration: 0.5 });
        }
      };

      img.onerror = () => {
        // Fallback placeholder
        this.loadedFramesCount++;
      };
    };

    // Load priority frames first
    priorityIndices.forEach(loadFrame);

    // Stream remaining frames asynchronously
    for (let i = 1; i <= this.totalFrames; i++) {
      if (!priorityIndices.includes(i)) {
        loadFrame(i);
      }
    }
  }

  drawFrame(index) {
    if (!this.ctx || !this.canvas) return;

    // Find the closest available frame
    let img = this.frames[index];
    if (!img) {
      // Find nearest loaded frame
      for (let offset = 1; offset < this.totalFrames; offset++) {
        if (this.frames[index - offset]) { img = this.frames[index - offset]; break; }
        if (this.frames[index + offset]) { img = this.frames[index + offset]; break; }
      }
    }

    if (!img || !img.complete || img.naturalWidth === 0) return;

    this.currentFrameIndex = index;
    const canvasW = this.canvas.width;
    const canvasH = this.canvas.height;
    const imgW = img.naturalWidth;
    const imgH = img.naturalHeight;

    // High-performance Aspect Ratio "Cover" Math
    const scale = Math.max(canvasW / imgW, canvasH / imgH);
    const drawW = imgW * scale;
    const drawH = imgH * scale;
    const drawX = (canvasW - drawW) / 2;
    const drawY = (canvasH - drawH) / 2;

    this.ctx.clearRect(0, 0, canvasW, canvasH);
    this.ctx.drawImage(img, drawX, drawY, drawW, drawH);

    // Warm Antique Temple Gold Color Grading Tint
    this.ctx.save();
    this.ctx.globalCompositeOperation = 'soft-light';
    this.ctx.fillStyle = 'rgba(212, 175, 55, 0.12)';
    this.ctx.fillRect(0, 0, canvasW, canvasH);

    // Deep Obsidian Bronze Perimeter Vignette
    const radGrad = this.ctx.createRadialGradient(
      canvasW * 0.5, canvasH * 0.5, canvasH * 0.35,
      canvasW * 0.5, canvasH * 0.5, canvasW * 0.8
    );
    radGrad.addColorStop(0, 'rgba(14, 11, 8, 0)');
    radGrad.addColorStop(0.7, 'rgba(14, 11, 8, 0.35)');
    radGrad.addColorStop(1, 'rgba(14, 11, 8, 0.85)');

    this.ctx.globalCompositeOperation = 'multiply';
    this.ctx.fillStyle = radGrad;
    this.ctx.fillRect(0, 0, canvasW, canvasH);
    this.ctx.restore();
  }

  open(district) {
    this.currentDistrict = district;
    this.isOpen = true;
    this.progress = 0;
    this.previousScrollY = window.scrollY;

    // Populate HUD
    document.getElementById('dw-info-name').textContent = district.name.toUpperCase();
    document.getElementById('dw-info-tamil').textContent = district.tamil;
    document.getElementById('dw-info-coords').textContent =
      `${district.coords.lat.toFixed(4)}° N, ${district.coords.lng.toFixed(4)}° E`;

    // Next district target
    const next = this.getNextDistrict();
    if (next && this.portalTargetName) {
      this.portalTargetName.textContent = `${next.name.toUpperCase()} →`;
    }

    // Build Storytelling Typography blocks
    this.buildTypographyBlocks(district);

    // Build Vertical Progress Waypoint list
    this.buildProgressNav(district);

    // Reset container opacity & activate
    this.container.style.opacity = '0';
    this.container.classList.add('active');
    this.container.setAttribute('aria-hidden', 'false');

    // Scroll to top of walkthrough
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (this.lenis) {
      this.lenis.scrollTo(0, { immediate: true });
    }

    // Hide background landing sections for pure GPU performance
    if (this.mainEl) this.mainEl.style.display = 'none';
    if (this.hudEl) this.hudEl.style.display = 'none';
    if (this.footerEl) this.footerEl.style.display = 'none';

    // Preload 50 frame image sequence
    this.preloadFrames(district.id, () => {
      this.drawFrame(0);
    });

    // Seamless fade-in transition
    gsap.to(this.container, {
      opacity: 1,
      duration: 0.5,
      ease: 'power2.out',
      onComplete: () => {
        this.initScrollTrigger();
        this.updateProgress(0);
        ScrollTrigger.refresh();
      },
    });

    // Entrance animations
    gsap.fromTo('.dw-hud-top', { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.15, ease: 'power2.out' });
    gsap.fromTo('.dw-progress-nav', { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.8, delay: 0.25, ease: 'power2.out' });
    gsap.fromTo('.dw-architectural-frame', { opacity: 0, scale: 1.05 }, { opacity: 1, scale: 1, duration: 1.0, ease: 'power2.out' });
  }

  switchDistrict(nextDistrict) {
    gsap.to(['.dw-typography-safezone', '.dw-portal-container', '#dw-canvas'], {
      opacity: 0,
      duration: 0.35,
      ease: 'power2.inOut',
      onComplete: () => {
        this.currentDistrict = nextDistrict;
        document.getElementById('dw-info-name').textContent = nextDistrict.name.toUpperCase();
        document.getElementById('dw-info-tamil').textContent = nextDistrict.tamil;
        document.getElementById('dw-info-coords').textContent =
          `${nextDistrict.coords.lat.toFixed(4)}° N, ${nextDistrict.coords.lng.toFixed(4)}° E`;

        const next = this.getNextDistrict();
        if (next && this.portalTargetName) {
          this.portalTargetName.textContent = `${next.name.toUpperCase()} →`;
        }

        this.buildTypographyBlocks(nextDistrict);
        this.buildProgressNav(nextDistrict);

        window.scrollTo({ top: 0, behavior: 'instant' });
        if (this.lenis) {
          this.lenis.scrollTo(0, { immediate: true });
        }

        this.preloadFrames(nextDistrict.id, () => {
          this.drawFrame(0);
        });

        this.initScrollTrigger();
        this.updateProgress(0);
        ScrollTrigger.refresh();

        gsap.to(['.dw-typography-safezone', '#dw-canvas'], { opacity: 1, duration: 0.6, ease: 'power2.out' });
      },
    });
  }

  close() {
    this.isOpen = false;
    if (this.scrollTrigger) {
      this.scrollTrigger.kill();
      this.scrollTrigger = null;
    }

    gsap.to(this.container, {
      opacity: 0,
      duration: 0.45,
      ease: 'power2.inOut',
      onComplete: () => {
        this.container.classList.remove('active');
        this.container.setAttribute('aria-hidden', 'true');
        this.container.style.opacity = '';

        // Restore landing DOM
        if (this.mainEl) this.mainEl.style.display = '';
        if (this.hudEl) this.hudEl.style.display = '';
        if (this.footerEl) this.footerEl.style.display = '';

        window.scrollTo({ top: this.previousScrollY || 0, behavior: 'instant' });
        if (this.lenis) {
          this.lenis.scrollTo(this.previousScrollY || 0, { immediate: true });
        }

        ScrollTrigger.refresh();

        if (this.onCloseCallback) {
          this.onCloseCallback();
        }
      },
    });
  }

  initScrollTrigger() {
    if (this.scrollTrigger) {
      this.scrollTrigger.kill();
    }

    // Connect Lenis Smooth Scroll (lerp: 0.07) and GSAP ScrollTrigger (scrub: 1.2) over 500vh scroll track
    this.scrollTrigger = ScrollTrigger.create({
      trigger: this.scrollTrack,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.2,
      onUpdate: (self) => {
        this.updateProgress(self.progress);
      },
    });
  }

  buildTypographyBlocks(district) {
    const places = district.places || [];
    this.typographySafezone.innerHTML = places.map((place, i) => `
      <div class="dw-forma-block" id="dw-forma-${i}" data-index="${i}">
        <p class="dw-forma-kicker">${place.kicker || `0${i + 1} // ${place.type.toUpperCase()}`}</p>
        <h2 class="dw-forma-title">${place.title || place.name.toUpperCase()}</h2>
        <p class="dw-forma-desc">${place.desc || place.name}</p>
      </div>
    `).join('');
  }

  buildProgressNav(district) {
    const places = district.places || [];
    this.stopsList.innerHTML = places.map((place, i) => `
      <button class="dw-stop-dot ${i === 0 ? 'active' : ''}" data-stop="${i}" aria-label="Stop 0${i + 1}: ${place.name}">
        <span class="dw-dot-circle"></span>
        <span class="dw-dot-label">0${i + 1} &nbsp;·&nbsp; ${place.name}</span>
      </button>
    `).join('');

    // Click to jump to stop
    this.stopsList.querySelectorAll('.dw-stop-dot').forEach((btn) => {
      btn.addEventListener('click', () => {
        const stopIndex = parseInt(btn.dataset.stop, 10);
        this.jumpToStop(stopIndex);
      });
    });
  }

  jumpToStop(index) {
    const totalStops = (this.currentDistrict?.places?.length || 4);
    const targetProgress = index / (totalStops - 1);

    if (this.scrollTrigger) {
      const scrollDist = this.scrollTrigger.end - this.scrollTrigger.start;
      const targetScroll = this.scrollTrigger.start + scrollDist * targetProgress;

      if (this.lenis) {
        this.lenis.scrollTo(targetScroll, { duration: 1.2 });
      } else {
        window.scrollTo({ top: targetScroll, behavior: 'smooth' });
      }
    }
  }

  updateProgress(p) {
    this.progress = Math.max(0, Math.min(1, p));

    // Update vertical progress bar fill
    if (this.progressBar) {
      this.progressBar.style.height = `${this.progress * 100}%`;
    }

    // Calculate frame index from progress (0 to 49)
    const frameIndex = Math.min(this.totalFrames - 1, Math.max(0, Math.floor(this.progress * (this.totalFrames - 0.01))));
    if (frameIndex !== this.currentFrameIndex) {
      this.drawFrame(frameIndex);
    }

    // Active stop index
    const totalStops = 4;
    this.currentStopIndex = Math.min(totalStops - 1, Math.round(this.progress * (totalStops - 1)));

    // Update active stop dots
    if (this.stopsList) {
      const dots = this.stopsList.querySelectorAll('.dw-stop-dot');
      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === this.currentStopIndex);
      });
    }

    // Synchronize editorial typography overlays (Monochrome gold kicker, large Cormorant Garamond title, crisp single-line description)
    for (let i = 0; i < totalStops; i++) {
      const el = document.getElementById(`dw-forma-${i}`);
      if (!el) continue;

      const center = i / (totalStops - 1);
      const dist = Math.abs(this.progress - center);
      const radius = 0.18; // smooth overlap window

      let opacity = 0;
      let y = 24;

      if (dist < radius) {
        const t = dist / radius; // 0 at center, 1 at edge
        // Smoothstep interpolation (3t^2 - 2t^3)
        const smooth = 1 - (3 * t * t - 2 * t * t * t);
        opacity = smooth;
        if (this.progress < center) {
          y = 24 * (1 - smooth); // entering from below
        } else {
          y = -20 * (1 - smooth); // exiting upward
        }
      }

      el.style.opacity = opacity.toFixed(3);
      el.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;
      el.style.pointerEvents = opacity > 0.5 ? 'auto' : 'none';
    }

    // Stop 04 Next District Portal
    if (this.portalContainer) {
      const isAtLastStop = this.progress >= 0.88;
      const portalOpacity = isAtLastStop ? Math.min(1, (this.progress - 0.88) / 0.08) : 0;
      this.portalContainer.style.opacity = portalOpacity.toFixed(3);
      this.portalContainer.style.pointerEvents = isAtLastStop ? 'auto' : 'none';
      this.portalContainer.style.transform = `translate3d(0, ${(15 * (1 - portalOpacity)).toFixed(1)}px, 0)`;
    }
  }

  destroy() {
    if (this.scrollTrigger) this.scrollTrigger.kill();
    window.removeEventListener('resize', this.onResize.bind(this));
  }
}
