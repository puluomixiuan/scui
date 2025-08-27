import * as THREE from "three";

/**
 * street.js
 * 路灯灯光环境：聚光 + 周边点光、前后方向照明等
 */

/**
 * 创建路灯灯光环境
 * @returns {THREE.Group}
 */
export const createStreetLighting = () => {
    const streetLightGroup = new THREE.Group();
    streetLightGroup.name = "路灯灯光环境";

    const streetMainLight = new THREE.SpotLight(0xffffff, 2.5, 25, Math.PI / 4, 0.3, 1.0);
    streetMainLight.position.set(15, 8, 40);
    streetMainLight.target.position.set(15, 0, 40);
    streetMainLight.name = "路灯主光源";
    streetMainLight.castShadow = true;
    streetMainLight.shadow.mapSize.width = 1024;
    streetMainLight.shadow.mapSize.height = 1024;
    streetMainLight.shadow.camera.near = 0.5;
    streetMainLight.shadow.camera.far = 30;
    streetLightGroup.add(streetMainLight);
    streetLightGroup.add(streetMainLight.target);

    const streetAmbient = new THREE.PointLight(0xffcc44, 1.2, 15, 1.5);
    streetAmbient.position.set(15, 6, 40);
    streetAmbient.name = "路灯环境光";
    streetAmbient.castShadow = false;
    streetLightGroup.add(streetAmbient);

    const streetGroundLight = new THREE.PointLight(0xffdd66, 0.8, 12, 2.0);
    streetGroundLight.position.set(15, 1, 40);
    streetGroundLight.name = "路灯地面光晕";
    streetGroundLight.castShadow = false;
    streetLightGroup.add(streetGroundLight);

    const streetSideLight1 = new THREE.PointLight(0xffbb33, 0.6, 8, 1.8);
    streetSideLight1.position.set(12, 5, 40);
    streetSideLight1.name = "路灯侧面补光1";
    streetSideLight1.castShadow = false;
    streetLightGroup.add(streetSideLight1);

    const streetSideLight2 = new THREE.PointLight(0xffbb33, 0.6, 8, 1.8);
    streetSideLight2.position.set(18, 5, 40);
    streetSideLight2.name = "路灯侧面补光2";
    streetSideLight2.castShadow = false;
    streetLightGroup.add(streetSideLight2);

    const streetFrontLight = new THREE.SpotLight(0xffaa00, 1.5, 20, Math.PI / 6, 0.4, 1.0);
    streetFrontLight.position.set(15, 6, 40);
    streetFrontLight.target.position.set(15, 0, 50);
    streetFrontLight.name = "路灯前方照明";
    streetFrontLight.castShadow = false;
    streetLightGroup.add(streetFrontLight);
    streetLightGroup.add(streetFrontLight.target);

    const streetBackLight = new THREE.SpotLight(0xffaa00, 1.5, 20, Math.PI / 6, 0.4, 1.0);
    streetBackLight.position.set(15, 6, 40);
    streetBackLight.target.position.set(15, 0, 30);
    streetBackLight.name = "路灯后方照明";
    streetBackLight.castShadow = false;
    streetLightGroup.add(streetBackLight);
    streetLightGroup.add(streetBackLight.target);

    return streetLightGroup;
};


