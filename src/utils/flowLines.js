import * as THREE from "three";

// ==================== 流光线条系统 ====================

/**
 * 创建流光线条效果
 * @param {Object} startPoint - 起始点坐标 {x, y, z}
 * @param {Object} endPoint - 结束点坐标 {x, y, z}
 * @param {string} name - 线条名称
 * @param {number} color - 线条颜色（十六进制）
 * @returns {THREE.LineSegments} 流光线条对象
 */
const createFlowLine = (startPoint, endPoint, name, color = 0x00ffff) => {
    // 计算线条长度和方向
    const direction = new THREE.Vector3().subVectors(endPoint, startPoint);
    const length = direction.length();

    // 创建线条几何体
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array([
        startPoint.x, startPoint.y, startPoint.z,
        endPoint.x, endPoint.y, endPoint.z
    ]);
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // 添加索引以创建线段
    const indices = new Uint16Array([0, 1]);
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));

    // 创建炫酷流光着色器材质
    const material = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0.0 },
            uColor: { value: new THREE.Color(color) },
            uLength: { value: length },
            uFlowSpeed: { value: 3.0 },
            uGlowIntensity: { value: 3.0 },
            uPulseSpeed: { value: 4.0 },
            uNoiseScale: { value: 50.0 },
            uRippleSpeed: { value: 2.0 }
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
            uniform vec3 uColor;
            uniform float uLength;
            uniform float uFlowSpeed;
            uniform float uGlowIntensity;
            uniform float uPulseSpeed;
            uniform float uNoiseScale;
            uniform float uRippleSpeed;
            
            // 噪声函数
            float noise(vec2 p) {
                return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
            }
            
            // 分形噪声
            float fbm(vec2 p) {
                float value = 0.0;
                float amplitude = 0.5;
                float frequency = 1.0;
                for(int i = 0; i < 4; i++) {
                    value += amplitude * noise(p * frequency);
                    amplitude *= 0.5;
                    frequency *= 2.0;
                }
                return value;
            }
            
            void main() {
                vec2 uv = vUv;
                
                // 基础线条 - 始终可见
                float baseLine = 0.9;
                
                // ===== 主流光效果 =====
                float flow = mod(uTime * uFlowSpeed, 1.0);
                float flowWidth = 0.3;
                
                // 创建主流光光带
                float flowBand = smoothstep(flow - flowWidth, flow, uv.x) - 
                               smoothstep(flow, flow + flowWidth, uv.x);
                
                // ===== 多重流光效果 =====
                float flow2 = mod(uTime * uFlowSpeed * 0.7 + 0.3, 1.0);
                float flowBand2 = smoothstep(flow2 - flowWidth * 0.6, flow2, uv.x) - 
                                smoothstep(flow2, flow2 + flowWidth * 0.6, uv.x);
                
                float flow3 = mod(uTime * uFlowSpeed * 1.3 - 0.2, 1.0);
                float flowBand3 = smoothstep(flow3 - flowWidth * 0.4, flow3, uv.x) - 
                                smoothstep(flow3, flow3 + flowWidth * 0.4, uv.x);
                
                // ===== 脉冲效果 =====
                float pulse = sin(uTime * uPulseSpeed) * 0.4 + 0.6;
                float pulse2 = sin(uTime * uPulseSpeed * 1.5 + 1.0) * 0.3 + 0.7;
                
                // ===== 波纹效果 =====
                float ripple = sin(uv.x * 20.0 + uTime * uRippleSpeed) * 0.5 + 0.5;
                ripple *= sin(uv.x * 15.0 - uTime * uRippleSpeed * 0.8) * 0.5 + 0.5;
                
                // ===== 噪点效果 =====
                float noiseValue = fbm(uv * uNoiseScale + uTime * 0.5);
                float noisePulse = sin(uTime * 6.0 + noiseValue * 10.0) * 0.3 + 0.7;
                
                // ===== 边缘发光效果 =====
                float edge = smoothstep(0.0, 0.1, uv.x) * smoothstep(1.0, 0.9, uv.x);
                edge = pow(edge, 0.5);
                
                // ===== 组合所有效果 =====
                float mainFlow = flowBand * pulse * edge;
                float secondaryFlow = flowBand2 * pulse2 * edge * 0.7;
                float tertiaryFlow = flowBand3 * pulse * edge * 0.5;
                
                float totalFlow = mainFlow + secondaryFlow + tertiaryFlow;
                
                // 添加波纹和噪点
                float rippleEffect = ripple * 0.3 * pulse;
                float noiseEffect = noisePulse * 0.2;
                
                // 最终alpha值
                float alpha = baseLine + totalFlow * uGlowIntensity + rippleEffect + noiseEffect;
                
                // ===== 颜色处理 =====
                vec3 mainColor = uColor * (mainFlow + 0.3);
                vec3 secondaryColor = mix(uColor, vec3(1.0), 0.3) * secondaryFlow;
                vec3 tertiaryColor = mix(uColor, vec3(1.0), 0.6) * tertiaryFlow;
                
                // 添加彩虹色效果
                vec3 rainbowColor = vec3(
                    sin(uTime * 2.0 + uv.x * 10.0) * 0.5 + 0.5,
                    sin(uTime * 2.0 + uv.x * 10.0 + 2.094) * 0.5 + 0.5,
                    sin(uTime * 2.0 + uv.x * 10.0 + 4.188) * 0.5 + 0.5
                );
                
                // 最终颜色
                vec3 finalColor = mainColor + secondaryColor + tertiaryColor;
                finalColor += rainbowColor * rippleEffect * 0.5;
                finalColor += vec3(1.0) * noiseEffect * 0.3;
                
                // 确保线条始终可见
                alpha = max(alpha, 0.4);
                
                // 添加辉光效果
                float glow = pow(alpha, 0.7);
                finalColor += uColor * glow * 0.5;
                
                gl_FragColor = vec4(finalColor, alpha);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide
    });

    // 创建线条网格
    const line = new THREE.LineSegments(geometry, material);
    line.name = name;

    // 设置线条宽度 - 增加宽度让炫酷效果更明显
    line.material.linewidth = 12;

    // 启动流光动画
    startFlowAnimation(material);

    return line;
};

