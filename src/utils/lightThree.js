import * as THREE from "three";

// 创建环境光
// @param {string} name 光线名称
// @param {object} ambientLight 构建光线参数
// @param {number} ambientLight.color  (参数可选）颜色的rgb数值。缺省值为 0xffffff
// @param {number} ambientLight.intensity (参数可选)光照的强度。缺省值为 1
// @returns THREE.AmbientLight
export const createAmbientLight = (
    name,
    ambientLight,
) => {
    const { color = 0xffffff, intensity = 1 } = ambientLight || {};
    const light = new THREE.AmbientLight(color, intensity);
    light.name = name;
    return light;
};

// 创建点光源
// @param {string} name 光线名称
// @param {object} pointLight 构建光线参数
// @param {number} pointLight.color  (参数可选）颜色的rgb数值。缺省值为 0xffffff
// @param {number} pointLight.intensity (参数可选)光照的强度。缺省值为 1
// @param {number} pointLight.distance 这个距离表示从光源到光照强度为0的位置。 当设置为0时，光永远不会消失(距离无穷大)。缺省值 0.
// @param {number} pointLight.decay 沿着光照距离的衰退量。缺省值 2。
// @returns
export const createPointLight = (
    name,
    pointLight,
    Position,
) => {
    const {
        color = 0xffffff,
        intensity = 1,
        distance = 0,
        decay = 2,
    } = pointLight || {};
    const { x = 0, y = 0, z = 0 } = Position || {};
    const light = new THREE.PointLight(color, intensity, distance, decay);
    light.name = name;
    light.position.set(x, y, z);
    return light;
};

// 创建方向光（太阳光）
// @param {string} name 光线名称
// @param {object} directionalLight 构建光线参数
// @param {number} directionalLight.color 颜色，缺省值为 0xffffff
// @param {number} directionalLight.intensity 光照强度，缺省值为 1
// @param {object} directionalLight.position 光源位置，缺省值为 {x: 50, y: 100, z: 50}
// @param {object} directionalLight.target 光照目标，缺省值为 {x: 0, y: 0, z: 0}
// @returns THREE.DirectionalLight
export const createDirectionalLight = (
    name,
    directionalLight,
) => {
    const {
        color = 0xffffff,
        intensity = 1,
        position = { x: 50, y: 100, z: 50 },
        target = { x: 0, y: 0, z: 0 }
    } = directionalLight || {};

    const light = new THREE.DirectionalLight(color, intensity);
    light.name = name;
    light.position.set(position.x, position.y, position.z);

    // 设置光照目标
    const targetObject = new THREE.Object3D();
    targetObject.position.set(target.x, target.y, target.z);
    light.target = targetObject;

    return { light, target: targetObject };
};

// 创建半球光（天空光）
// @param {string} name 光线名称
// @param {object} hemisphereLight 构建光线参数
// @param {number} hemisphereLight.skyColor 天空颜色，缺省值为 0x87ceeb
// @param {number} hemisphereLight.groundColor 地面颜色，缺省值为 0x8b4513
// @param {number} hemisphereLight.intensity 光照强度，缺省值为 0.6
// @returns THREE.HemisphereLight
export const createHemisphereLight = (
    name,
    hemisphereLight,
) => {
    const {
        skyColor = 0x87ceeb,
        groundColor = 0x8b4513,
        intensity = 0.6
    } = hemisphereLight || {};

    const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    light.name = name;
    return light;
};

// 创建聚光灯
// @param {string} name 光线名称
// @param {object} spotLight 构建光线参数
// @param {number} spotLight.color 颜色，缺省值为 0xffffff
// @param {number} spotLight.intensity 光照强度，缺省值为 1
// @param {number} spotLight.distance 光照距离，缺省值为 0
// @param {number} spotLight.angle 光束角度，缺省值为 Math.PI / 3
// @param {number} spotLight.penumbra 边缘柔和度，缺省值为 0
// @param {object} spotLight.position 光源位置，缺省值为 {x: 0, y: 10, z: 0}
// @param {object} spotLight.target 光照目标，缺省值为 {x: 0, y: 0, z: 0}
// @returns {light: THREE.SpotLight, target: THREE.Object3D}
export const createSpotLight = (
    name,
    spotLight,
) => {
    const {
        color = 0xffffff,
        intensity = 1,
        distance = 0,
        angle = Math.PI / 3,
        penumbra = 0,
        position = { x: 0, y: 10, z: 0 },
        target = { x: 0, y: 0, z: 0 }
    } = spotLight || {};

    const light = new THREE.SpotLight(color, intensity, distance, angle, penumbra);
    light.name = name;
    light.position.set(position.x, position.y, position.z);

    // 设置光照目标
    const targetObject = new THREE.Object3D();
    targetObject.position.set(target.x, target.y, target.z);
    light.target = targetObject;

    return { light, target: targetObject };
};

// 创建完整的场景光照系统
// @param {string} name 光照系统名称
// @param {object} options 光照配置选项
// @returns {lights: THREE.Group, targets: THREE.Object3D[]}
export const createSceneLighting = (
    name,
    options = {}
) => {
    const {
        ambient = { color: 0x404040, intensity: 0.4 },
        directional = { color: 0xffffff, intensity: 0.8, position: { x: 50, y: 100, z: 50 } },
        hemisphere = { skyColor: 0x87ceeb, groundColor: 0x8b4513, intensity: 0.3 },
        spotLights = [],
        pointLights = []
    } = options;

    const lightGroup = new THREE.Group();
    lightGroup.name = name;
    const targets = [];

    // 环境光
    const ambientLight = createAmbientLight("环境光", ambient);
    lightGroup.add(ambientLight);

    // 方向光（太阳光）
    const { light: directionalLight, target: dirTarget } = createDirectionalLight("太阳光", directional);
    lightGroup.add(directionalLight);
    lightGroup.add(dirTarget);
    targets.push(dirTarget);

    // 半球光（天空光）
    const hemisphereLight = createHemisphereLight("天空光", hemisphere);
    lightGroup.add(hemisphereLight);

    // 聚光灯
    spotLights.forEach((spotConfig, index) => {
        const { light: spotLight, target: spotTarget } = createSpotLight(`聚光灯${index}`, spotConfig);
        lightGroup.add(spotLight);
        lightGroup.add(spotTarget);
        targets.push(spotTarget);
    });

    // 点光源
    pointLights.forEach((pointConfig, index) => {
        const pointLight = createPointLight(`点光源${index}`, pointConfig, pointConfig.position);
        lightGroup.add(pointLight);
    });

    return { lights: lightGroup, targets };
};