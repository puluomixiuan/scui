import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer.js";
const TWEEN = window.TWEEN;
import { CSS3DRenderer } from "three/examples/jsm/renderers/CSS3DRenderer.js";

export class Three3D {
    constructor(id) {
        this.id = id;
        this.dome = document.querySelector(`#${id}`);
        if (!this.dome) return;
        const labelRenderer = new CSS2DRenderer();
        labelRenderer.domElement.style.position = "absolute";
        labelRenderer.domElement.style.top = "0px";
        labelRenderer.domElement.style.left = "0px";
        labelRenderer.domElement.style.pointerEvents = "none";
        this.labelRenderer = labelRenderer;
        this.dome.appendChild(labelRenderer.domElement);
        const css3Renderer = new CSS3DRenderer();
        css3Renderer.domElement.style.position = "absolute";
        css3Renderer.domElement.style.top = "0px";
        css3Renderer.domElement.style.left = "0px";
        css3Renderer.domElement.style.pointerEvents = "none";
        this.css3Renderer = css3Renderer;
        this.dome.appendChild(css3Renderer.domElement);
        this.wh = {
            width: this.dome.clientWidth,
            height: this.dome.clientHeight,
        };
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            30,
            this.wh.width / this.wh.height,
            1,
            10000,
        );
        this.camera.position.set(0, 10, 150);
        this.clock = new THREE.Clock();
        this.modelGroup = new THREE.Group();
        this.modelGroup.name = "modelGroup";
        this.scene.add(this.modelGroup);
        this.ActionsMixer = new Map();
        this.clickHandler = null; // 添加点击事件处理器
    }
    init() {
        if (this.renderer) return this;
        this.renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            precision: "highp",
        });
        this.renderer.setSize(this.wh.width, this.wh.height);
        this.renderer.render(this.scene, this.camera);
        this.dome.appendChild(this.renderer.domElement);
        this.dome.addEventListener("click", this.onMouseClick, false);
        this.controls = new CreateControls(this.camera, this.dome);
        this.animate();
        this.resize();
        return this;
    }
    addModel(mesh, actions) {
        this.modelGroup.add(mesh);
        if (actions) this.addActionsMixer(mesh.name, actions);
    }
    addLight(mesh) {
        this.addScene(mesh);
    }
    addScene(mesh) {
        this.scene.add(mesh);
    }
    axesHelper() {
        const AxesHelper = new THREE.AxesHelper(10000);
        AxesHelper.name = "辅助坐标系";
        this.addScene(AxesHelper);
    }
    background() {
        this.scene.background = new THREE.CubeTextureLoader()
            .setPath("/texture/sky/")
            .load([
                "sky.left.jpg",
                "sky.right.jpg",
                "sky.top.jpg",
                "sky.bottom.jpg",
                "sky.back.jpg",
                "sky.front.jpg",
            ]);
    }

    // 设置夜晚天空盒
    setNightSkybox() {
        // 创建渐变夜空背景
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        // 创建从深蓝到黑色的渐变
        const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
        gradient.addColorStop(0, '#001122');   // 中心深蓝
        gradient.addColorStop(0.5, '#001a33'); // 中间蓝色
        gradient.addColorStop(1, '#000011');   // 边缘黑色

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 256, 256);

        // 添加一些星星
        // ctx.fillStyle = '#ffffff';
        // for (let i = 0; i < 50; i++) {
        //     const x = Math.random() * 256;
        //     const y = Math.random() * 256;
        //     const size = Math.random() * 2 + 0.5;
        //     ctx.beginPath(); 
        //     ctx.arc(x, y, size, 0, Math.PI * 2);
        //     ctx.fill();
        // }

        const texture = new THREE.CanvasTexture(canvas);
        texture.mapping = THREE.EquirectangularReflectionMapping;

        this.scene.background = texture;
    }
    resize = () => {
        this.dome = document.querySelector(`#${this.id}`);
        if (!this.dome || !this.wh || !this.renderer) return;
        this.wh.width = this.dome.clientWidth;
        this.wh.height = this.dome.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.wh.width, this.wh.height);
        this.labelRenderer.setSize(this.wh.width, this.wh.height);
        this.css3Renderer.setSize(this.wh.width, this.wh.height);
    };
    addActionsMixer(key, actions) {
        this.ActionsMixer.set(key, actions);
    }
    animate = () => {
        try { TWEEN && TWEEN.update && TWEEN.update(); } catch (e) { }
        const dt = this.clock.getDelta();
        this.ActionsMixer.forEach((actions) => {
            actions.forEach((action) => {
                action.update(dt);
            });
        });
        this._animationId = requestAnimationFrame(this.animate);
        this.controls.controls.update();
        this.renderer.render(this.scene, this.camera);
        this.labelRenderer.render(this.scene, this.camera);
        this.css3Renderer.render(this.scene, this.camera);
    };

    dispose() {
        try {
            if (this._animationId) cancelAnimationFrame(this._animationId);
        } catch (e) { }
        try { TWEEN.removeAll && TWEEN.removeAll(); } catch (e) { }
        try {
            this.dome && this.dome.removeEventListener("click", this.onMouseClick, false);
        } catch (e) { }
        try {
            this.controls && this.controls.controls && this.controls.controls.dispose && this.controls.controls.dispose();
        } catch (e) { }
        // 释放场景资源
        try {
            const disposeMaterial = (mat) => {
                if (!mat) return;
                const maps = [
                    "map",
                    "lightMap",
                    "aoMap",
                    "emissiveMap",
                    "bumpMap",
                    "normalMap",
                    "displacementMap",
                    "roughnessMap",
                    "metalnessMap",
                    "envMap",
                    "alphaMap",
                ];
                maps.forEach((k) => mat[k] && mat[k].dispose && mat[k].dispose());
                mat.dispose && mat.dispose();
            };
            this.scene && this.scene.traverse && this.scene.traverse((obj) => {
                if (obj.isMesh) {
                    obj.geometry && obj.geometry.dispose && obj.geometry.dispose();
                    if (obj.material) {
                        if (Array.isArray(obj.material)) obj.material.forEach(disposeMaterial);
                        else disposeMaterial(obj.material);
                    }
                }
            });
        } catch (e) { }
        try {
            this.renderer && this.renderer.dispose && this.renderer.dispose();
            this.renderer && this.renderer.forceContextLoss && this.renderer.forceContextLoss();
        } catch (e) { }
        try {
            if (this.renderer && this.renderer.domElement && this.renderer.domElement.parentNode === this.dome) {
                this.dome.removeChild(this.renderer.domElement);
            }
            if (this.labelRenderer && this.labelRenderer.domElement && this.labelRenderer.domElement.parentNode === this.dome) {
                this.dome.removeChild(this.labelRenderer.domElement);
            }
            if (this.css3Renderer && this.css3Renderer.domElement && this.css3Renderer.domElement.parentNode === this.dome) {
                this.dome.removeChild(this.css3Renderer.domElement);
            }
        } catch (e) { }
        try { this.ActionsMixer && this.ActionsMixer.clear && this.ActionsMixer.clear(); } catch (e) { }
        this.renderer = null;
        this.labelRenderer = null;
        this.css3Renderer = null;
        this.scene = null;
        this.modelGroup = null;
        this.camera = null;
        this.controls = null;
    }

    // 设置点击事件处理器
    setClickHandler(handler) {
        this.clickHandler = handler;
    }

    onMouseClick = (event) => {
        event.preventDefault();

        // 创建射线投射器
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        // 计算鼠标位置（相对于渲染器）
        const rect = this.renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        // 设置射线
        raycaster.setFromCamera(mouse, this.camera);

        // 检测与场景中对象的相交
        const intersects = raycaster.intersectObjects(this.scene.children, true);

        // 如果有自定义的点击处理器，则调用它
        if (this.clickHandler && typeof this.clickHandler === 'function') {
            this.clickHandler(event, intersects);
        }

        // 如果没有相交的对象，也调用处理器（点击空白区域）
        if (intersects.length === 0 && this.clickHandler) {
            // 计算点击位置在地面上的投影
            const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
            const intersectionPoint = new THREE.Vector3();
            raycaster.ray.intersectPlane(groundPlane, intersectionPoint);

            // 创建模拟的相交对象
            const groundIntersect = {
                point: intersectionPoint,
                object: { name: '地面', type: 'Ground', position: intersectionPoint }
            };

            this.clickHandler(event, [groundIntersect]);
        }
    };
}

class CreateControls {
    constructor(camera, domElement, params) {
        const controls = new OrbitControls(camera, domElement);
        const {
            enableZoom = true,
            zoomSpeed = 0.5,
            enableDamping = true,
            maxDistance = 1000,
            minDistance = 0,
            rotateSpeed = 0.5,
            maxPolarAngle = Math.PI / 2,
        } = params || {};
        controls.enableZoom = enableZoom;
        controls.zoomSpeed = zoomSpeed;
        controls.enableDamping = enableDamping;
        controls.maxDistance = maxDistance;
        controls.minDistance = minDistance;
        controls.rotateSpeed = rotateSpeed;
        controls.maxPolarAngle = maxPolarAngle;
        controls.screenSpacePanning = false;
        this.controls = controls;
    }
    setCameraLookAt(position) {
        this.controls.target.set(position.x, position.y, position.z);
        this.controls.update();
    }
    setCameraPosition(position) {
        this.controls.object.position.set(position.x, position.y, position.z);
        this.controls.update();
    }
}