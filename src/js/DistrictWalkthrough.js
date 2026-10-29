import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export class DistrictWalkthrough {
  constructor(options = {}) {
    this.container = document.getElementById('district-walkthrough');
    this.stageWrapper = document.getElementById('dw-stage-wrapper');
    this.scrollTrack = document.getElementById('dw-scroll-track');
    this.canvas = document.getElementById('dw-canvas');
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
    this.animFrame = null;
    this.previousScrollY = 0;

    // Mouse parallax
    this.mouse = { x: 0, y: 0 };
    this.targetMouse = { x: 0, y: 0 };

    // Three.js instances
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.planes = [];
    this.particles = null;
    this.textureLoader = new THREE.TextureLoader();

    // ScrollTrigger instance
    this.scrollTrigger = null;

    this.initThree();
    this.bindDOMEvents();
  }

  initThree() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x0E0B08, 0.022);

    this.camera = new THREE.PerspectiveCamera(46, this.width / this.height, 0.1, 500);
    this.camera.position.set(0, 0, 5);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x0E0B08, 1);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    // Ambient warm golden light
    const ambient = new THREE.AmbientLight(0xF4EFE6, 1.25);
    this.scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xD4AF37, 0.7);
    dirLight.position.set(2, 5, 4);
    this.scene.add(dirLight);

    this.buildParticleCorridor();

    window.addEventListener('resize', this.onResize.bind(this));
    window.addEventListener('mousemove', (e) => {
      this.targetMouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      this.targetMouse.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    });

    this.renderLoop();
  }

  buildParticleCorridor() {
    const count = 700;
    const pos = new Float32Array(count * 3);
    const scales = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      pos[i3] = (Math.random() - 0.5) * 18;
      pos[i3 + 1] = (Math.random() - 0.5) * 14;
      // Stretched along Z corridor
      pos[i3 + 2] = 10 - Math.random() * 65;
      scales[i] = Math.random() * 2.2 + 0.5;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

    const mat = new THREE.PointsMaterial({
      color: 0xD4AF37,
      size: 0.038,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    this.particles = new THREE.Points(geo, mat);
    this.scene.add(this.particles);
    this._particlePositions = pos;
  }

  buildPlanesForDistrict(district) {
    // Clear old planes
    this.planes.forEach((p) => {
      this.scene.remove(p.mesh);
      p.mesh.geometry.dispose();
      p.mesh.material.dispose();
    });
    this.planes = [];

    const places = district.places || [];
    // Distance spacing between waypoints along Z
    const spacing = 12; // units apart

    places.forEach((place, index) => {
      const zPos = -index * spacing;

      // Frustum plane size at distance from camera (camera at z=5, so dist = 5 - zPos)
      const dist = 5;
      const vFov = (this.camera.fov * Math.PI) / 180;
      const planeH = 2 * Math.tan(vFov / 2) * dist;
      const planeW = planeH * (this.width / this.height);

      const geo = new THREE.PlaneGeometry(planeW * 1.18, planeH * 1.18, 32, 32);

      // Create material with texture
      const mat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: index === 0 ? 1 : 0.85,
        depthWrite: false,
      });

      // Load texture
      this.textureLoader.load(place.thumb, (tex) => {
        tex.generateMipmaps = true;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
        mat.map = tex;
        mat.needsUpdate = true;
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(0, 0, zPos);
      mesh.renderOrder = 20 - index;
      this.scene.add(mesh);

      this.planes.push({
        mesh,
        mat,
        baseZ: zPos,
        initialScale: 1.0,
        index,
        place,
      });
    });
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

  open(district) {
    this.currentDistrict = district;
    this.isOpen = true;
    this.progress = 0;
    this.previousScrollY = window.scrollY;

    document.body.classList.add('walkthrough-mode');

    // Hide background landing sections for pure focus and scroll performance
    if (this.mainEl) this.mainEl.style.display = 'none';
    if (this.hudEl) this.hudEl.style.display = 'none';
    if (this.footerEl) this.footerEl.style.display = 'none';

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

    // Build 3D planes
    this.buildPlanesForDistrict(district);

    // Build FORMA Typography blocks
    this.buildTypographyBlocks(district);

    // Build Vertical Progress list
    this.buildProgressNav(district);

    // Show container
    this.container.classList.add('active');
    this.container.setAttribute('aria-hidden', 'false');

    // Scroll to top of walkthrough
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (this.lenis) {
      this.lenis.scrollTo(0, { immediate: true });
    }

    // Refresh ScrollTrigger and initialize pinning scrub
    setTimeout(() => {
      this.initScrollTrigger();
      this.updateProgress(0);
      ScrollTrigger.refresh();
    }, 50);

    // Fade in intro
    gsap.fromTo('.dw-hud-top', { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 1, delay: 0.1, ease: 'power2.out' });
    gsap.fromTo('.dw-progress-nav', { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 1, delay: 0.2, ease: 'power2.out' });
    gsap.fromTo('.dw-architectural-frame', { opacity: 0 }, { opacity: 1, duration: 1.2, ease: 'power2.out' });
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

        this.buildPlanesForDistrict(nextDistrict);
        this.buildTypographyBlocks(nextDistrict);
        this.buildProgressNav(nextDistrict);

        window.scrollTo({ top: 0, behavior: 'instant' });
        if (this.lenis) {
          this.lenis.scrollTo(0, { immediate: true });
        }

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

    // Fade out animation
    gsap.to(this.container, {
      opacity: 0,
      duration: 0.45,
      ease: 'power2.inOut',
      onComplete: () => {
        this.container.classList.remove('active');
        this.container.setAttribute('aria-hidden', 'true');
        this.container.style.opacity = '';

        document.body.classList.remove('walkthrough-mode');

        // Restore main landing sections
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

    // Pinned 100vw x 100vh stage across 500vh scroll track with scrub: 1.2
    this.scrollTrigger = ScrollTrigger.create({
      trigger: this.scrollTrack,
      start: 'top top',
      end: 'bottom bottom',
      pin: this.stageWrapper,
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

    // Update vertical progress bar height
    if (this.progressBar) {
      this.progressBar.style.height = `${this.progress * 100}%`;
    }

    const totalStops = this.planes.length || 4;
    const segment = 1 / (totalStops - 1);
    const rawStop = this.progress * (totalStops - 1);
    this.currentStopIndex = Math.min(totalStops - 1, Math.round(rawStop));

    // Update active state on stop dots
    if (this.stopsList) {
      const dots = this.stopsList.querySelectorAll('.dw-stop-dot');
      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === this.currentStopIndex);
      });
    }

    // ─── 3D Camera Fly-Through Position & Plane Cross-Fades ───
    const spacing = 12;
    const totalZTravel = (totalStops - 1) * spacing;
    const targetZ = 5 - this.progress * totalZTravel;

    this.camera.position.z = targetZ;

    // For each place, compute distance from camera and zoom/fade
    this.planes.forEach((plane, i) => {
      const stopCenter = i * segment;
      const progressDiff = this.progress - stopCenter;

      if (i === 0 && this.progress <= 0) {
        plane.mesh.scale.set(1.0, 1.0, 1.0);
        plane.mat.opacity = 1.0;
      } else {
        if (progressDiff >= 0) {
          // Camera pushing through this plane: scale 1.0 -> 1.28
          const pushProgress = Math.min(1, progressDiff / segment);
          const scale = 1.0 + pushProgress * 0.28;
          plane.mesh.scale.set(scale, scale, 1.0);
          plane.mat.opacity = Math.max(0, 1.0 - pushProgress * 1.2);
        } else {
          // Approaching this plane: scale from 0.94 -> 1.0
          const approachProgress = Math.min(1, -progressDiff / segment);
          const scale = 1.0 - approachProgress * 0.06;
          plane.mesh.scale.set(scale, scale, 1.0);
          plane.mat.opacity = Math.max(0, 1.0 - approachProgress * 0.35);
        }
      }
    });

    // ─── FORMA Editorial Typography Synchronization ───
    // For each stop waypoint:
    // Fade in + slide up (y: 30 -> 0, opacity: 0 -> 1) when camera settles
    // Stay readable during middle of stop
    // Fade out (y: -20, opacity: 0) before entering next place
    for (let i = 0; i < totalStops; i++) {
      const el = document.getElementById(`dw-forma-${i}`);
      if (!el) continue;

      const center = i * segment;
      const halfWindow = segment * 0.52;
      const start = Math.max(0, center - halfWindow);
      const end = Math.min(1, center + halfWindow);

      let opacity = 0;
      let y = 30;

      if (this.progress >= start && this.progress <= end) {
        const local = (this.progress - start) / (end - start); // 0 to 1
        if (local < 0.25) {
          // Entrance: 0 -> 1, y: 30 -> 0
          const t = local / 0.25;
          opacity = t;
          y = 30 * (1 - t);
        } else if (local > 0.75) {
          // Exit: 1 -> 0, y: 0 -> -20
          const t = (local - 0.75) / 0.25;
          opacity = 1 - t;
          y = -20 * t;
        } else {
          // Middle plateau
          opacity = 1;
          y = 0;
        }
      }

      el.style.opacity = opacity.toFixed(3);
      el.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;
      el.style.pointerEvents = opacity > 0.6 ? 'auto' : 'none';
    }

    // ─── Stop 04 Next District Portal Button ───
    if (this.portalContainer) {
      const isAtLastStop = this.progress >= 0.88;
      const portalOpacity = isAtLastStop ? Math.min(1, (this.progress - 0.88) / 0.08) : 0;
      this.portalContainer.style.opacity = portalOpacity.toFixed(3);
      this.portalContainer.style.pointerEvents = isAtLastStop ? 'auto' : 'none';
      this.portalContainer.style.transform = `translate3d(0, ${(15 * (1 - portalOpacity)).toFixed(1)}px, 0)`;
    }
  }

  renderLoop() {
    this.animFrame = requestAnimationFrame(this.renderLoop.bind(this));

    if (!this.isOpen) return;

    // Smooth mouse parallax
    this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.05;
    this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.05;

    this.camera.position.x = this.mouse.x * 0.35;
    this.camera.position.y = this.mouse.y * 0.25;
    this.camera.rotation.y = -this.mouse.x * 0.02;
    this.camera.rotation.x = this.mouse.y * 0.015;

    // Animate golden dust particles
    if (this.particles && this._particlePositions) {
      const count = 700;
      const pos = this.particles.geometry.attributes.position.array;

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        pos[i3 + 2] += 0.038;
        if (pos[i3 + 2] > this.camera.position.z + 5) {
          pos[i3 + 2] = this.camera.position.z - 50;
        }
      }
      this.particles.geometry.attributes.position.needsUpdate = true;
    }

    this.renderer.render(this.scene, this.camera);
  }

  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);

    const dist = 5;
    const vFov = (this.camera.fov * Math.PI) / 180;
    const planeH = 2 * Math.tan(vFov / 2) * dist;
    const planeW = planeH * (this.width / this.height);

    this.planes.forEach((p) => {
      p.mesh.geometry.dispose();
      p.mesh.geometry = new THREE.PlaneGeometry(planeW * 1.18, planeH * 1.18, 32, 32);
    });
  }

  destroy() {
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
    if (this.scrollTrigger) this.scrollTrigger.kill();
    window.removeEventListener('resize', this.onResize.bind(this));
    this.renderer.dispose();
  }
}
