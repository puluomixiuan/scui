import * as THREE from "three";

/**
 * workshop.js
 * 厂房相关：玻璃识别与透明度控制、室内灯光环境
 */

/**
 * 判断材质名是否为玻璃相关
 * @param {string} name
 * @returns {boolean}
 */
export function isGlassName(name) {
    if (!name) return false;
    return /glass|window|Mat3d66-9137221-115-23866|玻璃|窗/i.test(name);
}

/**
 * 批量设置材质透明度（自动开启 transparent / 双面 / 关闭深度写入）
 * @param {THREE.Material|THREE.Material[]} material
 * @param {number} opacity 0~1
 */
export function setOpacityForMaterial(material, opacity) {
    if (!material) return;
    const applyOne = (m) => {
        if (!m) return;
        m.transparent = true;
        m.opacity = opacity;
        m.depthWrite = false;
        m.side = THREE.DoubleSide;
        m.needsUpdate = true;
    };
    if (Array.isArray(material)) {
        material.forEach(applyOne);
    } else {
        applyOne(material);
    }
}

/**
 * 遍历模型树，为疑似玻璃的网格设置统一透明度
 * @param {THREE.Object3D} root 厂房根对象
 * @param {number} opacity 透明度 0~1
 */
export function applyWorkshopGlassOpacity(root, opacity) {
    if (!root) return;
    root.traverse((child) => {
        if (child && child.isMesh && child.material) {
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            const looksLikeGlass = mats.some((m) => {
                if (!m) return false;
                if (isGlassName(m.name)) return true;
                return (m.transparent === true) || (typeof m.opacity === 'number' && m.opacity < 1.0) || (typeof m.roughness === 'number' && m.roughness < 0.15);
            });
            if (looksLikeGlass) {
                setOpacityForMaterial(child.material, opacity);
            }
        }
    });
}

/**
 * 创建厂房室内灯光组（多点光 + 环境光）
 * @returns {THREE.Group}
 */
export const createWorkshopLights = () => {
    const group = new THREE.Group();
    group.name = "厂房室内灯光";
    const lights = [
        { color: 0xe6f3ff, intensity: 8.0, distance: 60, decay: 0.5, position: { x: 50, y: 15, z: 0 } },
        { color: 0xccf2ff, intensity: 6.0, distance: 50, decay: 0.5, position: { x: 35, y: 12, z: 0 } },
        { color: 0xccf2ff, intensity: 6.0, distance: 50, decay: 0.5, position: { x: 65, y: 12, z: 0 } },
        { color: 0xb3e6ff, intensity: 7.0, distance: 45, decay: 0.5, position: { x: 50, y: 8, z: 15 } },
        { color: 0xb3e6ff, intensity: 7.0, distance: 45, decay: 0.5, position: { x: 50, y: 8, z: -15 } },
    ];
    lights.forEach((cfg, idx) => {
        const pointLight = new THREE.PointLight(cfg.color, cfg.intensity, cfg.distance, cfg.decay);
        pointLight.position.set(cfg.position.x, cfg.position.y, cfg.position.z);
        pointLight.name = `厂房灯${idx + 1}`;
        pointLight.castShadow = false;
        pointLight.intensity = cfg.intensity;
        pointLight.distance = cfg.distance;
        pointLight.decay = cfg.decay;
        pointLight.volumetric = true;
        group.add(pointLight);
    });
    const ambient = new THREE.AmbientLight(0x1a2a3a, 0.8);
    ambient.position.set(50, 10, 0);
    ambient.name = "厂房环境光";
    group.add(ambient);
    return group;
};


