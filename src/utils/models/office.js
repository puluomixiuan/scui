import * as THREE from "three";
import { officeFlowShader, officeGlowShader } from "../shader.js";

/**
 * office.js
 * 办公楼相关特效与灯光：
 * - createOfficeFlow: 围绕办公楼地面的流光边框（Plane + Shader）
 * - createOfficeGlow: 办公楼发光体（Box + Shader）
 * - setOfficeGlowIntensity: 外部控制发光强度
 * - createRoofLighting: 楼顶多光源环境（点光/聚光/环境光）
 * - createRoofGradient: 楼顶横向渐变地板（Box + 自定义 Shader）
 */

/**
 * 创建办公楼专用流光效果
 * @returns {THREE.Mesh}
 */
export const createOfficeFlow = () => {
    const geometry = new THREE.PlaneGeometry(50, 50);
    const material = officeFlowShader();
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = "办公楼流光边框";
    mesh.position.set(-40, 0.1, 0);
    mesh.rotation.x = -Math.PI / 2;
    return mesh;
};

/**
 * 创建办公楼发光效果
 * @returns {THREE.Mesh}
 */
export const createOfficeGlow = () => {
    const geometry = new THREE.BoxGeometry(44.5, 14.5, 19);
    const material = officeGlowShader();
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = "办公楼发光体";
    mesh.position.set(-40, 7, 0);
    mesh.userData.glowMaterial = material;
    return mesh;
};

/**
 * 设置办公楼发光强度
 * @param {import('../../utils/three').Three3D} threeTest three 容器
 * @param {number} intensity 强度值
 */
export const setOfficeGlowIntensity = (threeTest, intensity) => {
    if (!threeTest || !threeTest.scene) return;
    const officeGlow = threeTest.scene.getObjectByName("办公楼发光体");
    if (officeGlow && officeGlow.userData.glowMaterial) {
        officeGlow.userData.glowMaterial.uniforms.uGlowIntensity.value = intensity;
    }
};

/**
 * 创建楼顶光照系统（多光源组合）
 * @returns {THREE.Group}
 */
export const createRoofLighting = () => {
    const roofLightGroup = new THREE.Group();
    roofLightGroup.name = "楼顶光照系统";

    const roofMainLight = new THREE.PointLight(0x00ccff, 3.0, 40, 0.8);
    roofMainLight.position.set(-40, 14, 0);
    roofMainLight.name = "楼顶主光源";
    roofMainLight.castShadow = false;
    roofLightGroup.add(roofMainLight);

    const roofLeftLight1 = new THREE.PointLight(0x0088ff, 2.0, 35, 0.9);
    roofLeftLight1.position.set(-51, 14, 0);
    roofLeftLight1.name = "楼顶左侧光源1";
    roofLightGroup.add(roofLeftLight1);

    const roofLeftLight2 = new THREE.PointLight(0x0066cc, 1.5, 30, 1.0);
    roofLeftLight2.position.set(-58, 14, 0);
    roofLeftLight2.name = "楼顶左侧光源2";
    roofLightGroup.add(roofLeftLight2);

    const roofRightLight1 = new THREE.PointLight(0x0088ff, 2.0, 35, 0.9);
    roofRightLight1.position.set(-29, 14, 0);
    roofRightLight1.name = "楼顶右侧光源1";
    roofLightGroup.add(roofRightLight1);

    const roofRightLight2 = new THREE.PointLight(0x0066cc, 1.5, 30, 1.0);
    roofRightLight2.position.set(-22, 14, 0);
    roofRightLight2.name = "楼顶右侧光源2";
    roofLightGroup.add(roofRightLight2);

    const roofFrontLight1 = new THREE.PointLight(0x00aaff, 1.8, 32, 0.9);
    roofFrontLight1.position.set(-40, 14, 9);
    roofFrontLight1.name = "楼顶前部光源1";
    roofLightGroup.add(roofFrontLight1);

    const roofFrontLight2 = new THREE.PointLight(0x0088ff, 1.2, 28, 1.0);
    roofFrontLight2.position.set(-40, 14, 15);
    roofFrontLight2.name = "楼顶前部光源2";
    roofLightGroup.add(roofFrontLight2);

    const roofBackLight1 = new THREE.PointLight(0x00aaff, 1.8, 32, 0.9);
    roofBackLight1.position.set(-40, 14, -9);
    roofBackLight1.name = "楼顶后部光源1";
    roofLightGroup.add(roofBackLight1);

    const roofBackLight2 = new THREE.PointLight(0x0088ff, 1.2, 28, 1.0);
    roofBackLight2.position.set(-40, 14, -15);
    roofBackLight2.name = "楼顶后部光源2";
    roofLightGroup.add(roofBackLight2);

    const roofCornerLight1 = new THREE.PointLight(0x00ddff, 1.5, 25, 0.8);
    roofCornerLight1.position.set(-51, 14, 9);
    roofCornerLight1.name = "楼顶角光源1";
    roofLightGroup.add(roofCornerLight1);

    const roofCornerLight2 = new THREE.PointLight(0x00ddff, 1.5, 25, 0.8);
    roofCornerLight2.position.set(-29, 14, 9);
    roofCornerLight2.name = "楼顶角光源2";
    roofLightGroup.add(roofCornerLight2);

    const roofCornerLight3 = new THREE.PointLight(0x00ddff, 1.5, 25, 0.8);
    roofCornerLight3.position.set(-51, 14, -9);
    roofCornerLight3.name = "楼顶角光源3";
    roofLightGroup.add(roofCornerLight3);

    const roofCornerLight4 = new THREE.PointLight(0x00ddff, 1.5, 25, 0.8);
    roofCornerLight4.position.set(-29, 14, -9);
    roofCornerLight4.name = "楼顶角光源4";
    roofLightGroup.add(roofCornerLight4);

    const roofAmbient = new THREE.AmbientLight(0x004466, 0.8);
    roofAmbient.position.set(-40, 14, 0);
    roofAmbient.name = "楼顶环境光";
    roofLightGroup.add(roofAmbient);

    const roofSpotLight = new THREE.SpotLight(0x00ccff, 2.0, 50, Math.PI / 6, 0.5, 1.0);
    roofSpotLight.position.set(-40, 25, 0);
    roofSpotLight.target.position.set(-40, 14, 0);
    roofSpotLight.name = "楼顶聚光灯";
    roofSpotLight.castShadow = true;
    roofSpotLight.shadow.mapSize.width = 1024;
    roofSpotLight.shadow.mapSize.height = 1024;
    roofLightGroup.add(roofSpotLight);
    roofLightGroup.add(roofSpotLight.target);

    return roofLightGroup;
};

