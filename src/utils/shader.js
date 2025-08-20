import * as THREE from "three"; // 导入Three.js库

/**
 * 创建圆形动画着色器材质
 * @param {Array} rgb - 可选的RGB颜色数组，默认值为[68, 222, 255]
 * @returns {THREE.ShaderMaterial} 配置好的着色器材质对象
 */
export const circleShader = (rgb) => {
    // 顶点着色器：传递纹理坐标给片元着色器
    const vertexShader = `
  varying vec2 vUv; // 声明 varying 变量用于在顶点和片元着色器之间传递纹理坐标
  void main(){
    vUv = uv; // 将内置uv纹理坐标赋值给vUv
    // 计算顶点最终位置：模型视图投影矩阵 * 顶点位置
    gl_Position = projectionMatrix*viewMatrix*modelMatrix*vec4( position, 1.0 );
  }
  `;

    // 片元着色器：实现圆形动画效果
    const fragmentShader = `
varying vec2 vUv; // 接收从顶点着色器传递的纹理坐标
uniform vec3 uColor1; // 内部颜色(uniform变量)
uniform vec3 uColor2; // 外部颜色(uniform变量)
uniform float uTime; // 时间变量，用于实现动画效果

void main() {
    // 计算当前像素到中心点的距离
    float distanceFromCenter = distance(vUv, vec2(0.5));  
    // 使用step函数创建环形效果，fract(uTime)使距离随时间变化
    distanceFromCenter = step(0.03, abs(distanceFromCenter - fract(uTime)));
    float radius = 0.25; // 圆环半径
    // 根据距离判断是否在圆环内部
    float isInsideCircle = step(radius, distanceFromCenter);  
    // 颜色混合：内部颜色与外部颜色根据距离进行插值
    vec4 color = isInsideCircle * vec4(uColor1, 0.0) + (1.0 - isInsideCircle) * vec4(uColor2, 1.0);   
    gl_FragColor = color; // 设置最终像素颜色
}
`;

    // 设置默认颜色值
    const color = rgb || [68, 222, 255];
    // 创建Three.js着色器材质
    const material = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 1 }, // 时间变量，初始值为1
            uColor2: { value: rgbToVec3(...color) }, // 外部颜色，通过rgbToVec3转换
            uColor1: { value: rgbToVec3(255, 255, 255) }, // 内部颜色(白色)
        },
        vertexShader: vertexShader, // 顶点着色器代码
        fragmentShader: fragmentShader, // 片元着色器代码
        side: THREE.DoubleSide, // 双面渲染
        transparent: true, // 开启透明度
        depthTest: true, // 开启深度测试
        depthWrite: true, // 开启深度写入
    });

    let time = 0.01; // 时间初始值
    let rafId = 0;
    /**
     * 动画循环函数：更新时间变量uTime，实现圆环动画效果
     */
    function loop() {
        time += 0.01; // 时间递增
        material.uniforms.uTime.value = time; // 更新着色器中的时间变量
        rafId = requestAnimationFrame(loop); // 请求下一帧动画
    }
    loop(); // 启动动画循环

    // 在材质销毁时停止动画循环
    const originalDispose = material.dispose.bind(material);
    material.dispose = function () {
        try { cancelAnimationFrame(rafId); } catch (e) { }
        originalDispose();
    };

    return material; // 返回配置好的材质对象
};

/**
 * 将RGB颜色值(0-255)转换为Three.js使用的vec3格式(0.0-1.0)
 * @param {number} x - 红色通道值(0-255)
 * @param {number} y - 绿色通道值(0-255)
 * @param {number} z - 蓝色通道值(0-255)
 * @returns {Object} 包含x、y、z属性的对象，值为0.0-1.0
 */
const rgbToVec3 = (x, y, z) => {
    return {
        x: x / 255.0, // 红色通道归一化
        y: y / 255.0, // 绿色通道归一化
        z: z / 255.0, // 蓝色通道归一化
    };
};





/**
 * 创建办公楼流光着色器材质
 * @returns {THREE.ShaderMaterial} 配置好的着色器材质对象
 */
