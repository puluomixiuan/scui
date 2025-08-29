/*
 * useThree.js
 *
 * 职责：
 * - 仅负责 Three 场景的初始化、全局编排与生命周期管理
 * - 具体模型/特效/交互逻辑，拆分为独立模块放在 src/utils/models 下按需引入
 *
 * 模块划分：
 * - models/office.js    办公楼特效（流光、发光、屋顶灯光、屋顶渐变地板）
 * - models/workshop.js  厂房灯光与玻璃透明度控制
 * - models/street.js    路灯灯光环境
 * - models/outline.js   通用模型描边发光（创建/更新/移除/手动）
 * - models/labels.js    通用 2D 标签与摄像头标签（可点击）
 * - models/hotspots.js  3D 摄像头热点（可被射线命中）
 *
 * 使用约定：
 * - 本文件对外导出的 API 维持旧名不变，内部委派给模块实现，避免影响业务层调用
 * - 新增模型功能请新增独立模块，并在此集中编排（初始化/销毁/事件绑定）
 * - 清理逻辑统一在 disposeThree 中做资源释放（事件、动画、几何体、材质等）
 */
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
import { circleShader } from "./shader.js";

import * as THREE from "three";
import { ref, onBeforeUnmount } from "vue";

// 导入模块化功能
import { createAndAddFlowLines, setThreeTestInstance, flowLinesControlPanel, disposeFlowLines } from "./flowLines.js";
import * as Labels from "./models/labels.js";
import * as Hotspots from "./models/hotspots.js";
import * as Outline from "./models/outline.js";
import * as Office from "./models/office.js";
import * as Workshop from "./models/workshop.js";
import * as Street from "./models/street.js";

let threeTest;
let isDisposed = false;
// 已知顶层模型名称集合（用于点击命中时解析）
let knownModelNames = new Set();
const TWEEN = window.TWEEN;
// 路由切换兜底监听引用（hash 模式）
let routeChangeHandler = null;
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

/**
 * 浏览器窗口尺寸变化时自适应渲染尺寸
 */
const resize = () => {
    if (!threeTest) return;
    threeTest.resize();
};

/**
 * 销毁 three 实例与事件
 */
const disposeThree = () => {
    // 防抖：已销毁则直接返回，避免重复清理
    if (isDisposed) return;
    isDisposed = true;
    console.log('执行销毁');
    try { clearTimeout(time); } catch (e) { }
    try { window.removeEventListener("resize", resize); } catch (e) { }
    try { if (routeChangeHandler) { window.removeEventListener('hashchange', routeChangeHandler); routeChangeHandler = null; } } catch (e) { }
    try { disposeFlowLines(threeTest); } catch (e) { }
    try { threeTest && threeTest.dispose && threeTest.dispose(); } catch (e) { }
    try { p && p.stop && p.stop(); } catch (e) { }
    try { p = null; } catch (e) { }
    try { threeTest = null; } catch (e) { }
    try { if (typeof TWEEN?.removeAll === 'function') TWEEN.removeAll(); } catch (e) { }
    try { delete window.__three; } catch (e) { try { window.__three = null; } catch (e2) { } }
};