/**
 * 创建楼顶横向渐变地板（带动画 Shader）
 * @returns {THREE.Mesh}
 */
export const createRoofGradient = () => {
    const roofGeometry = new THREE.BoxGeometry(44.5, 0.5, 19);
    const roofMaterial = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0.0 },
            uColor1: { value: { x: 0.20, y: 0.05, z: 0.40 } },
            uColor2: { value: { x: 0.40, y: 0.15, z: 0.60 } },
            uGradientSpeed: { value: 0.5 },
            uGradientWidth: { value: 1.0 },
        },
        vertexShader: `
            varying vec2 vUv;
            varying vec3 vPosition;
            void main() {
                vUv = uv;
                vPosition = position;
                gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            varying vec2 vUv;
            varying vec3 vPosition;
            uniform float uTime;
            uniform vec3 uColor1;
            uniform vec3 uColor2;
            uniform float uGradientSpeed;
            uniform float uGradientWidth;
            void main() {
                vec2 uv = vUv;
                float gradient = uv.x;
                float animation = sin(uTime * uGradientSpeed) * 0.2 + 0.5;
                gradient = mix(gradient, animation, 0.4);
                gradient = smoothstep(0.0, uGradientWidth, gradient);
                vec3 color = mix(uColor1, uColor2, gradient);
                float edge = 1.0 - abs(uv.x - 0.5) * 2.0;
                edge = pow(edge, 1.5);
                color += edge * vec3(0.3, 0.1, 0.5) * 0.6;
                float wave = sin(uv.x * 8.0 + uTime * 3.0) * 0.15 + 0.85;
                color *= wave;
                color *= 0.8;
                float alpha = 1.0;
                gl_FragColor = vec4(color, alpha);
            }
        `,
        transparent: true,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
    });

    const roofGradient = new THREE.Mesh(roofGeometry, roofMaterial);
    roofGradient.name = "楼顶地板渐变";
    roofGradient.position.set(-40, 14.5, 0);

    let time = 0.0;
    let rafId = 0;
    function animate() {
        time += 0.016;
        roofMaterial.uniforms.uTime.value = time;
        rafId = requestAnimationFrame(animate);
    }
    animate();

    const originalDispose = roofMaterial.dispose.bind(roofMaterial);
    roofMaterial.dispose = function () {
        try { cancelAnimationFrame(rafId); } catch (e) { }
        originalDispose();
    };

    return roofGradient;
};


