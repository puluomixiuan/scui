import * as THREE from "three";
import { officeFlowShader, officeGlowShader } from "../shader.js";
import { getModel } from "../modelThree.js";
// 辅助：获取“办公楼”根（优先精确名，其次模糊匹配），排除标签/CSS2D/特效占位
const findOfficeRoot = (threeTest) => {
    if (!threeTest || !threeTest.scene) return null;
    let office = getModel("办公楼172", threeTest.scene) || getModel("办公楼", threeTest.scene);
    if (office) return office;
    threeTest.scene.traverse((obj) => {
        if (office) return;
        if (!obj || typeof obj.name !== 'string') return;
        if (!/(办公楼|办公樓)/i.test(obj.name)) return;
        if (obj.isCSS2DObject === true) return;
        if (/标签/.test(obj.name)) return;
        if (obj.userData && obj.userData.isOfficeEffect) return;
        let hasMesh = false;
        obj.traverse((c) => { if (c && c.isMesh) hasMesh = true; });
        if (hasMesh) office = obj;
    });
    return office;
};


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
    try { mesh.userData.isOfficeEffect = true; } catch (e) { }
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
    try { mesh.userData.isOfficeEffect = true; } catch (e) { }
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
    try { roofGradient.userData.isOfficeEffect = true; } catch (e) { }
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

/**
 * 识别是否为玻璃材质名
 * @param {string} name
 */
const isGlassName = (name) => {
    if (!name) return false;
    return /glass|00玻璃|window|窗/i.test(name);
};

/**
 * 为材质设置透明度（支持数组）
 * @param {THREE.Material|THREE.Material[]} material
 * @param {number} opacity 0~1
 */
const setOpacityForMaterial = (material, opacity) => {
    const applyOne = (m) => {
        if (!m) return;
        m.transparent = true;
        m.opacity = opacity;
        m.depthWrite = false;
        if (m.side !== undefined) m.side = THREE.DoubleSide;
        m.needsUpdate = true;
    };
    if (Array.isArray(material)) material.forEach(applyOne); else applyOne(material);
};

/**
 * 遍历办公楼模型并为玻璃相关网格设置透明度
 * @param {THREE.Object3D} root 办公楼根对象
 * @param {number} opacity 0~1
 */
const applyOfficeGlassOpacity = (root, opacity) => {
    if (!root) return;
    root.traverse((child) => {
        if (child && child.isMesh && child.material) {
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            const isGlass = mats.some((m) => {
                if (!m) return false;
                if (isGlassName(m.name)) return true;
                // 通过已有透明/金属/粗糙属性猜测玻璃
                return (m.transparent === true) || (typeof m.opacity === 'number' && m.opacity < 1.0) || (typeof m.roughness === 'number' && m.roughness < 0.2 && (m.metalness ?? 0) < 0.2);
            });
            if (isGlass) setOpacityForMaterial(child.material, opacity);
        }
    });
};

/**
 * 设置“办公楼”玻璃透明度（若未加载完成会自动重试）
 * @param {import('../../utils/three').Three3D} threeTest
 * @param {number} opacity 0~1（建议 0.2~0.5）
 */
export const setOfficeGlassOpacity = (threeTest, opacity = 0.3) => {
    if (!threeTest || !threeTest.scene) return;
    const v = Math.max(0, Math.min(1, Number(opacity)));

    // 多次重试，直到办公楼加载完成（最多 ~5s）
    const maxTries = 20;
    let tries = 0;

    const apply = () => {
        let office = findOfficeRoot(threeTest);
        if (!office) {
            tries++;
            if (tries < maxTries) {
                setTimeout(apply, 250);
            }
            return;
        }
        applyOfficeGlassOpacity(office, v);
    };

    apply();
};

/**
 * 启用办公楼“按楼层悬停高亮”功能
 * - 自动按包围盒高度将办公楼划分为四层
 * - 鼠标悬停到任意子网格时，高亮其所在楼层所有网格
 * @param {import('../../utils/three').Three3D} threeTest
 * @param {{color?: number}} options
 */