// 初始化3D场景
const initThree = (id) => {
    threeTest = new Three3D(id).init();
    try { window.__three = threeTest; } catch (e) { }
    try { window.__threeTest = threeTest; } catch (e) { }
    // 初始背景交由昼夜交替系统控制（避免强行覆盖为夜晚或纯色）

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

    // 厂房灯光由模块提供
    const workshopLightGroup = Workshop.createWorkshopLights();
    threeTest.addScene(workshopLightGroup);

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
    // 兜底：hash 路由切换时自动销毁（三方/布局遗漏卸载钩子时仍能清理）
    try {
        if (!routeChangeHandler) {
            routeChangeHandler = () => {
                try { disposeThree(); } catch (e) { }
                try { window.removeEventListener('hashchange', routeChangeHandler); } catch (e2) { }
                routeChangeHandler = null;
            };
            window.addEventListener('hashchange', routeChangeHandler);
        }
    } catch (e) { }
    // 加载模型
    addGltf(gltfModelList); // 场景
    addGltf(patrolPartyList); // 人物
    copyModel(); // 同一模型模型批量加载 =>设备
    // 加载标签
    // addLabel();
    Labels.addLabelGroup(threeTest, labelList);
    // 添加围栏
    addFace();

    // 创建办公楼发光效果
    const officeGlow = Office.createOfficeGlow();
    // threeTest.addScene(officeGlow);

    // 添加楼顶光照系统到场景（由模块提供实现）
    const roofLighting = Office.createRoofLighting();
    // threeTest.addScene(roofLighting);

    // 添加昼夜交替光照系统
    const dayNightLighting = Office.createDayNightLighting();
    threeTest.addScene(dayNightLighting.group);

    // 将光照控制对象存储到全局，方便外部调用
    window.__dayNightControls = dayNightLighting.controls;



    // 添加路灯灯光环境到场景（由模块提供实现）
    const streetLighting = Street.createStreetLighting();
    threeTest.addScene(streetLighting);

    // 添加楼顶横向渐变平面到场景（由模块提供实现）
    const roofGradient = Office.createRoofGradient();
    // threeTest.addScene(roofGradient);

    // 玻璃默认常亮
    Office.setGlassAlwaysOn(threeTest, { color: 0xffffff });

    // 恢复窗框到原始颜色
    Office.restoreWindowFrameColors(threeTest);

    // 设定办公楼玻璃透明度（可调）
    Office.setOfficeGlassOpacity(threeTest, 0.35);

    // 精准替换：将墙体默认材质 "Material #30" 替换为 "00踏步.027"
    try { Office.replaceMaterialByName(threeTest, 'Material #30', '00踏步.027'); } catch (e) { }

    // 创建并添加流光线条
    createAndAddFlowLines(threeTest);

    // 设置流光线条控制面板的Three.js实例引用
    setThreeTestInstance(threeTest);
    // 控制流光线条
    // flowLinesControlPanel.show();           // 显示
    // flowLinesControlPanel.hide();           // 隐藏
    // flowLinesControlPanel.toggle();         // 切换显示/隐藏
    flowLinesControlPanel.enableAwesome();  // 启用炫酷模式

    // 创建办公楼专用流光效果
    const officeFlow = Office.createOfficeFlow();
    threeTest.addScene(officeFlow);

};

/**
 * 在组件 setup 环境中注册三维生命周期（路由切换/组件卸载时自动销毁）
 * 使用方式（组件内）：
 *   import { registerThreeLifecycle } from '@/utils/useThree';
 *   registerThreeLifecycle();
 */
const registerThreeLifecycle = () => {
    try {
        onBeforeUnmount(() => {
            disposeThree();
        });
    } catch (e) {
        // 非 setup 环境调用时不抛错，交由调用方显式 dispose
    }
};

/**
 * 场景点击事件处理
 * @param {MouseEvent|PointerEvent} event 原始事件对象（由内部控制器传入）
 * @param {Array} intersects 射线拾取结果数组（按距离升序），来自 three.js Raycaster
 */
