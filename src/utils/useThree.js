import { Three3D } from "./three.js";
import { createSceneLighting } from "./lightThree.js";
import {
    loadGltf,
    getModel,
    loadFbx,
    Patrol,
    createLine,
    getActions,
    playActiveAction,
    createFace,
    pointInThis,
    setGeometryStyle,
} from "./modelThree.js";
import { createLabel } from "./SpriteThree.js";
import DeviceSpriteDom from "./device.js";
import { circleShader, officeFlowShader, officeGlowShader, modelOutlineShader } from "./shader.js";
import * as THREE from "three";
const TWEEN = window.TWEEN;
import { ref, onBeforeUnmount } from "vue";

// 导入模块化功能
import { createAndAddFlowLines, setThreeTestInstance, flowLinesControlPanel } from "./flowLines.js";

let threeTest;
let isDisposed = false;

const resize = () => {
    if (!threeTest) return;
    threeTest.resize();
};

// 初始化3D场景
const initThree = (id) => {
    threeTest = new Three3D(id).init();
    try { window.__three = threeTest; } catch (e) { }
    threeTest.setNightSkybox(); // 设置夜晚天空盒背景
    // 覆盖天空背景为深冷蓝（与雾色 0x0a1624 搭配）
    try { threeTest.scene.background = new THREE.Color(0x071827); } catch (e) { }
    try { threeTest.renderer && threeTest.renderer.setClearColor && threeTest.renderer.setClearColor(0x071827, 1); } catch (e) { }

    // 创建夜晚场景光照系统
    const nightLighting = createSceneLighting("城市冷蓝夜景", {
        // 环境光 - 科技感暗蓝环境光
        ambient: {
            color: 0x0a1624,
            intensity: 0.35
        },
        // 方向光 - 科技感月光
        directional: {
            color: 0x6aa7ff,
            intensity: 0.5,
            position: { x: -60, y: 110, z: -30 }
        },
        // 半球光 - 科技感天空和地面反射
        hemisphere: {
            skyColor: 0x0a1624,
            groundColor: 0x02060d,
            intensity: 0.35
        },
        // 科技感环境点光源（移除与路灯重叠的光源）
        pointLights: []
    });

    // 添加夜晚光照系统
    threeTest.addScene(nightLighting.lights);
    // 添加光照目标对象
    nightLighting.targets.forEach(target => {
        threeTest.addScene(target);
    });


    // 启用阴影
    threeTest.renderer.shadowMap.enabled = true;
    threeTest.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 为环境点光源添加阴影（仅保留第一个光源投影，避免纹理单元超限）
    nightLighting.lights.children.forEach((child, idx) => {
        if (child.type === 'PointLight') {
            const enableShadow = idx === 0; // 仅第一个环境光源开启阴影
            child.castShadow = enableShadow;
            if (enableShadow) {
                child.shadow.mapSize.width = 1024;
                child.shadow.mapSize.height = 1024;
                child.shadow.camera.near = 0.5;
                child.shadow.camera.far = 50;
            }
        }
    });

    // 创建厂房室内灯光
    const workshopLightGroup = new THREE.Group();
    workshopLightGroup.name = "厂房室内灯光";

    // 厂房灯光配置 - 增强亮度以便透过窗户看到
    const workshopLights = [
        {
            color: 0xe6f3ff,  // 科技蓝白主灯
            intensity: 8.0,    // 大幅增加强度，让灯光透过窗户
            distance: 60,      // 增加距离，覆盖更大范围
            decay: 0.5,        // 减少衰减，让灯光传播更远
            position: { x: 50, y: 15, z: 0 }  // 厂房中心顶部
        },
        {
            color: 0xccf2ff,  // 科技青白侧灯
            intensity: 6.0,    // 大幅增加强度
            distance: 50,      // 增加距离
            decay: 0.5,        // 减少衰减
            position: { x: 35, y: 12, z: 0 }  // 厂房左侧
        },
        {
            color: 0xccf2ff,  // 科技青白侧灯
            intensity: 6.0,    // 大幅增加强度
            distance: 50,      // 增加距离
            decay: 0.5,        // 减少衰减
            position: { x: 65, y: 12, z: 0 }  // 厂房右侧
        },
        {
            color: 0xb3e6ff,  // 科技冷白工作灯
            intensity: 7.0,    // 大幅增加强度
            distance: 45,      // 增加距离
            decay: 0.5,        // 减少衰减
            position: { x: 50, y: 8, z: 15 }  // 厂房前部
        },
        {
            color: 0xb3e6ff,  // 科技冷白工作灯
            intensity: 7.0,    // 大幅增加强度
            distance: 45,      // 增加距离
            decay: 0.5,        // 减少衰减
            position: { x: 50, y: 8, z: -15 }  // 厂房后部
        }
    ];

    // 创建厂房灯光（关闭点光阴影，减少阴影贴图数量）
    workshopLights.forEach((lightConfig, index) => {
        const pointLight = new THREE.PointLight(
            lightConfig.color,
            lightConfig.intensity,
            lightConfig.distance,
            lightConfig.decay
        );
        pointLight.position.set(
            lightConfig.position.x,
            lightConfig.position.y,
            lightConfig.position.z
        );
        pointLight.name = `厂房灯${index + 1}`;

        // 关闭阴影，避免占用纹理单元
        pointLight.castShadow = false;

        // 设置灯光属性
        pointLight.intensity = lightConfig.intensity;
        pointLight.distance = lightConfig.distance;
        pointLight.decay = lightConfig.decay;

        // 体积光标记（无实际渲染影响）
        pointLight.volumetric = true;

        workshopLightGroup.add(pointLight);
    });

    // 添加厂房灯光到场景
    threeTest.addScene(workshopLightGroup);

    // 添加厂房内部环境光，让整体更亮
    const workshopAmbient = new THREE.AmbientLight(0x1a2a3a, 0.8);
    workshopAmbient.position.set(50, 10, 0);
    workshopAmbient.name = "厂房环境光";
    threeTest.addScene(workshopAmbient);

    // 创建一个地板 - 科技感暗色系
    const geometry = new THREE.CircleGeometry(500, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0x001a33 });
    // 避免与模型底面共面引起的闪烁（Z-Fighting）
    material.polygonOffset = true;
    material.polygonOffsetFactor = 1;
    material.polygonOffsetUnits = 1;
    const circle = new THREE.Mesh(geometry, material);
    circle.rotateX(-Math.PI / 2);
    // 稍微下沉地板，减少与模型地面重叠
    circle.position.y = -0.05;
    // 启用阴影接收
    circle.receiveShadow = true;
    threeTest.addScene(circle);

    // 设置点击事件监听器
    threeTest.setClickHandler(handleSceneClick);

    window.addEventListener("resize", resize);
    // 加载模型
    addGltf(gltfModelList); // 场景
    addGltf(patrolPartyList); // 人物
    copyModel(); // 同一模型模型批量加载 =>设备
    // 加载标签
    addLabel();
    // 添加围栏
    addFace();

    // 创建办公楼专用流光效果
    const officeFlow = createOfficeFlow();
    threeTest.addScene(officeFlow);

    // 创建办公楼发光效果
    const officeGlow = createOfficeGlow();
    threeTest.addScene(officeGlow);

    // 创建楼顶光照系统
    const createRoofLighting = () => {
        const roofLightGroup = new THREE.Group();
        roofLightGroup.name = "楼顶光照系统";

        // 楼顶中心主光源 - 不投影，保留聚光灯投影
        const roofMainLight = new THREE.PointLight(0x00ccff, 3.0, 40, 0.8);
        roofMainLight.position.set(-40, 14, 0); // 办公楼顶部中心，降低高度
        roofMainLight.name = "楼顶主光源";
        roofMainLight.castShadow = false; // 关闭点光阴影
        roofLightGroup.add(roofMainLight);

        // 楼顶左侧渐变光源 - 增强强度
        const roofLeftLight1 = new THREE.PointLight(0x0088ff, 2.0, 35, 0.9);
        roofLeftLight1.position.set(-51, 14, 0);
        roofLeftLight1.name = "楼顶左侧光源1";
        roofLightGroup.add(roofLeftLight1);

        const roofLeftLight2 = new THREE.PointLight(0x0066cc, 1.5, 30, 1.0);
        roofLeftLight2.position.set(-58, 14, 0);
        roofLeftLight2.name = "楼顶左侧光源2";
        roofLightGroup.add(roofLeftLight2);

        // 楼顶右侧渐变光源 - 增强强度
        const roofRightLight1 = new THREE.PointLight(0x0088ff, 2.0, 35, 0.9);
        roofRightLight1.position.set(-29, 14, 0);
        roofRightLight1.name = "楼顶右侧光源1";
        roofLightGroup.add(roofRightLight1);

        const roofRightLight2 = new THREE.PointLight(0x0066cc, 1.5, 30, 1.0);
        roofRightLight2.position.set(-22, 14, 0);
        roofRightLight2.name = "楼顶右侧光源2";
        roofLightGroup.add(roofRightLight2);

        // 楼顶前部渐变光源 - 增强强度
        const roofFrontLight1 = new THREE.PointLight(0x00aaff, 1.8, 32, 0.9);
        roofFrontLight1.position.set(-40, 14, 9);
        roofFrontLight1.name = "楼顶前部光源1";
        roofLightGroup.add(roofFrontLight1);

        const roofFrontLight2 = new THREE.PointLight(0x0088ff, 1.2, 28, 1.0);
        roofFrontLight2.position.set(-40, 14, 15);
        roofFrontLight2.name = "楼顶前部光源2";
        roofLightGroup.add(roofFrontLight2);

        // 楼顶后部渐变光源 - 增强强度
        const roofBackLight1 = new THREE.PointLight(0x00aaff, 1.8, 32, 0.9);
        roofBackLight1.position.set(-40, 14, -9);
        roofBackLight1.name = "楼顶后部光源1";
        roofLightGroup.add(roofBackLight1);

        const roofBackLight2 = new THREE.PointLight(0x0088ff, 1.2, 28, 1.0);
        roofBackLight2.position.set(-40, 14, -15);
        roofBackLight2.name = "楼顶后部光源2";
        roofLightGroup.add(roofBackLight2);

        // 添加更多楼顶光源以增强效果
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

        // 楼顶环境光 - 增强强度
        const roofAmbient = new THREE.AmbientLight(0x004466, 0.8);
        roofAmbient.position.set(-40, 14, 0);
        roofAmbient.name = "楼顶环境光";
        roofLightGroup.add(roofAmbient);

        // 添加一个聚光灯从上方照射楼顶（仅保留该投影）
        const roofSpotLight = new THREE.SpotLight(0x00ccff, 2.0, 50, Math.PI / 6, 0.5, 1.0);
        roofSpotLight.position.set(-40, 25, 0);
        roofSpotLight.target.position.set(-40, 14, 0);
        roofSpotLight.name = "楼顶聚光灯";
        roofSpotLight.castShadow = true;
        roofSpotLight.shadow.mapSize.width = 1024;
        roofSpotLight.shadow.mapSize.height = 1024;
        roofLightGroup.add(roofSpotLight);
        roofLightGroup.add(roofSpotLight.target);

        // console.log('楼顶光照系统已创建:', roofLightGroup);
        // console.log('楼顶光源数量:', roofLightGroup.children.length);
        // console.log('楼顶主光源强度:', roofMainLight.intensity);
        // console.log('楼顶主光源位置:', roofMainLight.position);

        // 详细输出每个光源的信息
        // roofLightGroup.children.forEach((light, index) => {
        //     console.log(`楼顶光源${index + 1}:`, {
        //         name: light.name,
        //         type: light.type,
        //         intensity: light.intensity,
        //         position: light.position,
        //         color: light.color ? '#' + light.color.getHexString() : 'N/A'
        //     });
        // });

        return roofLightGroup;
    };

    // 添加楼顶光照系统到场景
    const roofLighting = createRoofLighting();
    threeTest.addScene(roofLighting);

    // 创建路灯灯光环境
    const createStreetLighting = () => {
        const streetLightGroup = new THREE.Group();
        streetLightGroup.name = "路灯灯光环境";

        // 路灯主光源 - 从路灯顶部向下照射
        const streetMainLight = new THREE.SpotLight(0xffffff, 2.5, 25, Math.PI / 4, 0.3, 1.0);
        streetMainLight.position.set(15, 8, 40); // 路灯顶部位置
        streetMainLight.target.position.set(15, 0, 40); // 照射地面
        streetMainLight.name = "路灯主光源";
        streetMainLight.castShadow = true;
        streetMainLight.shadow.mapSize.width = 1024;
        streetMainLight.shadow.mapSize.height = 1024;
        streetMainLight.shadow.camera.near = 0.5;
        streetMainLight.shadow.camera.far = 30;
        streetLightGroup.add(streetMainLight);
        streetLightGroup.add(streetMainLight.target);

        // 路灯环境光 - 营造温暖的光晕效果
        const streetAmbient = new THREE.PointLight(0xffcc44, 1.2, 15, 1.5);
        streetAmbient.position.set(15, 6, 40);
        streetAmbient.name = "路灯环境光";
        streetAmbient.castShadow = false;
        streetLightGroup.add(streetAmbient);

        // 路灯周围地面光晕 - 模拟地面反射
        const streetGroundLight = new THREE.PointLight(0xffdd66, 0.8, 12, 2.0);
        streetGroundLight.position.set(15, 1, 40);
        streetGroundLight.name = "路灯地面光晕";
        streetGroundLight.castShadow = false;
        streetLightGroup.add(streetGroundLight);

        // 路灯侧面补光 - 营造立体感
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

        // 路灯前方道路照明
        const streetFrontLight = new THREE.SpotLight(0xffaa00, 1.5, 20, Math.PI / 6, 0.4, 1.0);
        streetFrontLight.position.set(15, 6, 40);
        streetFrontLight.target.position.set(15, 0, 50); // 向前照射
        streetFrontLight.name = "路灯前方照明";
        streetFrontLight.castShadow = false;
        streetLightGroup.add(streetFrontLight);
        streetLightGroup.add(streetFrontLight.target);

        // 路灯后方道路照明
        const streetBackLight = new THREE.SpotLight(0xffaa00, 1.5, 20, Math.PI / 6, 0.4, 1.0);
        streetBackLight.position.set(15, 6, 40);
        streetBackLight.target.position.set(15, 0, 30); // 向后照射
        streetBackLight.name = "路灯后方照明";
        streetBackLight.castShadow = false;
        streetLightGroup.add(streetBackLight);
        streetLightGroup.add(streetBackLight.target);

        return streetLightGroup;
    };

    // 添加路灯灯光环境到场景
    const streetLighting = createStreetLighting();
    threeTest.addScene(streetLighting);

    // 创建楼顶横向渐变平面
    const createRoofGradient = () => {
        // 创建楼顶地板几何体（使用BoxGeometry而不是PlaneGeometry）
        const roofGeometry = new THREE.BoxGeometry(44.5, 0.5, 19); // 楼顶地板，很薄
        const roofMaterial = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0.0 },
                uColor1: { value: { x: 0.20, y: 0.05, z: 0.40 } },  // 左侧深紫色
                uColor2: { value: { x: 0.40, y: 0.15, z: 0.60 } },  // 右侧亮紫色
                uGradientSpeed: { value: 0.5 },  // 渐变动画速度
                uGradientWidth: { value: 1.0 },  // 渐变宽度
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
                    
                    // 横向渐变（从左到右）
                    float gradient = uv.x;
                    
                    // 添加动画效果
                    float animation = sin(uTime * uGradientSpeed) * 0.2 + 0.5;
                    gradient = mix(gradient, animation, 0.4);
                    
                    // 应用渐变宽度控制
                    gradient = smoothstep(0.0, uGradientWidth, gradient);
                    
                    // 颜色混合
                    vec3 color = mix(uColor1, uColor2, gradient);
                    
                    // 添加边缘发光效果（暗紫色调）
                    float edge = 1.0 - abs(uv.x - 0.5) * 2.0;
                    edge = pow(edge, 1.5);
                    color += edge * vec3(0.3, 0.1, 0.5) * 0.6;
                    
                    // 添加一些波动效果
                    float wave = sin(uv.x * 8.0 + uTime * 3.0) * 0.15 + 0.85;
                    color *= wave;
                    
                    // 降低整体亮度
                    color *= 0.8;
                    
                    float alpha = 1.0; // 完全不透明
                    gl_FragColor = vec4(color, alpha);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending
        });

        // 创建楼顶地板
        const roofGradient = new THREE.Mesh(roofGeometry, roofMaterial);
        roofGradient.name = "楼顶地板渐变";
        roofGradient.position.set(-40, 14.5, 0); // 放置在楼顶位置

        // 添加动画
        let time = 0.0;
        let rafId = 0;
        function animate() {
            time += 0.016;
            roofMaterial.uniforms.uTime.value = time;
            rafId = requestAnimationFrame(animate);
        }
        animate();

        // 清理函数
        const originalDispose = roofMaterial.dispose.bind(roofMaterial);
        roofMaterial.dispose = function () {
            try { cancelAnimationFrame(rafId); } catch (e) { }
            originalDispose();
        };

        // console.log('楼顶地板渐变已创建:', roofGradient);
        // console.log('楼顶地板位置:', roofGradient.position);
        // console.log('楼顶地板尺寸:', roofGeometry.parameters);
        // console.log('楼顶地板材质:', roofMaterial);
        // console.log('楼顶地板颜色1:', roofMaterial.uniforms.uColor1.value);
        // console.log('楼顶地板颜色2:', roofMaterial.uniforms.uColor2.value);

        return roofGradient;
    };

    // 添加楼顶横向渐变平面到场景
    const roofGradient = createRoofGradient();
    threeTest.addScene(roofGradient);

    // 创建并添加流光线条
    createAndAddFlowLines(threeTest);

    // 设置流光线条控制面板的Three.js实例引用
    setThreeTestInstance(threeTest);
    // 控制流光线条
    // flowLinesControlPanel.show();           // 显示
    // flowLinesControlPanel.hide();           // 隐藏
    // flowLinesControlPanel.toggle();         // 切换显示/隐藏
    flowLinesControlPanel.enableAwesome();  // 启用炫酷模式

};