/**
 * 启动流光动画
 * @param {THREE.ShaderMaterial} material - 着色器材质
 */
const startFlowAnimation = (material) => {
    let time = 0.0;
    let rafId = 0;

    function animate() {
        time += 0.016;
        material.uniforms.uTime.value = time;
        rafId = requestAnimationFrame(animate);
    }

    animate();

    // 重写dispose方法，确保清理动画
    const originalDispose = material.dispose.bind(material);
    material.dispose = function () {
        try {
            cancelAnimationFrame(rafId);
        } catch (e) { }
        originalDispose();
    };
};

/**
 * 创建并添加流光线条到场景
 * @param {Object} threeTest - Three.js 3D场景实例
 */
const createAndAddFlowLines = (threeTest) => {
    // 流光线条配置 - 支持动态颜色变化
    const flowLineConfigs = [
        {
            name: "流光线条1",
            start: { x: -55.64, y: 0.01, z: 48.66 },
            end: { x: -15.59, y: 0.1, z: 49.06 },
            color: 0x00ffff,
            colorShift: true
        },
        {
            name: "流光线条2",
            start: { x: -55.92, y: 0.01, z: 49.4 },
            end: { x: -14.41, y: 0.01, z: 49.3 },
            color: 0xff00ff,
            colorShift: true
        }
    ];

    // 创建流光线条
    const flowLines = flowLineConfigs.map(config =>
        createFlowLine(config.start, config.end, config.name, config.color)
    );

    // 添加到场景
    flowLines.forEach(line => {
        line.visible = true;
        threeTest.addScene(line);
    });

    // 存储引用到全局，方便后续控制
    threeTest.flowLines = {
        line1: flowLines[0],
        line2: flowLines[1]
    };

    // 启动动态颜色变化
    startDynamicColorChange(threeTest.flowLines);
};