const handleSceneClick = (event, intersects) => {
    // 若没有命中任何对象，直接返回
    if (!(intersects && intersects.length > 0)) return;

    // 取第一个命中对象，通常为可见的最前层对象
    const selected = intersects[0];
    const point = selected.point; // 三维世界坐标

    // 坐标保留两位小数，便于显示与复制
    const coordinates = {
        x: Math.round(point.x * 100) / 100,
        y: Math.round(point.y * 100) / 100,
        z: Math.round(point.z * 100) / 100
    };

    const clickedObject = selected.object; // 被命中的 three 对象（Mesh/Line 等）

    // 1) 摄像头热点快速通道：
    //    a. 通过 userData.isCameraHotspot 标识
    //    b. 或者名称以“摄像头热点-”前缀命名
    if (clickedObject && (clickedObject.userData?.isCameraHotspot || (clickedObject.name || '').startsWith('摄像头热点-'))) {
        const modelName = clickedObject.userData?.modelName || (clickedObject.name || '').replace('摄像头热点-', '');
        try { window.dispatchEvent(new CustomEvent('camera-click', { detail: { name: modelName } })); } catch (e) { }
        return;
    }

    // 采集被点中的对象基础信息，用于浮层显示
    const objectInfo = {
        name: clickedObject.name || '未命名对象',
        type: clickedObject.type || '未知类型',
        position: {
            x: Math.round(clickedObject.position.x * 100) / 100,
            y: Math.round(clickedObject.position.y * 100) / 100,
            z: Math.round(clickedObject.position.z * 100) / 100
        }
    };

    // 2) 解析业务“根名”：向上回溯父级，优先使用 rootName 标记，其次匹配已知模型名
    let cursor = clickedObject;
    let resolvedName = null;
    while (cursor) {
        // 在 setModel 时为模型根设置了 userData.rootName，便于点击识别
        if (cursor.userData && cursor.userData.rootName) { resolvedName = cursor.userData.rootName; break; }
        // 对应顶层模型列表（如“办公楼/厂房/电箱/路灯”等）
        if (cursor.name && knownModelNames.has(cursor.name)) { resolvedName = cursor.name; break; }
        cursor = cursor.parent;
    }
    // 兜底：取最顶层非场景节点的 name，否则沿用 objectInfo.name
    if (!resolvedName) {
        let top = clickedObject; while (top && top.parent && !top.parent.isScene) { top = top.parent; }
        resolvedName = (top && top.name) ? top.name : objectInfo.name;
    }

    // 3) 派发统一的 model-click 事件，供业务层（路由/弹窗/右侧面板等）统一处理
    try { window.dispatchEvent(new CustomEvent('model-click', { detail: { name: resolvedName, point: coordinates } })); } catch (e) { }

    // 弹出临时坐标信息，便于调试/定位
    showCoordinatesInfo(coordinates, { ...objectInfo, name: resolvedName });
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

// 填充已知模型集合（用于点击解析）
try { knownModelNames = new Set(gltfModelList.map(i => i.name).filter(Boolean)); } catch (e) { }

// 加载场景模型
const actionsMap = new Map(); // 动画

// 厂房玻璃透明度控制（委派给 Workshop 模块）
let currentWorkshopGlassOpacity = 0.3;
const setWorkshopGlassOpacity = (opacity) => {
    currentWorkshopGlassOpacity = Math.min(1, Math.max(0, Number(opacity)));
    const workshop = getModel("厂房", threeTest.scene);
    if (workshop) {
        try { Workshop.applyWorkshopGlassOpacity(workshop, currentWorkshopGlassOpacity); } catch (e) { }
    } else {
        console.warn("未找到‘厂房’模型，稍后加载完成将自动应用透明度");
    }
};

/**
 * 将加载完成的模型加入场景，并处理动画/命名/缩放/回调等
 * @param {THREE.Object3D} model glTF/FBX 场景树或根节点
 * @param {Array} animations 动画剪辑数组（若有）
 * @param {{name:string, position:{x:number,y:number,z:number}, rotation:{x:number,y:number,z:number}, scale?:number, playAction?:string, callback?:Function}} params 元数据
 */
const setModel = (model, animations, params) => {
    if (isDisposed) return; // 避免销毁后继续添加
    // 确保根对象命名与标记，便于点击识别
    try {
        if (params && params.name) {
            model.name = params.name;
            model.userData = model.userData || {};
            model.userData.rootName = params.name;
            model.userData.isModelRoot = true;
        }
    } catch (e) { }
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
        try { Workshop.applyWorkshopGlassOpacity(model, currentWorkshopGlassOpacity); } catch (e) { }
    }
    // 加载完后的回调函数，自定义加载完模型后的操作
    if (params.callback) {
        setTimeout(() => {
            if (!isDisposed) params.callback(threeTest);
        }, 100);
    }
};

/**
 * 批量加载 glTF/FBX 模型并加入场景
 * - 根据条目 type 选择 glTF 或 FBX 加载器
 * - 成功后调用 setModel 完成落位与动画接入
 * - 失败时打印错误但不中断其它条目
 * @param {Array} modelList 加载条目列表
 */
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