// 移除：办公楼楼层悬停高亮/亮灯功能

/**
 * 关闭办公楼“按楼层悬停高亮”并恢复材质
 * @param {import('../../utils/three').Three3D} threeTest
 */
// 移除：关闭楼层悬停功能


/**
 * 启用“窗框（00窗框）悬停高亮”
 * - 仅当命中网格的材质名包含 00窗框 时，对该网格的匹配材质做高亮
 * @param {import('../../utils/three').Three3D} threeTest
 * @param {{color?: number}} options
 */
// 移除：窗框悬停高亮功能

// 移除：关闭窗框悬停功能

/**
 * 让"玻璃"默认常亮
 * - 遍历办公楼模型，匹配材质名包含玻璃相关关键词的材质并设为发光/高亮
 * - 若未加载完成，将在短时间内自动重试
 * @param {import('../../utils/three').Three3D} threeTest
 * @param {{color?: number}} options
 */
export const setGlassAlwaysOn = (threeTest, options = {}) => {
    if (!threeTest || !threeTest.scene) return;
    const colorHex = options.color ?? 0x00ccff;
    const targetColor = new THREE.Color(colorHex);

    const applyOnRoot = (root) => {
        root.traverse((child) => {
            if (!child || !child.isMesh || !child.material) return;
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            mats.forEach((m) => {
                if (!m || typeof m.name !== 'string') return;

                // 保存窗框的原始颜色（如果还没有保存过）
                if (/00窗框/i.test(m.name)) {
                    if (!m.userData) m.userData = {};
                    if (m.userData._origEmissive === undefined) {
                        m.userData._origEmissive = m.emissive ? m.emissive.clone() : null;
                    }
                    if (m.userData._origEmissiveIntensity === undefined) {
                        m.userData._origEmissiveIntensity = typeof m.emissiveIntensity === 'number' ? m.emissiveIntensity : undefined;
                    }
                    if (m.userData._origColor === undefined) {
                        m.userData._origColor = m.color ? m.color.clone() : null;
                    }
                    return; // 跳过窗框，不处理发光
                }

                // 处理玻璃材质
                if (!isGlassName(m.name)) return;
                if (!m.userData) m.userData = {};
                if (m.emissive) {
                    m.emissive.copy(targetColor);
                    if (typeof m.emissiveIntensity === 'number') m.emissiveIntensity = Math.max(1.0, m.emissiveIntensity || 1.0);
                } else if (m.color) {
                    // 对无 emissive 的材质，用颜色增强可见度
                    m.color.lerp(targetColor, 0.6);
                }
                m.needsUpdate = true;
                m.userData._glassAlwaysOn = true;
            });
        });
    };

    const maxTries = 20;
    let tries = 0;
    const tryApply = () => {
        const office = findOfficeRoot(threeTest);
        if (!office) {
            tries++;
            if (tries < maxTries) setTimeout(tryApply, 250);
            return;
        }
        applyOnRoot(office);
    };
    tryApply();
};

/**
 * 将“办公楼”的墙体材质替换为指定名称的材质（例如：00踏步）
 * - 会在模型加载未完成时自动重试一段时间
 * - 仅匹配“墙”相关的材质名（不影响玻璃/窗框/屋顶等）
 * @param {import('../../utils/three').Three3D} threeTest
 * @param {string} targetMaterialName 目标材质名称（默认：00踏步）
 */