/**
 * 启动动态颜色变化效果
 * @param {Object} flowLines - 流光线条对象
 */
const startDynamicColorChange = (flowLines) => {
    if (!flowLines) return;

    let time = 0.0;
    let rafId = 0;

    function animate() {
        time += 0.016;

        // 动态改变线条1的颜色
        if (flowLines.line1 && flowLines.line1.material) {
            const hue1 = (time * 0.5) % 1.0;
            const color1 = new THREE.Color().setHSL(hue1, 1.0, 0.7);
            flowLines.line1.material.uniforms.uColor.value = color1;
        }

        // 动态改变线条2的颜色
        if (flowLines.line2 && flowLines.line2.material) {
            const hue2 = (time * 0.3 + 0.5) % 1.0;
            const color2 = new THREE.Color().setHSL(hue2, 1.0, 0.7);
            flowLines.line2.material.uniforms.uColor.value = color2;
        }

        rafId = requestAnimationFrame(animate);
    }

    animate();

    // 存储动画ID，方便清理
    flowLines.animationId = rafId;
};

// ==================== 流光线条控制函数 ====================

/**
 * 控制流光线条显示/隐藏
 * @param {Object} threeTest - Three.js 3D场景实例
 * @param {boolean} visible - 是否显示
 */
const toggleFlowLines = (threeTest, visible) => {
    if (!threeTest || !threeTest.flowLines) {
        console.warn('流光线条未初始化');
        return;
    }

    threeTest.flowLines.line1.visible = visible;
    threeTest.flowLines.line2.visible = visible;

    console.log(`流光线条已${visible ? '显示' : '隐藏'}`);
};

/**
 * 获取流光线条状态
 * @param {Object} threeTest - Three.js 3D场景实例
 * @returns {Object} 线条状态 {line1: boolean, line2: boolean}
 */
const getFlowLinesStatus = (threeTest) => {
    if (!threeTest || !threeTest.flowLines) {
        return { line1: false, line2: false };
    }

    return {
        line1: threeTest.flowLines.line1.visible,
        line2: threeTest.flowLines.line2.visible
    };
};

/**
 * 设置流光效果强度
 * @param {Object} threeTest - Three.js 3D场景实例
 * @param {number} intensity - 效果强度 (0.1 - 5.0)
 */
const setFlowEffectIntensity = (threeTest, intensity) => {
    if (!threeTest || !threeTest.flowLines) {
        console.warn('流光线条未初始化');
        return;
    }

    const clampedIntensity = Math.max(0.1, Math.min(5.0, intensity));

    // 更新线条1的效果强度
    if (threeTest.flowLines.line1 && threeTest.flowLines.line1.material) {
        threeTest.flowLines.line1.material.uniforms.uGlowIntensity.value = clampedIntensity;
        threeTest.flowLines.line1.material.uniforms.uFlowSpeed.value = clampedIntensity * 1.5;
    }

    // 更新线条2的效果强度
    if (threeTest.flowLines.line2 && threeTest.flowLines.line2.material) {
        threeTest.flowLines.line2.material.uniforms.uGlowIntensity.value = clampedIntensity;
        threeTest.flowLines.line2.material.uniforms.uFlowSpeed.value = clampedIntensity * 1.5;
    }

    console.log(`流光效果强度已设置为: ${clampedIntensity}`);
};

/**
 * 切换炫酷模式
 * @param {Object} threeTest - Three.js 3D场景实例
 * @param {boolean} enabled - 是否启用炫酷模式
 */
