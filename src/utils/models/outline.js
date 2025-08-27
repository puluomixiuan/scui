import * as THREE from "three";
import { getModel } from "../modelThree.js";
import { modelOutlineShader } from "../shader.js";

/**
 * outline.js
 * 通用模型描边发光：创建/更新/移除/手动创建
 */

/**
 * 创建描边发光包围盒
 * @param {import('../../utils/three').Three3D} threeTest
 * @param {string} modelName 场景中的目标模型名
 * @param {string|null} outlineName 自定义效果名
 */
export const createModelOutline = (threeTest, modelName, outlineName = null) => {
    const model = getModel(modelName, threeTest.scene);
    if (!model) {
        setTimeout(() => createModelOutline(threeTest, modelName, outlineName), 1000);
        return;
    }
    if (!outlineName) outlineName = `${modelName}描边发光`;
    const existingOutline = threeTest.scene.getObjectByName(outlineName);
    if (existingOutline) return;
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const geometry = new THREE.BoxGeometry(size.x * 1, size.y * 1, size.z * 1);
    const material = modelOutlineShader();
    const outlineMesh = new THREE.Mesh(geometry, material);
    outlineMesh.name = outlineName;
    outlineMesh.position.copy(center);
    outlineMesh.rotation.copy(model.rotation);
    outlineMesh.scale.copy(model.scale);
    outlineMesh.userData.outlineMaterial = material;
    outlineMesh.userData.targetModel = modelName;
    threeTest.addScene(outlineMesh);
    outlineMesh.renderOrder = 1;
    model.renderOrder = 0;
};

/**
 * 更新描边发光材质参数
 * @param {import('../../utils/three').Three3D} threeTest
 * @param {string} outlineName
 * @param {object} params
 */
export const setModelOutlineParams = (threeTest, outlineName, params) => {
    const outlineMesh = threeTest.scene.getObjectByName(outlineName);
    if (!outlineMesh || !outlineMesh.userData.outlineMaterial) return;
    const material = outlineMesh.userData.outlineMaterial;
    if (params.outlineColor) material.uniforms.uOutlineColor.value = params.outlineColor;
    if (params.glowColor) material.uniforms.uGlowColor.value = params.glowColor;
    if (params.outlineWidth !== undefined) material.uniforms.uOutlineWidth.value = params.outlineWidth;
    if (params.glowIntensity !== undefined) material.uniforms.uGlowIntensity.value = params.glowIntensity;
    if (params.pulseSpeed !== undefined) material.uniforms.uPulseSpeed.value = params.pulseSpeed;
    if (params.flowSpeed !== undefined) material.uniforms.uFlowSpeed.value = params.flowSpeed;
};

/**
 * 移除描边发光对象
 * @param {import('../../utils/three').Three3D} threeTest
 * @param {string} outlineName
 * @returns {boolean}
 */
export const removeModelOutline = (threeTest, outlineName) => {
    const outlineMesh = threeTest.scene.getObjectByName(outlineName);
    if (!outlineMesh) return false;
    if (outlineMesh.parent) outlineMesh.parent.remove(outlineMesh);
    else threeTest.scene.remove(outlineMesh);
    try { outlineMesh.material.dispose && outlineMesh.material.dispose(); } catch (e) { }
    try { outlineMesh.geometry.dispose && outlineMesh.geometry.dispose(); } catch (e) { }
    return true;
};

/**
 * 手动创建描边并立即刷新渲染器（调试辅助）
 * @param {import('../../utils/three').Three3D} threeTest
 * @param {string} modelName
 * @param {string|null} outlineName
 */
export const manualCreateModelOutline = (threeTest, modelName, outlineName = null) => {
    const model = getModel(modelName, threeTest.scene);
    if (!model) return;
    if (!outlineName) outlineName = `${modelName}描边发光`;
    const existingOutline = threeTest.scene.getObjectByName(outlineName);
    if (existingOutline) threeTest.scene.remove(existingOutline);
    createModelOutline(threeTest, modelName, outlineName);
    if (threeTest.renderer) {
        threeTest.renderer.render(threeTest.scene, threeTest.camera);
    }
};