// ==================== 场景交互函数 ====================

// 场景点击事件处理函数
const handleSceneClick = (event, intersects) => {
    if (intersects && intersects.length > 0) {
        const selected = intersects[0];
        const point = selected.point;

        // 获取点击位置的坐标信息
        const coordinates = {
            x: Math.round(point.x * 100) / 100,
            y: Math.round(point.y * 100) / 100,
            z: Math.round(point.z * 100) / 100
        };

        // 获取点击的对象信息
        const clickedObject = selected.object;
        const objectInfo = {
            name: clickedObject.name || '未命名对象',
            type: clickedObject.type || '未知类型',
            position: {
                x: Math.round(clickedObject.position.x * 100) / 100,
                y: Math.round(clickedObject.position.y * 100) / 100,
                z: Math.round(clickedObject.position.z * 100) / 100
            }
        };

        // 在控制台输出坐标信息
        // console.log('=== 场景点击信息 ===');
        // console.log('点击位置坐标:', coordinates);
        // console.log('点击对象信息:', objectInfo);
        // console.log('==================');

        // 显示坐标信息到页面上（可选）
        showCoordinatesInfo(coordinates, objectInfo);
    }
};

// 显示坐标信息到页面上
const showCoordinatesInfo = (coordinates, objectInfo) => {
    // 创建或更新坐标信息显示
    let infoDiv = document.getElementById('coordinates-info');
    if (!infoDiv) {
        infoDiv = document.createElement('div');
        infoDiv.id = 'coordinates-info';
        infoDiv.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 300px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 15px;
            border-radius: 8px;
            font-family: Arial, sans-serif;
            font-size: 14px;
            z-index: 10000;
            min-width: 250px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        `;
        document.body.appendChild(infoDiv);
    }

    infoDiv.innerHTML = `
        <div style="margin-bottom: 10px; font-weight: bold; color: #00ffff;">场景坐标信息</div>
        <div style="margin-bottom: 8px;">
            <strong>点击位置:</strong><br>
            X: ${coordinates.x}<br>
            Y: ${coordinates.y}<br>
            Z: ${coordinates.z}
        </div>
        <div style="margin-bottom: 8px;">
            <strong>点击对象:</strong><br>
            名称: ${objectInfo.name}<br>
            类型: ${objectInfo.type}
        </div>
        <div style="margin-bottom: 8px;">
            <strong>对象位置:</strong><br>
            X: ${objectInfo.position.x}<br>
            Y: ${objectInfo.position.y}<br>
            Z: ${objectInfo.position.z}
        </div>
        <div style="font-size: 12px; color: #aaa; text-align: center;">
            点击场景任意位置获取坐标
        </div>
    `;

    // 3秒后自动隐藏
    setTimeout(() => {
        if (infoDiv && infoDiv.parentNode) {
            infoDiv.style.opacity = '0';
            infoDiv.style.transition = 'opacity 0.5s';
            setTimeout(() => {
                if (infoDiv && infoDiv.parentNode) {
                    infoDiv.parentNode.removeChild(infoDiv);
                }
            }, 500);
        }
    }, 3000);
};

// 销毁 three 实例与事件
const disposeThree = () => {
    isDisposed = true;
    try { clearTimeout(time); } catch (e) { }
    try { window.removeEventListener("resize", resize); } catch (e) { }
    try { threeTest && threeTest.dispose && threeTest.dispose(); } catch (e) { }
    try { p && p.stop && p.stop(); } catch (e) { }
    try { p = null; } catch (e) { }
    try { threeTest = null; } catch (e) { }
};

onBeforeUnmount(() => {
    disposeThree();
});

// 加载设备模型
const deviceList = ref([]);
const copyModel = () => {
    deviceList.value = [];
    // 生成6行12列设备
    let id = 0;
    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 12; j++) {
            id++;
            deviceList.value.push({
                id: id,
                name: `设备${id}`,
                position: { x: 25 + j * 4, y: 0.1, z: -12 + i * 4 },
                rotation: { x: 0, y: 0, z: 0 },
                state: Math.round(Math.random()),
            });
        }
    }
    // 生成一个设备标签组
    const labelGroup = new THREE.Group();
    labelGroup.name = "devLabel";
    threeTest.addScene(labelGroup);
    loadGltf("gltf/device.gltf", "")
        .then((gltf) => {
            for (let i = 0; i < deviceList.value.length; i++) {
                const { name, id, position, state } = deviceList.value[i];
                const model = gltf.scene.clone();
                model.name = name;
                setModel(model, gltf.animations, deviceList.value[i]);

                const box = createLabel({
                    name: `设备标签${id}`,
                    type: "CSS2DObject",
                    element: new DeviceSpriteDom(
                        state === 1 ? "#3ac9a2" : "#ff4137",
                        `设备${id}`,
                    ).getElement(),
                });
                box.position.set(position.x, position.y + 3, position.z);
                labelGroup.add(box);
            }
        })
        .catch((err) => {
            console.error("设备模型加载失败", err);
        });
};

// gltf模型数组
const gltfModelList = [
    {
        url: "gltf/office_1.gltf",
        type: "gltf",
        name: "办公楼",
        playAction: "",
        position: { x: -40, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
    },
    {
        url: "gltf/workshop_2.gltf",
        type: "gltf",
        name: "厂房",
        playAction: "",
        position: { x: 50, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        callback: () => setWorkshopGlassOpacity(currentWorkshopGlassOpacity),
    },
    {
        url: "gltf/street_lamp.gltf",
        type: "gltf",
        name: "路灯1",
        playAction: "",
        position: { x: 15, y: 0, z: 40 },
        rotation: { x: 0, y: 0, z: 0 },
    },
    {
        url: "gltf/parterre.gltf",
        type: "gltf",
        name: "花坛1",
        playAction: "",
        position: { x: 15, y: 0, z: 40 },
        rotation: { x: 0, y: 0, z: 0 },
    },
    {
        url: "gltf/cat.gltf",
        type: "gltf",
        name: "猫",
        playAction: "",
        position: { x: 10, y: 0, z: 40 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: 10,
    },
    {
        url: "gltf/electric.gltf",
        type: "gltf",
        name: "电箱",
        playAction: "",
        position: { x: 40, y: 0, z: 40 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: 1,
        callback: () => createModelOutline("电箱"),
    },
    {
        url: "gltf/road_1.gltf",
        type: "gltf",
        name: "路1",
        playAction: "",
        position: { x: 0, y: 0, z: 20 },
        rotation: { x: 0, y: (Math.PI / 180) * 90, z: 0 },
        scale: 1,
    },
    {
        url: "gltf/road_2.gltf",
        type: "gltf",
        name: "路2",
        playAction: "",
        position: { x: -43, y: 0, z: 20 },
        rotation: { x: 0, y: (Math.PI / 180) * 90, z: 0 },
        scale: 1,
    },
];

// 加载场景模型
const actionsMap = new Map(); // 动画

// 厂房玻璃透明度控制
let currentWorkshopGlassOpacity = 0.3;
function isGlassName(name) {
    if (!name) return false;
    return /glass|window|Mat3d66-9137221-115-23866|玻璃|窗/i.test(name);
}
function setOpacityForMaterial(material, opacity) {
    if (!material) return;
    const applyOne = (m) => {
        if (!m) return;
        m.transparent = true;
        m.opacity = opacity;
        m.depthWrite = false;
        m.side = THREE.DoubleSide;
        m.needsUpdate = true;
    };
    if (Array.isArray(material)) {
        material.forEach(applyOne);
    } else {
        applyOne(material);
    }
}
function applyWorkshopGlassOpacity(root, opacity) {
    if (!root) return;
    root.traverse((child) => {
        if (child && child.isMesh && child.material) {
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            const looksLikeGlass = mats.some((m) => {
                if (!m) return false;
                if (isGlassName(m.name)) return true;
                // 通过已有透明属性或很低粗糙度猜测玻璃
                return (m.transparent === true) || (typeof m.opacity === 'number' && m.opacity < 1.0) || (typeof m.roughness === 'number' && m.roughness < 0.15);
            });
            if (looksLikeGlass) {
                setOpacityForMaterial(child.material, opacity);
            }
        }
    });
}

const setWorkshopGlassOpacity = (opacity) => {
    currentWorkshopGlassOpacity = Math.min(1, Math.max(0, Number(opacity)));
    const workshop = getModel("厂房", threeTest.scene);
    if (workshop) {
        applyWorkshopGlassOpacity(workshop, currentWorkshopGlassOpacity);
    } else {
        console.warn("未找到‘厂房’模型，稍后加载完成将自动应用透明度");
    }
};

const setModel = (model, animations, params) => {
    if (isDisposed) return; // 避免销毁后继续添加
    model.position.set(params.position.x, params.position.y, params.position.z);
    model.rotation.set(params.rotation.x, params.rotation.y, params.rotation.z);
    if (params.scale) {
        model.scale.set(params.scale, params.scale, params.scale);
    }
    // 判断模型是否带有动画
    if (animations && animations.length > 0) {
        const { actions, mixerArray } = getActions(animations, model);
        threeTest.addModel(model, mixerArray);
        actionsMap.set(params.name, actions);
        if (params.playAction) {
            playActiveAction(actions, params.playAction, true, THREE.LoopRepeat);
        }
    } else {
        threeTest.addModel(model);
    }

    // 如果是厂房，自动应用玻璃透明度
    if (params.name === "厂房") {
        try { applyWorkshopGlassOpacity(model, currentWorkshopGlassOpacity); } catch (e) { }
    }

    // 加载完后的回调函数，自定义加载完模型后的操作
    // 延迟执行回调，确保模型完全添加到场景中
    if (params.callback) {
        setTimeout(() => {
            if (!isDisposed) params.callback(threeTest);
        }, 100);
    }
};

const addGltf = (modelList) => {
    modelList.forEach((gltfList) => {
        if (isDisposed) return;
        // 加载gltf模型
        if (gltfList.type === "gltf") {
            loadGltf(gltfList.url, gltfList.name)
                .then((gltf) => {
                    if (isDisposed) return;
                    setModel(gltf.scene, gltf.animations, gltfList);
                })
                .catch((err) => {
                    console.error("场景模型加载失败", gltfList.url, err);
                });
        } else {
            // 加载fbx模型
            loadFbx(gltfList.url, gltfList.name)
                .then((fbx) => {
                    if (isDisposed) return;
                    setModel(fbx, fbx.animations, gltfList);
                })
                .catch((err) => {
                    console.error("FBX模型加载失败", gltfList.url, err);
                });
        }
    });
};

// 这里将Patrol放外面为了控制暂停和播放
let p;
let inFace = false;
let isFirstPerson = false;
let time;
const personPatrol = (threeTest) => {
    const array = [
        { x: -55.08, y: 0.1, z: 15.45 },
        { x: -5.66, y: 0.1, z: 14.78 },
        { x: -5.3, y: 0.1, z: -7.37 },
        { x: 4.15, y: 0.1, z: -7.55 },
        { x: 5.03, y: 0.1, z: 20.44 },
        { x: 57.4, y: 0.1, z: 22.28 },
        { x: 57.19, y: 0.1, z: 33.91 },
        { x: -48.2, y: 0.1, z: 30.5 },
        { x: -55.08, y: 0.1, z: 15.45 },
    ];
    const lint = createLine(array, "线1");
    lint.visible = false;
    threeTest.addScene(lint);
    p = new Patrol(
        {
            three3D: threeTest,
            coordArray: array,
            meshName: "机器人1",
            isFirstPerson: isFirstPerson,
            factor: 1,
            rotation: {
                x: 0,
                y: (Math.PI / 180) * 180,
                z: 0,
            },
        },
        (done, value) => {
            if (isDisposed) return;
            if (done) {
                p.reset();
                p.run();
            } else {
                const flag = pointInThis(value, faceList);
                if (flag === inFace) return;
                inFace = flag;
                if (inFace) {
                    setGeometryStyle("围栏", "rgb(255, 64, 95)", threeTest);
                    showPatrol();
                    time = setTimeout(() => {
                        if (isDisposed) return;
                        showPatrol();
                    }, 5000);
                } else {
                    setGeometryStyle("围栏", "rgb(51, 188, 176)", threeTest);
                }
            }
        },
    );
    p.run();
};

let patrolStatus = false;
const showPatrol = () => {
    clearTimeout(time);
    if (!p) {
        console.warn("Patrol 未初始化，无法切换巡逻状态");
        return;
    }
    const actions = actionsMap.get("机器人1");
    if (!actions) {
        console.warn("未找到机器人1的动画，无法切换巡逻状态");
        return;
    }

    playActiveAction(actions, "Run", p.isStop, THREE.LoopRepeat);
    playActiveAction(actions, "Idle", !p.isStop, THREE.LoopRepeat);
    !p.isStop ? p.stop() : p.run();
    //  ===========   ↓↓↓   ================
    // if (!p.isStop) {
    // playActiveAction(actions, "Run", false, THREE.LoopRepeat);
    // playActiveAction(actions, "Idle", true, THREE.LoopRepeat);
    // p.stop();
    // } else {
    // playActiveAction(actions, "Run", true, THREE.LoopRepeat);
    // playActiveAction(actions, "Idle", false, THREE.LoopRepeat);
    // p.run();
    // }
    patrolStatus = p.isStop;
};

const personPatrol_2 = (threeTest) => {
    // 巡逻路线点坐标
    const array = [
        { x: -75.96, y: 0.1, z: 47.16 },
        { x: -21.6, y: 0.1, z: 48.44 },
        { x: -9.39, y: 0.1, z: 48.27 },
        { x: -6.52, y: 0.1, z: 28.42 },
        { x: -4.78, y: 0.1, z: -14.94 },
        { x: 4.9, y: 0.1, z: -15 },
        { x: 5.21, y: 0.1, z: 17.41 },
        { x: 6.42, y: 0.1, z: 42.17 },
        { x: 18.94, y: 0.1, z: 47.78 },
        { x: 69.62, y: 0.1, z: 48.31 },
        { x: 69.22, y: 0.1, z: 58.25 },
        { x: 33.06, y: 0.1, z: 59.59 },
        { x: 13.88, y: 0.1, z: 59.29 },
        { x: -45.34, y: 0.1, z: 57.61 },
        { x: -71.48, y: 0.1, z: 56.75 },
        { x: -75.96, y: 0.1, z: 47.16 },
    ];
    const lint = createLine(array, "线2");
    lint.visible = false;
    threeTest.addScene(lint);
    // 使用着色器添加跟随
    const mesh = addShader();
    const fatherMesh = getModel("机器人0", threeTest.scene);
    fatherMesh?.add(mesh);
    const p = new Patrol(
        {
            three3D: threeTest,
            coordArray: array,
            meshName: "机器人0",
            isFirstPerson: false,
            factor: 1,
            rotation: {
                x: 0,
                y: (Math.PI / 180) * 180,
                z: 0,
            },
        },
        (done) => {
            if (isDisposed) return;
            if (done) {
                p.reset();
                p.run();
            }
        },
    );
    p.run();
};

// 着色器
const addShader = () => {
    const geometry = new THREE.CircleGeometry(2, 32);
    const material = circleShader();
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = Math.PI / 2;
    return mesh;
};

// 加载人员模型
const patrolPartyList = [
    {
        id: 0,
        url: "gltf/Soldier.glb",
        type: "gltf",
        name: "机器人0",
        playAction: "Run",
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 1, y: (Math.PI / 180) * 180, z: 0 },
        callback: personPatrol_2,
    },
    {
        id: 1,
        url: "gltf/Soldier.glb",
        type: "gltf",
        name: "机器人1",
        playAction: "Run",
        position: { x: 3, y: 0, z: 0 },
        callback: personPatrol,
        rotation: { x: 0, y: (Math.PI / 180) * 270, z: 0 },
    },
    {
        id: 2,
        url: "fbx/Through.fbx",
        type: "fbx",
        name: "机器人2",
        playAction: "mixamo.com",
        position: { x: 10, y: 0, z: 40 },
        callback: personPatrol,
        scale: 0.01,
        rotation: { x: 0, y: 0, z: 0 },
    },
];

// 标签数组
const labelList = [
    {
        color: "#3ac9b0",
        name: "电箱标签",
        value: "电箱",
        position: { x: 40, y: 5, z: 40 },
        scale: 1,
    },
    {
        color: "#3ac9b0",
        name: "办公楼标签",
        value: "办公楼",
        position: { x: -40, y: 15, z: 0 },
        scale: 1,
    },
    {
        color: "#3ac9b0",
        name: "厂房标签",
        value: "厂房",
        position: { x: 50, y: 12, z: 0 },
        scale: 1,
    },
];

const addLabel = () => {
    labelList.forEach((label) => {
        const box = createLabel({
            name: label.name,
            type: "CSS2DObject",
            element: new DeviceSpriteDom(label.color, label.value).getElement(),
        });
        box.scale.set(label.scale, label.scale, label.scale);
        box.position.set(label.position.x, label.position.y, label.position.z);
        threeTest.addScene(box);
    });
};

// 围栏添加
const faceList = [
    { x: -26.69, y: 0.1, z: 14.62 },
    { x: -15.78, y: 0.1, z: 15.53 },
    { x: -15.37, y: 0.1, z: 32.6 },
    { x: -26.99, y: 0.1, z: 30.22 },
    { x: -26.69, y: 0.1, z: 14.62 },
];

const addFace = () => {
    const mesh = createFace(faceList, "rgb(51, 188, 176)");
    mesh.name = "围栏";
    mesh.rotation.x = Math.PI / 2;
    mesh.position.y = 0.1;
    threeTest.addScene(mesh);
};

// 创建办公楼专用流光效果
const createOfficeFlow = () => {
    // 创建围绕办公楼的矩形流光边框
    const geometry = new THREE.PlaneGeometry(50, 50);

    // 使用专门的办公楼流光着色器
    const material = officeFlowShader();

    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = "办公楼流光边框";
    mesh.position.set(-40, 0.1, 0);
    mesh.rotation.x = -Math.PI / 2; // 水平放置

    return mesh;
};

// 创建办公楼发光效果
const createOfficeGlow = () => {
    // 创建办公楼发光几何体
    const geometry = new THREE.BoxGeometry(44.5, 14.5, 19);

    // 使用发光渐变色着色器
    const material = officeGlowShader();

    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = "办公楼发光体";
    mesh.position.set(-40, 7, 0);  // 与办公楼位置对应

    // 存储材质引用，方便后续控制
    mesh.userData.glowMaterial = material;

    return mesh;
};

// 控制办公楼发光强度
const setOfficeGlowIntensity = (intensity) => {
    const officeGlow = threeTest.scene.getObjectByName("办公楼发光体");
    if (officeGlow && officeGlow.userData.glowMaterial) {
        officeGlow.userData.glowMaterial.uniforms.uGlowIntensity.value = intensity;
        console.log(`办公楼发光强度已设置为: ${intensity}`);
    } else {
        console.warn("未找到办公楼发光体或材质");
    }
};

// 创建通用模型描边发光效果
const createModelOutline = (modelName, outlineName = null) => {
    const model = getModel(modelName, threeTest.scene);
    if (!model) {
        console.warn(`未找到${modelName}模型，稍后加载完成将自动创建描边发光`);
        // 延迟重试
        setTimeout(() => {
            createModelOutline(modelName, outlineName);
        }, 1000);
        return;
    }

    // 如果没有指定outlineName，使用默认命名
    if (!outlineName) {
        outlineName = `${modelName}描边发光`;
    }

    // 检查是否已经创建过描边发光
    const existingOutline = threeTest.scene.getObjectByName(outlineName);
    if (existingOutline) {
        console.log(`${outlineName}效果已存在`);
        return;
    }

    // 获取模型的包围盒来确定正确的尺寸
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());


    // 创建描边发光几何体（基于实际模型尺寸，稍微放大）
    const geometry = new THREE.BoxGeometry(
        size.x * 1.1,
        size.y * 1.1,
        size.z * 1.1
    );

    // 使用通用描边发光着色器
    const material = modelOutlineShader();

    const outlineMesh = new THREE.Mesh(geometry, material);
    outlineMesh.name = outlineName;
    outlineMesh.position.copy(center); // 使用包围盒中心位置
    outlineMesh.rotation.copy(model.rotation);
    outlineMesh.scale.copy(model.scale);

    // 存储材质引用，方便后续控制
    outlineMesh.userData.outlineMaterial = material;
    outlineMesh.userData.targetModel = modelName; // 存储目标模型名称

    // 添加到场景
    threeTest.addScene(outlineMesh);

    // 设置渲染顺序，确保描边发光在模型之上
    outlineMesh.renderOrder = 1;
    model.renderOrder = 0;
};

// 控制模型描边发光参数
const setModelOutlineParams = (outlineName, params) => {
    const outlineMesh = threeTest.scene.getObjectByName(outlineName);
    if (outlineMesh && outlineMesh.userData.outlineMaterial) {
        const material = outlineMesh.userData.outlineMaterial;

        if (params.outlineColor) {
            material.uniforms.uOutlineColor.value = params.outlineColor;
        }
        if (params.glowColor) {
            material.uniforms.uGlowColor.value = params.glowColor;
        }
        if (params.outlineWidth !== undefined) {
            material.uniforms.uOutlineWidth.value = params.outlineWidth;
        }
        if (params.glowIntensity !== undefined) {
            material.uniforms.uGlowIntensity.value = params.glowIntensity;
        }
        if (params.pulseSpeed !== undefined) {
            material.uniforms.uPulseSpeed.value = params.pulseSpeed;
        }
        if (params.flowSpeed !== undefined) {
            material.uniforms.uFlowSpeed.value = params.flowSpeed;
        }

        console.log(`${outlineName}参数已更新:`, params);
    } else {
        console.warn(`未找到${outlineName}或材质`);
    }
};

// 关闭/移除模型描边发光
const removeModelOutline = (outlineName) => {
    if (!threeTest || !threeTest.scene) return;
    const outlineMesh = threeTest.scene.getObjectByName(outlineName);
    if (outlineMesh) {
        if (outlineMesh.parent) {
            outlineMesh.parent.remove(outlineMesh);
        } else {
            threeTest.scene.remove(outlineMesh);
        }
        try { outlineMesh.material.dispose && outlineMesh.material.dispose(); } catch (e) { }
        try { outlineMesh.geometry.dispose && outlineMesh.geometry.dispose(); } catch (e) { }
        console.log(`已关闭并移除 ${outlineName}`);
        return true;
    }
    console.warn(`未找到需要移除的 ${outlineName}`);
    return false;
};

// 手动创建模型描边发光（用于测试）
const manualCreateModelOutline = (modelName, outlineName = null) => {
    console.log(`手动创建${modelName}描边发光...`);
    console.log('当前场景中的对象:', threeTest.scene.children.map(child => child.name));

    const model = getModel(modelName, threeTest.scene);
    if (!model) {
        console.error(`未找到${modelName}模型`);
        return;
    }

    console.log(`找到${modelName}模型:`, model);

    // 如果没有指定outlineName，使用默认命名
    if (!outlineName) {
        outlineName = `${modelName}描边发光`;
    }

    // 先移除已存在的描边发光
    const existingOutline = threeTest.scene.getObjectByName(outlineName);
    if (existingOutline) {
        threeTest.scene.remove(existingOutline);
        console.log(`已移除旧的${outlineName}效果`);
    }

    // 创建新的描边发光
    createModelOutline(modelName, outlineName);

    // 强制刷新渲染器
    if (threeTest.renderer) {
        threeTest.renderer.render(threeTest.scene, threeTest.camera);
        console.log('已强制刷新渲染器');
    }
};



const firstPerson = () => {
    isFirstPerson = !isFirstPerson;
    p.switch(isFirstPerson);
    if (!isFirstPerson) {
        threeTest.camera.position.set(0, 10, 150);
        threeTest.controls.setCameraLookAt({
            x: 0,
            y: 0,
            z: 0,
        });
    }
};

// 切换轨迹显示
let showLine = false;
const switchShowLine = () => {
    showLine = !showLine;
    const line_1 = getModel("线1", threeTest.scene);
    const line_2 = getModel("线2", threeTest.scene);
    if (!line_1 || !line_2) return;
    line_1.visible = line_2.visible = showLine;
};

const moveCamera = (position, lookAt, time = 3000) => {
    if (!threeTest || !threeTest.camera || !threeTest.controls) {
        try { console.warn("moveCamera: three 未初始化"); } catch (e) { }
        return;
    }
    const camera = threeTest.camera;
    const wrapper = threeTest.controls;                 // CreateControls 实例
    const orbit = wrapper && wrapper.controls ? wrapper.controls : null; // OrbitControls 实例
    const hasOrbit = !!orbit;
    const from = {
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z,
        tx: hasOrbit ? orbit.target.x : 0,
        ty: hasOrbit ? orbit.target.y : 0,
        tz: hasOrbit ? orbit.target.z : 0,
    };
    const to = {
        x: position.x,
        y: position.y,
        z: position.z,
        tx: lookAt.x,
        ty: lookAt.y,
        tz: lookAt.z,
    };
    try {
        new TWEEN.Tween(from)
            .to(to, time)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(function () {
                camera.position.set(from.x, from.y, from.z);
                if (hasOrbit) {
                    orbit.target.set(from.tx, from.ty, from.tz);
                    orbit.update();
                } else if (wrapper && typeof wrapper.setCameraLookAt === 'function') {
                    wrapper.setCameraLookAt({ x: from.tx, y: from.ty, z: from.tz });
                }
            })
            .start();
    } catch (e) {
        try { console.warn("moveCamera 动画启动失败:", e); } catch (e2) { }
        // 兜底：直接设置到位
        try {
            camera.position.set(to.x, to.y, to.z);
            if (hasOrbit) {
                orbit.target.set(to.tx, to.ty, to.tz);
                orbit.update && orbit.update();
            } else if (wrapper && typeof wrapper.setCameraLookAt === 'function') {
                wrapper.setCameraLookAt({ x: to.tx, y: to.ty, z: to.tz });
            }
        } catch (e3) { }
    }
};

const showModel = (name, flag) => {
    const model = getModel(name, threeTest.scene);
    if (!model) return;
    model.visible = flag;
};

const getModelParams = (name) => {
    showModel("Obj3d66-9137221-8872-105", false);
    try {
        const res = getModel(name, threeTest.scene);
        if (!res) { try { console.warn("getModelParams: 未找到模型", name); } catch (e) { } }
        return res;
    } catch (e) {
        try { console.warn("getModelParams 异常:", e); } catch (e2) { }
        return null;
    }
};



// 导出所有方法供 Vue 组件使用
export {
    initThree,
    threeTest,
    actionsMap,
    patrolStatus,
    isFirstPerson,
    showPatrol,
    firstPerson,
    showLine,
    switchShowLine,
    moveCamera,
    patrolPartyList,
    getModelParams,
    deviceList,
    showModel,
    disposeThree,
    setOfficeGlowIntensity,
    setWorkshopGlassOpacity,
    createModelOutline,
    setModelOutlineParams,
    removeModelOutline,
    manualCreateModelOutline,
}; 