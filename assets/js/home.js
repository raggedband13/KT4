import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const canvas = document.querySelector("#home_canvas");
const assetBase = window.SPACE_ASSET_BASE || "./assets/";

const textureUrls = {
  mercury: "https://raw.githubusercontent.com/q-jade/solar-system/main/src/textures/2k_mercury.jpg",
  venus:
    "https://raw.githubusercontent.com/q-jade/solar-system/main/src/textures/2k_venus_surface.jpg",
  earth:
    "https://raw.githubusercontent.com/q-jade/solar-system/main/src/textures/2k_earth_daymap.jpg",
  mars: "https://raw.githubusercontent.com/q-jade/solar-system/main/src/textures/2k_mars.jpg",
  jupiter: "https://raw.githubusercontent.com/q-jade/solar-system/main/src/textures/2k_jupiter.jpg",
  saturn: "https://raw.githubusercontent.com/q-jade/solar-system/main/src/textures/2k_saturn.jpg",
  uranus: "https://raw.githubusercontent.com/q-jade/solar-system/main/src/textures/2k_uranus.jpg",
  neptune: "https://raw.githubusercontent.com/q-jade/solar-system/main/src/textures/2k_neptune.jpg",
};

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
camera.position.set(0, 3.8, 19);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.98;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 12;
controls.maxDistance = 26;
controls.target.set(0.3, 0, 0);

scene.add(new THREE.AmbientLight(0xffffff, 0.95));
const key = new THREE.DirectionalLight(0xffffff, 2.8);
key.position.set(-5, 7, 9);
scene.add(key);
const rim = new THREE.DirectionalLight(0x6e8fff, 0.55);
rim.position.set(8, 1, -5);
scene.add(rim);

const gltfLoader = new GLTFLoader();
const textureLoader = new THREE.TextureLoader();
textureLoader.setCrossOrigin("anonymous");
const system = new THREE.Group();
system.rotation.x = -0.1;
system.rotation.y = -0.06;
scene.add(system);

const planets = [
  { name: "mercury", x: -7.0, y: 0.22, z: 0.6, size: 0.34 },
  { name: "venus", x: -5.55, y: -0.18, z: -0.2, size: 0.5 },
  { name: "earth", x: -4.0, y: 0.16, z: 0.2, size: 0.56 },
  { name: "mars", x: -2.55, y: -0.14, z: -0.15, size: 0.4 },
  { name: "jupiter", x: 0.15, y: 0.12, z: 0.15, size: 1.16 },
  { name: "saturn", x: 3.15, y: -0.08, z: -0.2, size: 0.95 },
  { name: "uranus", x: 5.65, y: 0.13, z: 0.18, size: 0.66 },
  { name: "neptune", x: 7.65, y: -0.1, z: -0.15, size: 0.65 },
];

const loaded = [];

function applyTexture(object, planetKey) {
  const texture = textureLoader.load(textureUrls[planetKey]);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;

  object.traverse((item) => {
    if (!item.isMesh) return;
    if (planetKey === "saturn" && item.name.toLowerCase().includes("ring")) {
      item.material = new THREE.MeshStandardMaterial({
        color: 0xc9b88f,
        transparent: true,
        opacity: 0.68,
        roughness: 0.9,
        side: THREE.DoubleSide,
      });
      return;
    }

    if (item.geometry) item.geometry.dispose();
    item.geometry = new THREE.SphereGeometry(1, 96, 48);

    if (item.material) {
      const oldMaterials = Array.isArray(item.material) ? item.material : [item.material];
      oldMaterials.forEach((material) => material.dispose());
    }

    item.material = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.86, metalness: 0 });
  });
}

planets.forEach((planet, index) => {
  gltfLoader.load(assetBase + "models/" + planet.name + ".glb", (gltf) => {
    const obj = gltf.scene;
    obj.position.set(planet.x, planet.y, planet.z);
    obj.scale.setScalar(planet.size);
    obj.rotation.z = planet.name === "saturn" ? -0.15 : -0.05;
    obj.userData.speed = 0.0011 + index * 0.00005;
    applyTexture(obj, planet.name);
    system.add(obj);
    loaded.push(obj);
  });
});

function resize() {
  const w = canvas.clientWidth,
    h = canvas.clientHeight;
  if (!w || !h) return;
  if (
    canvas.width !== Math.floor(w * renderer.getPixelRatio()) ||
    canvas.height !== Math.floor(h * renderer.getPixelRatio())
  ) {
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
}

function animate() {
  requestAnimationFrame(animate);
  resize();
  loaded.forEach((p) => (p.rotation.y += p.userData.speed));
  controls.update();
  renderer.render(scene, camera);
}
animate();