export const officeFlowShader = () => {
    // 顶点着色器
    const vertexShader = `
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
            vUv = uv;
            vPosition = position;
            gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
        }
    `;

    // 片元着色器 - 实现流光效果
    const fragmentShader = `
        varying vec2 vUv;
        varying vec3 vPosition;
        
        uniform float uTime;
        uniform vec3 uBaseColor;
        uniform vec3 uFlowColor;
        uniform vec3 uGlowColor;
        
        void main() {
            vec2 uv = vUv;
            
            // 计算流光位置
            float flowProgress = fract(uTime * 0.5);
            float flowWidth = 0.15;
            
            // 在边框上创建流光效果
            float border = 0.0;
            
            // 检测是否在边框上
            if (uv.x < 0.01 || uv.x > 0.99 || uv.y < 0.01 || uv.y > 0.99) {
                border = 1.0;
            }
            
            // 计算流光在边框上的位置
            float flowPos = 0.0;
            if (uv.x < 0.05 || uv.x > 0.95) {
                // 垂直边框
                flowPos = uv.y;
            } else if (uv.y < 0.05 || uv.y > 0.95) {
                // 水平边框
                flowPos = uv.x;
            }
            
            // 流光动画
            float flow = smoothstep(flowPos - flowWidth, flowPos, flowProgress) * 
                        smoothstep(flowPos + flowWidth, flowPos, flowProgress);
            
            // 基础边框颜色
            vec3 baseColor = uBaseColor;
            
            // 流光颜色
            vec3 flowColor = flow * uFlowColor;
            
            // 发光效果
            vec3 glowColor = flow * uGlowColor * 0.8;
            
            // 最终颜色
            vec3 finalColor = baseColor + flowColor + glowColor;
            
            // 透明度
            float alpha = border * (0.6 + 0.4 * flow);
            
            gl_FragColor = vec4(finalColor, alpha);
        }
    `;

    // 创建材质
    const material = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0.0 },
            uBaseColor: { value: { x: 0.0, y: 0.0, z: 1.0 } },  // 深蓝色
            uFlowColor: { value: { x: 1.0, y: 1.0, z: 0.0 } },  // 黄色
            uGlowColor: { value: { x: 1.0, y: 1.0, z: 1.0 } }   // 白色
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        transparent: true,
        side: THREE.DoubleSide,
        depthTest: true,
        depthWrite: false
    });

    // 动画循环
    let time = 0.0;
    let rafId = 0;

    function animate() {
        time += 0.016;
        material.uniforms.uTime.value = time;
        rafId = requestAnimationFrame(animate);
    }

    animate();

    // 清理函数
    const originalDispose = material.dispose.bind(material);
    material.dispose = function () {
        try { cancelAnimationFrame(rafId); } catch (e) { }
        originalDispose();
    };

    return material;
};

/**
 * 创建办公楼发光渐变色着色器材质
 * @returns {THREE.ShaderMaterial} 配置好的着色器材质对象
 */
