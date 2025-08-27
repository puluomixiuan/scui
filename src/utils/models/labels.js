import * as THREE from "three";
import { createLabel } from "../SpriteThree.js";
import DeviceSpriteDom from "../device.js";
import { getModel } from "../modelThree.js";

/**
 * labels.js
 * 通用 2D 标签与摄像头标签
 */

/**
 * 批量添加通用 2D 标签（CSS2DObject）
 * @param {import('../../utils/three').Three3D} threeTest
 * @param {Array<{color:string,name:string,value:string,position:{x:number,y:number,z:number},scale:number}>} labelList
 */
export const addLabelGroup = (threeTest, labelList) => {
    labelList.forEach((label) => {
        const domEl = new DeviceSpriteDom(label.color, label.value).getElement();
        try {
            domEl.style.cursor = 'pointer';
            domEl.style.pointerEvents = 'auto';
            domEl.style.zIndex = '100000';
            domEl.tabIndex = 0;
            const fire = () => {
                try { window.dispatchEvent(new CustomEvent('model-click', { detail: { name: label.value, from: 'label' } })); } catch (err) { }
            };
            domEl.addEventListener('click', (e) => { e.stopPropagation(); fire(); });
            domEl.addEventListener('touchend', (e) => { e.stopPropagation(); fire(); }, { passive: true });
        } catch (e) { }
        const box = createLabel({ name: label.name, type: 'CSS2DObject', element: domEl });
        box.scale.set(label.scale, label.scale, label.scale);
        box.position.set(label.position.x, label.position.y, label.position.z);
        threeTest.addScene(box);
    });
};

/**
 * 在模型上方显示“摄像头”标签（CSS2D），可点击派发 camera-click
 * @param {import('../../utils/three').Three3D} threeTest
 * @param {string} modelName 模型名
 * @param {string|null} labelName 标签对象名
 * @returns {THREE.Object3D|null}
 */
export const showCameraLabel = (threeTest, modelName, labelName = null) => {
    const model = getModel(modelName, threeTest.scene);
    if (!model) return null;
    const name = labelName || `摄像头标签-${modelName}`;
    const existed = threeTest.scene.getObjectByName(name);
    if (existed) return existed;
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const domEl = new DeviceSpriteDom('#3ac9b0', '摄像头').getElement();
    try {
        domEl.style.cursor = 'pointer';
        domEl.style.pointerEvents = 'auto';
        domEl.style.zIndex = '100001';
        domEl.tabIndex = 0;
        const fire = () => {
            try { window.dispatchEvent(new CustomEvent('camera-click', { detail: { name: modelName } })); } catch (err) { }
        };
        domEl.addEventListener('click', (e) => { e.stopPropagation(); fire(); });
        domEl.addEventListener('touchend', (e) => { e.stopPropagation(); fire(); }, { passive: true });
    } catch (e) { }
    const camLabel = createLabel({ name, type: 'CSS2DObject', element: domEl });
    camLabel.name = name;
    camLabel.position.set(center.x, center.y + Math.max(2, size.y * 0.6), center.z);
    camLabel.scale.set(1, 1, 1);
    threeTest.addScene(camLabel);
    return camLabel;
};

/**
 * 移除摄像头标签
 * @param {import('../../utils/three').Three3D} threeTest
 * @param {string} labelName 标签对象名
 * @returns {boolean}
 */
export const removeCameraLabel = (threeTest, labelName) => {
    const obj = threeTest.scene.getObjectByName(labelName);
    if (obj && obj.parent) { obj.parent.remove(obj); return true; }
    return false;
};


