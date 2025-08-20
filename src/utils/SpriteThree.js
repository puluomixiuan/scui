import * as THREE from "three";
import {
    CSS3DObject,
    CSS3DSprite,
} from "three/examples/jsm/renderers/CSS3DRenderer.js";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";

export const createLabel = (labelParams) => {
    const { name, element, type = "CSS2DObject" } = labelParams;
    if (typeof element !== "object") return;
    if (typeof HTMLElement === "function") {
        const flag = element instanceof HTMLElement;
        if (!flag) return;
    }
    let nodeModel = null;
    switch (type) {
        case "CSS2DObject":
            nodeModel = new CSS2DObject(element);
            break;
        case "CSS3DObject":
            nodeModel = new CSS3DObject(element);
            break;
        case "CSS3DSprite":
            nodeModel = new CSS3DSprite(element);
            break;
        default:
            throw new Error("type类型错误");
    }
    if (!nodeModel) return;
    nodeModel.name = name;
    nodeModel.center = new THREE.Vector2(0.5, 1);
    return nodeModel;
};