export const officeGlowShader = () => {
    // 顶点着色器
    const vertexShader = `
		varying vec3 vPosition;
		varying vec3 vNormal;
		varying vec2 vUv;
		
		void main() {
			vPosition = position;
			vNormal = normalize(normalMatrix * normal);
			vUv = (uv);
			gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
		}
	`;

    // 片元着色器 - 实现楼层交替渐变 + 竖向条纹 + 楼顶横向渐变
    const fragmentShader = `
		varying vec3 vPosition;
		varying vec3 vNormal;
		varying vec2 vUv;
		
		uniform float uTime;
		uniform vec3 uColor1;  // 楼层1颜色（深蓝）
		uniform vec3 uColor2;  // 楼层2颜色（蓝青）
		uniform vec3 uColor3;  // 楼层3颜色（青色）
		uniform float uGlowIntensity;  // 边缘发光强度
		
		// 楼层交替渐变控制
		uniform float uFloorHeight;    // 每层楼高度
		uniform float uFloorBlend;     // 楼层间渐变过渡
		uniform float uAlternateSpeed; // 交替动画速度
		
		// 条纹参数
		uniform float uStripeDensity;   // 条纹密度
		uniform float uStripeWidth;     // 条纹宽度
		uniform float uStripeSpeed;     // 条纹流动速度
		uniform float uStripeIntensity; // 条纹亮度
		
		// 中央亮带参数
		uniform float uBandCenter;      // 中心位置
		uniform float uBandWidth;       // 宽度
		uniform float uBandIntensity;   // 强度
		
		float smoothBand(float v, float center, float width){
			float halfW = width * 0.5;
			return smoothstep(center - halfW, center, v) * (1.0 - smoothstep(center, center + halfW, v));
		}
		
		void main() {
			vec3 normal = normalize(vNormal);
			
			// 计算楼层位置（基于Y坐标）
			float height = vPosition.y + 7.0; // 调整到0-14范围
			float floorIndex = floor(height / uFloorHeight);
			float floorProgress = fract(height / uFloorHeight); // 在当前楼层内的进度
			
			// 楼层交替动画（随时间变化）
			float alternatePhase = sin(uTime * uAlternateSpeed) * 0.5 + 0.5;
			float floorOffset = mod(floorIndex + alternatePhase * 3.0, 3.0); // 3种颜色循环
			
			// 根据楼层位置选择颜色
			vec3 floorColor1, floorColor2;
			if (floorOffset < 1.0) {
				floorColor1 = uColor1; // 深蓝
				floorColor2 = uColor2; // 蓝青
			} else if (floorOffset < 2.0) {
				floorColor1 = uColor2; // 蓝青
				floorColor2 = uColor3; // 青色
			} else {
				floorColor1 = uColor3; // 青色
				floorColor2 = uColor1; // 深蓝
			}
			
			// 楼层内渐变
			vec3 baseColor = mix(floorColor1, floorColor2, floorProgress);
			
			// 楼层间平滑过渡
			float nextFloorProgress = smoothstep(1.0 - uFloorBlend, 1.0, floorProgress);
			vec3 nextFloorColor1, nextFloorColor2;
			float nextFloorOffset = mod(floorIndex + 1.0 + alternatePhase * 3.0, 3.0);
			
			if (nextFloorOffset < 1.0) {
				nextFloorColor1 = uColor1;
				nextFloorColor2 = uColor2;
			} else if (nextFloorOffset < 2.0) {
				nextFloorColor1 = uColor2;
				nextFloorColor2 = uColor3;
			} else {
				nextFloorColor1 = uColor3;
				nextFloorColor2 = uColor1;
			}
			
			vec3 nextFloorColor = mix(nextFloorColor1, nextFloorColor2, 0.0);
			baseColor = mix(baseColor, nextFloorColor, nextFloorProgress);
			
			// 边缘发光
			float edgeGlow = 1.0 - abs(dot(normal, vec3(0.0, 1.0, 0.0)));
			edgeGlow = pow(edgeGlow, 1.5);
			
			// 时间动画
			float timeEffect = sin(uTime * 0.5) * 0.5 + 0.5;
			
			// 边缘高光
			baseColor = mix(baseColor, vec3(0.4, 0.8, 1.0), edgeGlow * timeEffect * 0.3);
			
			// 竖向条纹
			float x = vUv.x + uTime * uStripeSpeed * 0.1;
			float stripe = abs(sin(x * 3.1415926 * uStripeDensity));
			stripe = smoothstep(1.0 - uStripeWidth, 1.0, stripe);
			stripe *= uStripeIntensity;
			
			// 中央亮带
			float y = (vPosition.y) / 14.0;
			float band = smoothBand(y, uBandCenter, uBandWidth) * uBandIntensity;
			
			// 发光叠加
			float glow = edgeGlow * uGlowIntensity * (0.8 + 0.2 * timeEffect);
			glow += band * 0.6;
			glow += stripe * 0.4;
			
			// 最终颜色合成
			vec3 finalColor = baseColor + stripe * vec3(0.5, 0.9, 1.0) * 0.4 + band * vec3(0.7, 1.0, 1.0) * 0.6;
			finalColor += glow * vec3(1.0);
			
			float alpha = 0.9 + 0.1 * glow;
			gl_FragColor = vec4(finalColor, alpha);
		}
	`;

    // 创建材质
    const material = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0.0 },
            uColor1: { value: { x: 0.02, y: 0.08, z: 0.40 } },  // 楼层1：深蓝
            uColor2: { value: { x: 0.00, y: 0.40, z: 0.80 } },  // 楼层2：蓝青
            uColor3: { value: { x: 0.00, y: 0.80, z: 1.00 } },  // 楼层3：青色
            uGlowIntensity: { value: 0.9 },
            uFloorHeight: { value: 2.5 },        // 每层楼高度
            uFloorBlend: { value: 0.3 },         // 楼层间渐变过渡
            uAlternateSpeed: { value: 0.3 },     // 交替动画速度
            // 条纹参数
            uStripeDensity: { value: 140.0 },
            uStripeWidth: { value: 0.955 },
            uStripeSpeed: { value: 1.0 },
            uStripeIntensity: { value: 0.5 },
            // 中央亮带参数
            uBandCenter: { value: 0.0 },
            uBandWidth: { value: 0.25 },
            uBandIntensity: { value: 0.8 },
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        transparent: true,
        side: THREE.DoubleSide,
        depthTest: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    let time = 0.0;
    let rafId = 0;
    function animate() {
        time += 0.016;
        material.uniforms.uTime.value = time;
        rafId = requestAnimationFrame(animate);
    }
    animate();

    const originalDispose = material.dispose.bind(material);
    material.dispose = function () {
        try { cancelAnimationFrame(rafId); } catch (e) { }
        originalDispose();
    };

    return material;
};