export const applyOfficeWallMaterial = (threeTest, targetMaterialName = '00踏步') => {
    if (!threeTest || !threeTest.scene) return;

    const isWallMaterialName = (name) => {
        console.log(name + '11111111111111');

        if (!name) return false;
        // 常见“墙体”命名关键词，排除玻璃/窗/门/柱等
        if (/玻璃|窗|window|glass|门|roof|屋顶|floor|地面|地板|柱|beam|梁/i.test(name)) return false;
        return /墙|wall/i.test(name);
    };

    const findMaterialByName = (root, name) => {
        let found = null;
        root.traverse((child) => {
            if (found) return;
            if (!child || !child.isMesh || !child.material) return;
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            mats.forEach((m) => {
                if (found) return;
                if (m && typeof m.name === 'string' && new RegExp(`^${name}$`, 'i').test(m.name)) {
                    found = m;
                }
            });
        });
        return found;
    };

    const replaceWalls = (root, templateMat) => {
        root.traverse((child) => {
            if (!child || !child.isMesh || !child.material) return;
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            let changed = false;
            const newMats = mats.map((m) => {
                if (!m || typeof m.name !== 'string') return m;
                if (isGlassName(m.name)) return m; // 跳过玻璃
                if (/00窗框/i.test(m.name)) return m; // 跳过窗框
                if (new RegExp(`^${targetMaterialName}$`, 'i').test(m.name)) return m; // 已是目标材质
                if (!isWallMaterialName(m.name)) return m; // 仅替换墙体
                const cloned = templateMat.clone();
                cloned.name = targetMaterialName;
                cloned.needsUpdate = true;
                changed = true;
                return cloned;
            });
            if (changed) {
                child.material = Array.isArray(child.material) ? newMats : newMats[0];
                child.needsUpdate = true;
            }
        });
    };

    const maxTries = 20;
    let tries = 0;
    const tryApply = () => {
        const office = findOfficeRoot(threeTest);
        if (!office) {
            tries++;
            if (tries < maxTries) return void setTimeout(tryApply, 250);
            return;
        }
        const templateMat = findMaterialByName(office, targetMaterialName);
        if (!templateMat) {
            tries++;
            if (tries < maxTries) return void setTimeout(tryApply, 250);
            return;
        }
        replaceWalls(office, templateMat);
    };

    tryApply();
};

/**
 * 精准替换：将场景中材质名 A 替换为已存在的材质名 B（逐 mesh 克隆）
 * - 示例：replaceMaterialByName(threeTest, 'Material', '00踏步')
 * - 若模型未加载完成会自动重试
 * @param {import('../../utils/three').Three3D} threeTest
 * @param {string} sourceMaterialName 需要被替换的材质名
 * @param {string} targetMaterialName 作为模板的材质名
 */
export const replaceMaterialByName = (threeTest, sourceMaterialName, targetMaterialName) => {
    if (!threeTest || !threeTest.scene) return;

    const findMaterialByName = (root, name) => {
        let found = null;
        root.traverse((child) => {
            if (found) return;
            if (!child || !child.isMesh || !child.material) return;
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            mats.forEach((m) => {
                if (found) return;
                if (m && typeof m.name === 'string' && new RegExp(`^${name}$`, 'i').test(m.name)) {
                    found = m;
                }
            });
        });
        return found;
    };

    const replaceAll = (root, srcName, templateMat) => {
        let replacedCount = 0;
        const matchedMeshes = [];
        root.traverse((child) => {
            if (!child || !child.isMesh || !child.material) return;
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            let changed = false;
            const newMats = mats.map((m) => {
                if (!m || typeof m.name !== 'string') return m;
                if (!new RegExp(`^${srcName}$`, 'i').test(m.name)) return m;
                const cloned = templateMat.clone();
                cloned.name = targetMaterialName;
                cloned.needsUpdate = true;
                changed = true;
                replacedCount++;
                return cloned;
            });
            if (changed) {
                child.material = Array.isArray(child.material) ? newMats : newMats[0];
                child.needsUpdate = true;
                if (matchedMeshes.length < 5) matchedMeshes.push(child.name || '(unnamed mesh)');
            }
        });
    };

    const maxTries = 20;
    let tries = 0;
    const tryApply = () => {
        const office = findOfficeRoot(threeTest) || threeTest.scene; // 若根未定位，遍历全场景兜底
        if (!office) {
            tries++;
            if (tries < maxTries) return void setTimeout(tryApply, 250);
            return;
        }
        let templateMat = findMaterialByName(office, targetMaterialName);
        if (!templateMat) {
            tries++;
            if (tries < maxTries) return void setTimeout(tryApply, 250);
            // 兜底：未找到目标模板材质则创建一个基础材质
            try {
                templateMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.8, metalness: 0.0 });
                templateMat.name = targetMaterialName;
            } catch (e) { }
        }
        if (templateMat) {
            replaceAll(office, sourceMaterialName, templateMat);
        }
    };

    tryApply();
};

