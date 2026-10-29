import * as THREE from 'three';

export class ThreeScene {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.time = 0;
    this.mouse = { x: 0, y: 0 };
    this.targetMouse = { x: 0, y: 0 };
    this.pins = [];
    this.animFrame = null;
    this.init();
  }

  init() {
    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x0E0B08, 1);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;

    // Scene & Camera
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(50, this.width / this.height, 0.1, 1000);
    this.camera.position.set(0, 0, 5);

    // Fog
    this.scene.fog = new THREE.FogExp2(0x0E0B08, 0.06);

    this.buildParticleField();
    this.buildAmbientGlow();
    this.bindEvents();
    this.animate();
  }

  buildTopoMap() {
    const group = new THREE.Group();

    // Topographic contour lines using parametric shape approximating Tamil Nadu
    const topoColors = [0xD4AF37, 0xC49A2A, 0x9A7E28, 0x7A6020, 0x5A4A18];
    const contourCount = 22;

    for (let i = 0; i < contourCount; i++) {
      const t = i / (contourCount - 1);
      const scale = 1.4 - t * 0.9;
      const yOffset = -1.8 + t * 3.6; // distribute vertically
      const colorIdx = Math.floor(t * (topoColors.length - 1));
      const alpha = 0.08 + t * 0.18;

      // Tamil Nadu-ish silhouette: wider at top, tapers at south
      // Using a custom curve with waypoints
      const points = this.generateTopoContour(scale, t);
      if (points.length < 3) continue;

      const curve = new THREE.CatmullRomCurve3(points, true);
      const tubePoints = curve.getPoints(120);
      const geo = new THREE.BufferGeometry().setFromPoints(tubePoints);
      const mat = new THREE.LineBasicMaterial({
        color: topoColors[colorIdx],
        transparent: true,
        opacity: alpha,
      });
      const line = new THREE.Line(geo, mat);
      line.position.y = yOffset * 0.08;
      group.add(line);
    }

    // Border outline (bright golden)
    const borderPoints = this.generateTNBorder(1.4);
    if (borderPoints.length >= 3) {
      const borderCurve = new THREE.CatmullRomCurve3(borderPoints, true);
      const bPts = borderCurve.getPoints(200);
      const borderGeo = new THREE.BufferGeometry().setFromPoints(bPts);
      const borderMat = new THREE.LineBasicMaterial({
        color: 0xD4AF37,
        transparent: true,
        opacity: 0.55,
      });
      const border = new THREE.Line(borderGeo, borderMat);
      group.add(border);
    }

    // Glowing mesh plane below
    const planeGeo = new THREE.PlaneGeometry(6, 8, 40, 50);
    const planeMat = new THREE.MeshBasicMaterial({
      color: 0xD4AF37,
      transparent: true,
      opacity: 0.018,
      wireframe: true,
    });
    const plane = new THREE.Mesh(planeGeo, planeMat);
    plane.rotation.x = -Math.PI / 5;
    plane.position.y = -2;
    plane.position.z = -1;
    group.add(plane);

    this.topoGroup = group;
    this.scene.add(group);
  }

  generateTopoContour(scale, t) {
    // Approximate Tamil Nadu shape at a given scale level
    // Tamil Nadu: roughly triangular, widest ~11-13°N, tapers to tip at 8°N
    const narrowFactor = 0.5 + t * 0.5; // narrows at bottom
    const pts = [
      new THREE.Vector3(-1.1 * scale * narrowFactor, 1.5 * scale, 0),
      new THREE.Vector3(-0.3 * scale, 1.7 * scale, 0),
      new THREE.Vector3(0.5 * scale, 1.55 * scale, 0),
      new THREE.Vector3(0.9 * scale * narrowFactor, 1.0 * scale, 0),
      new THREE.Vector3(1.0 * scale * narrowFactor, 0.3 * scale, 0),
      new THREE.Vector3(0.85 * scale * (1 - t * 0.3), -0.5 * scale, 0),
      new THREE.Vector3(0.5 * scale * (1 - t * 0.5), -1.3 * scale, 0),
      new THREE.Vector3(0.1 * scale, -1.8 * scale, 0),
      new THREE.Vector3(-0.2 * scale, -1.85 * scale, 0),
      new THREE.Vector3(-0.5 * scale * (1 - t * 0.4), -1.5 * scale, 0),
      new THREE.Vector3(-0.8 * scale * (1 - t * 0.3), -0.8 * scale, 0),
      new THREE.Vector3(-1.0 * scale * narrowFactor, 0.0 * scale, 0),
      new THREE.Vector3(-1.15 * scale * narrowFactor, 0.7 * scale, 0),
    ];
    return pts;
  }

  generateTNBorder(scale) {
    return [
      new THREE.Vector3(-1.1 * scale, 1.5 * scale, 0),
      new THREE.Vector3(-0.3 * scale, 1.72 * scale, 0),
      new THREE.Vector3(0.5 * scale, 1.55 * scale, 0),
      new THREE.Vector3(0.95 * scale, 1.0 * scale, 0),
      new THREE.Vector3(1.05 * scale, 0.3 * scale, 0),
      new THREE.Vector3(0.88 * scale, -0.5 * scale, 0),
      new THREE.Vector3(0.55 * scale, -1.3 * scale, 0),
      new THREE.Vector3(0.12 * scale, -1.85 * scale, 0),
      new THREE.Vector3(-0.22 * scale, -1.9 * scale, 0),
      new THREE.Vector3(-0.52 * scale, -1.55 * scale, 0),
      new THREE.Vector3(-0.82 * scale, -0.8 * scale, 0),
      new THREE.Vector3(-1.04 * scale, 0.0, 0),
      new THREE.Vector3(-1.18 * scale, 0.75 * scale, 0),
    ];
  }

  buildParticleField() {
    const count = 800;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const opacities = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 12;
      positions[i3 + 1] = (Math.random() - 0.5) * 14;
      positions[i3 + 2] = (Math.random() - 0.5) * 6 - 2;
      sizes[i] = Math.random() * 2 + 0.5;
      opacities[i] = Math.random() * 0.5 + 0.1;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.PointsMaterial({
      color: 0xD4AF37,
      size: 0.02,
      transparent: true,
      opacity: 0.3,
      sizeAttenuation: true,
    });

    this.particles = new THREE.Points(geo, mat);
    this.scene.add(this.particles);
    this._particlePositions = positions;
    this._particleCount = count;
  }

  buildAmbientGlow() {
    // Centered radial glow using a large transparent sphere
    const geoGlow = new THREE.SphereGeometry(2, 32, 32);
    const matGlow = new THREE.MeshBasicMaterial({
      color: 0xD4AF37,
      transparent: true,
      opacity: 0.03,
      side: THREE.BackSide,
    });
    const glowMesh = new THREE.Mesh(geoGlow, matGlow);
    this.scene.add(glowMesh);

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xD4AF37, 0.1);
    this.scene.add(ambientLight);
  }

  // Map lat/lng -> 3D position on the topo map
  latLngToScene(x, y) {
    // x and y are normalized [0,1] across the map bounding box
    // Map: x [0.1, 0.5], y [0.08, 0.9] roughly
    const sceneX = (x - 0.28) * 7.5; // center at ~lng 78.5
    const sceneY = (0.5 - y) * 7.5;  // invert y
    return new THREE.Vector3(sceneX, sceneY, 0.05);
  }

  addDistrictPins() {
    this.pins = [];
  }

  bindEvents() {
    window.addEventListener('resize', this.onResize.bind(this));
    window.addEventListener('mousemove', (e) => {
      this.targetMouse.x = (e.clientX / this.width - 0.5) * 2;
      this.targetMouse.y = -(e.clientY / this.height - 0.5) * 2;
    });
  }

  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }

  animate() {
    this.animFrame = requestAnimationFrame(this.animate.bind(this));
    this.time += 0.008;

    // Smooth mouse parallax
    this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.04;
    this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.04;

    // Topo group subtle movement
    if (this.topoGroup) {
      this.topoGroup.rotation.z = Math.sin(this.time * 0.2) * 0.015;
      this.topoGroup.position.x = this.mouse.x * 0.08;
      this.topoGroup.position.y = this.mouse.y * 0.06;
    }

    // Animate particles
    if (this.particles) {
      this.particles.rotation.z = this.time * 0.005;
      const pos = this.particles.geometry.attributes.position.array;
      for (let i = 0; i < this._particleCount; i++) {
        const i3 = i * 3;
        pos[i3 + 1] += 0.003;
        if (pos[i3 + 1] > 7) pos[i3 + 1] = -7;
      }
      this.particles.geometry.attributes.position.needsUpdate = true;
      this.particles.material.opacity = 0.2 + Math.sin(this.time * 0.5) * 0.08;
    }

    // Animate active pin rings
    this.pins.forEach((pin, idx) => {
      if (pin._ring && pin._ringMat) {
        const phase = this.time * 1.5 + idx * 0.8;
        pin._ringMat.opacity = 0.15 + Math.sin(phase) * 0.15;
        const scale = 1 + Math.sin(phase) * 0.2;
        pin._ring.scale.set(scale, scale, 1);
      }
    });

    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
    window.removeEventListener('resize', this.onResize.bind(this));
    this.renderer.dispose();
  }
}
