import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const canvas = document.querySelector("#planet_canvas");
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
const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
camera.position.set(0, 0.15, 6.4);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 4.2;
controls.maxDistance = 8;

scene.add(new THREE.AmbientLight(0xffffff, 0.85));
const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
keyLight.position.set(4, 4, 5);
scene.add(keyLight);
const fillLight = new THREE.DirectionalLight(0x89a8ff, 0.7);
fillLight.position.set(-4, 1, 2);
scene.add(fillLight);

const gltfLoader = new GLTFLoader();
const textureLoader = new THREE.TextureLoader();
textureLoader.setCrossOrigin("anonymous");

let currentModel = null;
let loadToken = 0;

function dispose(object) {
  if (!object) return;
  scene.remove(object);
  object.traverse((item) => {
    if (item.geometry) item.geometry.dispose();
    if (!item.material) return;
    const materials = Array.isArray(item.material) ? item.material : [item.material];
    materials.forEach((material) => material.dispose());
  });
}

function getTextureKey(data) {
  return data.model.replace("models/", "").replace(".glb", "");
}

function applyRealTexture(object, planetKey) {
  const url = textureUrls[planetKey];
  if (!url) return;

  const texture = textureLoader.load(url);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;

  object.traverse((item) => {
    if (!item.isMesh) return;
    if (planetKey === "saturn" && item.name.toLowerCase().includes("ring")) return;

    // У старых GLB были некорректные UV-координаты на шве сферы.
    // Сохраняем импорт GLB, но заменяем только сферическую сетку на гладкую
    // Three.js SphereGeometry с правильной UV-развёрткой — так исчезают полосы.
    if (item.geometry) item.geometry.dispose();
    item.geometry = new THREE.SphereGeometry(1, 128, 64);

    if (item.material) {
      const oldMaterials = Array.isArray(item.material) ? item.material : [item.material];
      oldMaterials.forEach((material) => material.dispose());
    }

    item.material = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: planetKey === "earth" ? 0.72 : 0.88,
      metalness: 0,
    });
  });
}

function styleSaturnRings(object) {
  object.traverse((item) => {
    if (!item.isMesh || !item.name.toLowerCase().includes("ring")) return;
    item.material = new THREE.MeshStandardMaterial({
      color: 0xc9b88f,
      transparent: true,
      opacity: 0.72,
      roughness: 0.9,
      metalness: 0,
      side: THREE.DoubleSide,
    });
  });
}

function loadPlanet(index) {
  const data = window.planetData[index];
  if (!data) return;
  const token = ++loadToken;
  const planetKey = getTextureKey(data);

  gltfLoader.load(assetBase + data.model, (gltf) => {
    if (token !== loadToken) return;
    dispose(currentModel);
    currentModel = gltf.scene;
    currentModel.scale.setScalar(data.scale);
    currentModel.rotation.z = planetKey === "saturn" ? -0.15 : -0.08;
    applyRealTexture(currentModel, planetKey);
    if (planetKey === "saturn") styleSaturnRings(currentModel);
    scene.add(currentModel);
  });
}

window.addEventListener("planetchange", (event) => loadPlanet(event.detail.index));

function resize() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (!width || !height) return;
  if (
    canvas.width !== Math.floor(width * renderer.getPixelRatio()) ||
    canvas.height !== Math.floor(height * renderer.getPixelRatio())
  ) {
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
}

function animate() {
  requestAnimationFrame(animate);
  resize();
  if (currentModel) currentModel.rotation.y += 0.0018;
  controls.update();
  renderer.render(scene, camera);
}

loadPlanet(window.currentPlanetIndex ?? 0);
animate();