/**
 * 恢复窗框到原始颜色
 * - 遍历办公楼模型，恢复所有窗框材质的原始颜色和发光属性
 * @param {import('../../utils/three').Three3D} threeTest
 */
export const restoreWindowFrameColors = (threeTest) => {
    if (!threeTest || !threeTest.scene) return;

    const restoreOnRoot = (root) => {
        root.traverse((child) => {
            if (!child || !child.isMesh || !child.material) return;
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            mats.forEach((m) => {
                if (!m || typeof m.name !== 'string') return;
                if (!/00窗框/i.test(m.name)) return;
                if (!m.userData) return;

                // 恢复原始发光属性
                if (m.userData._origEmissive && m.emissive) {
                    m.emissive.copy(m.userData._origEmissive);
                }
                if (m.userData._origEmissiveIntensity !== undefined && typeof m.emissiveIntensity === 'number') {
                    m.emissiveIntensity = m.userData._origEmissiveIntensity;
                }

                // 恢复原始颜色
                if (m.userData._origColor && m.color) {
                    m.color.copy(m.userData._origColor);
                }

                m.needsUpdate = true;
            });
        });
    };

    const maxTries = 20;
    let tries = 0;
    const tryRestore = () => {
        const office = findOfficeRoot(threeTest);
        if (!office) {
            tries++;
            if (tries < maxTries) setTimeout(tryRestore, 250);
            return;
        }
        restoreOnRoot(office);
    };
    tryRestore();
};

/**
 * 创建白天/夜晚交替光照系统
 * - 包含环境光、方向光、点光源等
 * - 支持平滑过渡动画
 * @returns {Object} 包含光照对象和控制方法的对象
 */
