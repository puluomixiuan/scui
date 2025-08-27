import * as THREE from "three";

/**
 * hotspots.js
 * 3D 摄像头热点（可射线命中、会触发 camera-click）
 */

/**
 * 在模型上方创建 3D 摄像头热点
 * @param {import('../../utils/three').Three3D} threeTest
 * @param {THREE.Object3D} model 目标模型
 * @param {string} name 热点对象名
 * @returns {THREE.Object3D}
 */
export const createCameraHotspot = (threeTest, model, name) => {
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const planeSize = Math.max(1.2, Math.min(3, size.y * 0.4));
    const geometry = new THREE.PlaneGeometry(planeSize, planeSize);
    const canvas = document.createElement('canvas');
    canvas.width = 128; canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 128, 128);
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.beginPath(); ctx.arc(64, 64, 58, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#00d4ff';
    ctx.fillRect(34, 50, 60, 36);
    ctx.beginPath(); ctx.moveTo(94, 60); ctx.lineTo(114, 52); ctx.lineTo(114, 84); ctx.lineTo(94, 76); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#0b1a24'; ctx.beginPath(); ctx.arc(64, 68, 12, 0, Math.PI * 2); ctx.fill();
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthTest: false });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name;
    mesh.position.set(center.x, center.y + Math.max(2, size.y * 0.6), center.z);
    mesh.renderOrder = 10;
    mesh.userData.isCameraHotspot = true;
    mesh.userData.modelName = model.name;
    mesh.onBeforeRender = (renderer, scene, camera) => { try { mesh.lookAt(camera.position); } catch (e) { } };
    threeTest.addScene(mesh);
    return mesh;
};

/**
 * 移除 3D 摄像头热点
 * @param {import('../../utils/three').Three3D} threeTest
 * @param {string} hotspotName 热点对象名
 * @returns {boolean}
 */
export const removeCameraHotspot = (threeTest, hotspotName) => {
    const obj = threeTest.scene.getObjectByName(hotspotName);
    if (obj) {
        try { obj.material && obj.material.dispose && obj.material.dispose(); } catch (e) { }
        try { obj.geometry && obj.geometry.dispose && obj.geometry.dispose(); } catch (e) { }
        obj.parent ? obj.parent.remove(obj) : threeTest.scene.remove(obj);
        return true;
    }
    return false;
};