const toggleAwesomeMode = (threeTest, enabled) => {
    if (!threeTest || !threeTest.flowLines) {
        console.warn('流光线条未初始化');
        return;
    }

    const intensity = enabled ? 5.0 : 2.0;
    const speed = enabled ? 5.0 : 3.0;

    // 更新线条1
    if (threeTest.flowLines.line1 && threeTest.flowLines.line1.material) {
        threeTest.flowLines.line1.material.uniforms.uGlowIntensity.value = intensity;
        threeTest.flowLines.line1.material.uniforms.uFlowSpeed.value = speed;
        threeTest.flowLines.line1.material.uniforms.uPulseSpeed.value = enabled ? 8.0 : 4.0;
    }

    // 更新线条2
    if (threeTest.flowLines.line2 && threeTest.flowLines.line2.material) {
        threeTest.flowLines.line2.material.uniforms.uGlowIntensity.value = intensity;
        threeTest.flowLines.line2.material.uniforms.uFlowSpeed.value = speed;
        threeTest.flowLines.line2.material.uniforms.uFlowSpeed.value = enabled ? 8.0 : 4.0;
    }
};

export {
    createAndAddFlowLines,
    toggleFlowLines,
    getFlowLinesStatus,
    setFlowEffectIntensity,
    toggleAwesomeMode
};

// ==================== 流光线条控制面板 ====================

// 获取threeTest实例的引用
let threeTestInstance = null;

/**
 * 设置Three.js实例引用
 * @param {Object} threeTest - Three.js 3D场景实例
 */
export const setThreeTestInstance = (threeTest) => {
    threeTestInstance = threeTest;
};

/**
 * 控制流光线条显示/隐藏
 * @param {boolean} visible - 是否显示
 */
export const toggleFlowLinesVisible = (visible) => {
    if (!threeTestInstance) {
        console.warn('Three.js实例未初始化，请先调用setThreeTestInstance');
        return;
    }
    toggleFlowLines(threeTestInstance, visible);
};

/**
 * 获取流光线条状态
 * @returns {Object} 线条状态 {line1: boolean, line2: boolean}
 */
export const getFlowLinesStatusInfo = () => {
    if (!threeTestInstance) {
        console.warn('Three.js实例未初始化，请先调用setThreeTestInstance');
        return { line1: false, line2: false };
    }
    return getFlowLinesStatus(threeTestInstance);
};

/**
 * 设置流光效果强度
 * @param {number} intensity - 效果强度 (0.1 - 5.0)
 */
export const setFlowEffectIntensityLevel = (intensity) => {
    if (!threeTestInstance) {
        console.warn('Three.js实例未初始化，请先调用setThreeTestInstance');
        return;
    }
    setFlowEffectIntensity(threeTestInstance, intensity);
};

/**
 * 切换炫酷模式
 * @param {boolean} enabled - 是否启用炫酷模式
 */
export const toggleAwesomeModeState = (enabled) => {
    if (!threeTestInstance) {
        console.warn('Three.js实例未初始化，请先调用setThreeTestInstance');
        return;
    }
    toggleAwesomeMode(threeTestInstance, enabled);
};

/**
 * 流光线条控制面板
 * 提供所有控制功能的统一接口
 */
export const flowLinesControlPanel = {
    // 显示/隐藏
    show: () => toggleFlowLinesVisible(true),
    hide: () => toggleFlowLinesVisible(false),
    toggle: () => {
        const status = getFlowLinesStatusInfo();
        toggleFlowLinesVisible(!status.line1);
    },

    // 效果强度控制
    setIntensity: setFlowEffectIntensityLevel,

    // 炫酷模式
    enableAwesome: () => toggleAwesomeModeState(true),
    disableAwesome: () => toggleAwesomeModeState(false),
    toggleAwesome: () => {
        const status = getFlowLinesStatusInfo();
        toggleAwesomeModeState(!status.line1);
    },

    // 获取状态
    getStatus: getFlowLinesStatusInfo,

    // 预设效果
    presets: {
        subtle: () => setFlowEffectIntensityLevel(1.0),
        normal: () => setFlowEffectIntensityLevel(2.5),
        intense: () => setFlowEffectIntensityLevel(4.0),
        extreme: () => setFlowEffectIntensityLevel(5.0)
    }
};

// 默认导出控制面板
export default flowLinesControlPanel;