export const createDayNightLighting = () => {
    const lightingSystem = new THREE.Group();
    lightingSystem.name = "昼夜交替光照系统";

    // 创建天空盒纹理
    const createSkyboxTexture = (isDay) => {
        if (isDay) {
            const loader = new THREE.CubeTextureLoader();
            const path = '/texture/sky/';
            const files = ['sky.right.jpg', 'sky.left.jpg', 'sky.top.jpg', 'sky.bottom.jpg', 'sky.front.jpg', 'sky.back.jpg'];
            const texture = loader.load(files.map(file => path + file));
            try { texture.colorSpace = THREE.SRGBColorSpace; } catch (e) { try { texture.encoding = THREE.sRGBEncoding; } catch (e2) { } }
            texture.name = '白天天空盒纹理';
            return texture;
        }
        // 夜晚：使用更深的黑夜渐变背景（非立方体贴图），保证更暗的夜空
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
        gradient.addColorStop(0, '#00040a');
        gradient.addColorStop(0.5, '#000208');
        gradient.addColorStop(1, '#000000');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 256, 256);
        const texture = new THREE.CanvasTexture(canvas);
        texture.mapping = THREE.EquirectangularReflectionMapping;
        try { texture.colorSpace = THREE.SRGBColorSpace; } catch (e) { try { texture.encoding = THREE.sRGBEncoding; } catch (e2) { } }
        texture.name = '夜晚天空盒纹理';
        return texture;
    };

    // 白天/夜晚天空盒纹理（存放到 userData，切换时赋给 scene.background）
    lightingSystem.userData.daySkyboxTexture = createSkyboxTexture(true);
    lightingSystem.userData.nightSkyboxTexture = createSkyboxTexture(false);

    // 白天模式 - 明亮的太阳光
    const dayAmbient = new THREE.AmbientLight(0xffffff, 0.6);
    dayAmbient.name = "白天环境光";
    dayAmbient.userData.isDayLight = true;
    lightingSystem.add(dayAmbient);

    const dayDirectional = new THREE.DirectionalLight(0xffffff, 1.0);
    dayDirectional.position.set(50, 100, 50);
    dayDirectional.castShadow = true;
    dayDirectional.shadow.mapSize.width = 2048;
    dayDirectional.shadow.mapSize.height = 2048;
    dayDirectional.shadow.camera.near = 0.5;
    dayDirectional.shadow.camera.far = 500;
    dayDirectional.shadow.camera.left = -100;
    dayDirectional.shadow.camera.right = 100;
    dayDirectional.shadow.camera.top = 100;
    dayDirectional.shadow.camera.bottom = -100;
    dayDirectional.name = "白天太阳光";
    dayDirectional.userData.isDayLight = true;
    lightingSystem.add(dayDirectional);

    // 夜晚模式 - 柔和的月光和城市灯光
    const nightAmbient = new THREE.AmbientLight(0x001122, 0.3);
    nightAmbient.name = "夜晚环境光";
    nightAmbient.userData.isNightLight = true;
    nightAmbient.visible = false;
    lightingSystem.add(nightAmbient);

    const nightDirectional = new THREE.DirectionalLight(0x4466aa, 0.4);
    nightDirectional.position.set(-30, 80, -30);
    nightDirectional.castShadow = true;
    nightDirectional.shadow.mapSize.width = 1024;
    nightDirectional.shadow.mapSize.height = 1024;
    nightDirectional.shadow.camera.near = 0.5;
    nightDirectional.shadow.camera.far = 300;
    nightDirectional.shadow.camera.left = -80;
    nightDirectional.shadow.camera.right = 80;
    nightDirectional.shadow.camera.top = 80;
    nightDirectional.shadow.camera.bottom = -80;
    nightDirectional.name = "夜晚月光";
    nightDirectional.userData.isNightLight = true;
    nightDirectional.visible = false;
    lightingSystem.add(nightDirectional);

    // 城市夜景点光源
    const cityLights = new THREE.Group();
    cityLights.name = "城市夜景灯光";
    cityLights.userData.isNightLight = true;
    cityLights.visible = false;

    // 办公楼周围的路灯
    const streetLight1 = new THREE.PointLight(0xffaa00, 0.8, 30, 1.0);
    streetLight1.position.set(-60, 8, 0);
    streetLight1.castShadow = true;
    streetLight1.name = "路灯1";
    cityLights.add(streetLight1);

    const streetLight2 = new THREE.PointLight(0xffaa00, 0.8, 30, 1.0);
    streetLight2.position.set(-20, 8, 0);
    streetLight2.castShadow = true;
    streetLight2.name = "路灯2";
    cityLights.add(streetLight2);

    const streetLight3 = new THREE.PointLight(0xffaa00, 0.6, 25, 1.0);
    streetLight3.position.set(-40, 8, 20);
    streetLight3.castShadow = true;
    streetLight3.name = "路灯3";
    cityLights.add(streetLight3);

    const streetLight4 = new THREE.PointLight(0xffaa00, 0.6, 25, 1.0);
    streetLight4.position.set(-40, 8, -20);
    streetLight4.castShadow = true;
    streetLight4.name = "路灯4";
    cityLights.add(streetLight4);

    // 办公楼内部灯光
    const officeInteriorLight1 = new THREE.PointLight(0xffffff, 0.5, 20, 1.0);
    officeInteriorLight1.position.set(-40, 5, 0);
    officeInteriorLight1.name = "办公楼内部光1";
    cityLights.add(officeInteriorLight1);

    const officeInteriorLight2 = new THREE.PointLight(0xffffff, 0.4, 18, 1.0);
    officeInteriorLight2.position.set(-40, 10, 0);
    officeInteriorLight2.name = "办公楼内部光2";
    cityLights.add(officeInteriorLight2);

    lightingSystem.add(cityLights);

    // 控制方法
    const controls = {
        /**
         * 切换到白天模式
         * @param {number} duration 过渡时间（秒）
         */
        switchToDay: (duration = 2.0) => {
            const dayLights = lightingSystem.children.filter(child => child.userData.isDayLight);
            const nightLights = lightingSystem.children.filter(child => child.userData.isNightLight);

            // 显示白天灯光
            dayLights.forEach(light => {
                light.visible = true;
                if (light.intensity !== undefined) {
                    new TWEEN.Tween(light)
                        .to({ intensity: light.userData.originalIntensity || 1.0 }, duration * 1000)
                        .easing(TWEEN.Easing.Quadratic.InOut)
                        .start();
                }
            });

            // 隐藏夜晚灯光
            nightLights.forEach(light => {
                if (light.intensity !== undefined) {
                    new TWEEN.Tween(light)
                        .to({ intensity: 0 }, duration * 1000)
                        .easing(TWEEN.Easing.Quadratic.InOut)
                        .onComplete(() => { light.visible = false; })
                        .start();
                } else {
                    light.visible = false;
                }
            });

            // 切换天空盒纹理为白天
            if (window.__threeTest && window.__threeTest.scene) {
                window.__threeTest.scene.background = lightingSystem.userData.daySkyboxTexture;
            }
        },

        /**
         * 切换到夜晚模式
         * @param {number} duration 过渡时间（秒）
         */
        switchToNight: (duration = 2.0) => {
            const dayLights = lightingSystem.children.filter(child => child.userData.isDayLight);
            const nightLights = lightingSystem.children.filter(child => child.userData.isNightLight);

            // 隐藏白天灯光
            dayLights.forEach(light => {
                if (light.intensity !== undefined) {
                    new TWEEN.Tween(light)
                        .to({ intensity: 0 }, duration * 1000)
                        .easing(TWEEN.Easing.Quadratic.InOut)
                        .onComplete(() => { light.visible = false; })
                        .start();
                } else {
                    light.visible = false;
                }
            });

            // 显示夜晚灯光
            nightLights.forEach(light => {
                light.visible = true;
                if (light.intensity !== undefined) {
                    new TWEEN.Tween(light)
                        .to({ intensity: light.userData.originalIntensity || 0.8 }, duration * 1000)
                        .easing(TWEEN.Easing.Quadratic.InOut)
                        .start();
                }
            });

            // 切换天空盒纹理为夜晚
            if (window.__threeTest && window.__threeTest.scene) {
                window.__threeTest.scene.background = lightingSystem.userData.nightSkyboxTexture;
            }
        },

        /**
         * 设置过渡时间
         * @param {number} duration 过渡时间（秒）
         */
        setTransitionDuration: (duration) => {
            controls.transitionDuration = duration;
        },

        /**
         * 自动昼夜循环
         * @param {number} dayDuration 白天持续时间（秒）
         * @param {number} nightDuration 夜晚持续时间（秒）
         */
        startAutoCycle: (dayDuration = 30, nightDuration = 30) => {
            let isDay = true;

            const cycle = () => {
                if (isDay) {
                    controls.switchToNight(2.0);
                    setTimeout(() => {
                        isDay = false;
                        cycle();
                    }, nightDuration * 1000);
                } else {
                    controls.switchToDay(2.0);
                    setTimeout(() => {
                        isDay = true;
                        cycle();
                    }, dayDuration * 1000);
                }
            };

            cycle();
        },

        /**
         * 停止自动循环
         */
        stopAutoCycle: () => {
            // 清除所有定时器
            const highestTimeoutId = setTimeout(";");
            for (let i = 0; i < highestTimeoutId; i++) {
                clearTimeout(i);
            }
        }
    };

    // 保存原始强度值
    lightingSystem.traverse((child) => {
        if (child.intensity !== undefined) {
            child.userData.originalIntensity = child.intensity;
        }
    });

    // 初始化为白天模式
    controls.switchToDay(0);

    return {
        group: lightingSystem,
        controls: controls
    };
};