/**
 * 平滑移动相机位置并更新观察目标（支持 OrbitControls）
 * - 若启用了 OrbitControls，则同时插值 controls.target；否则调用 threeTest.controls.setCameraLookAt
 * - 使用 TWEEN 做 Quadratic.InOut 插值，默认 3000ms，可调整 time
 * - 若动画失败，则直接跳至目标位姿作为兜底
 *
 * @param {{x:number,y:number,z:number}} position 目标相机位置
 * @param {{x:number,y:number,z:number}} lookAt 目标观察点
 * @param {number} [time=3000] 动画时长（毫秒）
 */
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

// ===== 统一对外导出的简洁API（内部委派给模块实现） =====
/**
 * 设置办公楼发光强度
 * @param {number} intensity 发光强度（建议 0.0 ~ 3.0）
 */
const setOfficeGlowIntensity = (intensity) => {
    try { Office.setOfficeGlowIntensity(threeTest, intensity); } catch (e) { }
};

/**
 * 为指定模型创建描边发光盒
 * @param {string} modelName 目标模型名称（需在场景中存在）
 * @param {string|null} outlineName 可选，自定义效果名称
 */
const createModelOutline = (modelName, outlineName = null) => {
    try { Outline.createModelOutline(threeTest, modelName, outlineName); } catch (e) { }
};

/**
 * 更新描边发光参数
 * @param {string} outlineName 效果对象名称
 * @param {object} params 可选参数：outlineColor/glowColor/outlineWidth/glowIntensity/pulseSpeed/flowSpeed
 */
const setModelOutlineParams = (outlineName, params) => {
    try { Outline.setModelOutlineParams(threeTest, outlineName, params); } catch (e) { }
};

/**
 * 移除描边发光
 * @param {string} outlineName 效果对象名称
 * @returns {boolean}
 */
const removeModelOutline = (outlineName) => {
    try { return Outline.removeModelOutline(threeTest, outlineName); } catch (e) { return false; }
};

/**
 * 手动创建描边并立即刷新渲染器（用于调试）
 * @param {string} modelName 模型名
 * @param {string|null} outlineName 效果名
 */
const manualCreateModelOutline = (modelName, outlineName = null) => {
    try { Outline.manualCreateModelOutline(threeTest, modelName, outlineName); } catch (e) { }
};

/**
 * 在模型上方显示“摄像头”标签（CSS2D），可点击派发 camera-click
 * @param {string} modelName 模型名
 * @param {string|null} labelName 自定义标签对象名
 * @returns {THREE.Object3D|null}
 */
const showCameraLabel = (modelName, labelName = null) => {
    try { return Labels.showCameraLabel(threeTest, modelName, labelName); } catch (e) { return null; }
};

/**
 * 移除“摄像头”标签
 * @param {string} labelName 标签对象名
 * @returns {boolean}
 */
const removeCameraLabel = (labelName) => {
    try { return Labels.removeCameraLabel(threeTest, labelName); } catch (e) { return false; }
};

/**
 * 在模型上方创建 3D 摄像头热点（可射线命中，触发 camera-click）
 * @param {string} modelName 模型名
 * @param {string|null} hotspotName 自定义热点对象名
 * @returns {THREE.Object3D|null}
 */
const createCameraHotspot = (modelName, hotspotName = null) => {
    if (!threeTest || !threeTest.scene) return null;
    const model = getModel(modelName, threeTest.scene);
    if (!model) return null;
    const name = hotspotName || `摄像头热点-${modelName}`;
    const existed = threeTest.scene.getObjectByName(name);
    if (existed) return existed;
    return Hotspots.createCameraHotspot(threeTest, model, name);
};

/**
 * 移除 3D 摄像头热点
 * @param {string} hotspotName 热点对象名
 * @returns {boolean}
 */
const removeCameraHotspot = (hotspotName) => {
    try { return Hotspots.removeCameraHotspot(threeTest, hotspotName); } catch (e) { return false; }
};

// 导出所有方法供 Vue 组件使用
export {
    initThree,
    registerThreeLifecycle,
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
    createModelOutline,
    setModelOutlineParams,
    removeModelOutline,
    manualCreateModelOutline,
    showCameraLabel,
    removeCameraLabel,
    createCameraHotspot,
    removeCameraHotspot,
}; 