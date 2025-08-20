import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
// 获取模型动画
export const getActions = (
    animations,
    model,
) => {
    const actions = {};
    const mixerArray = [];
    if (animations && animations.length > 0) {
        const mixer = new THREE.AnimationMixer(model);
        mixerArray.push(mixer);
        for (let i = 0; i < animations.length; i++) {
            const clip = animations[i];
            const action = mixer.clipAction(clip);
            actions[clip.name] = action;
        }
    }
    return {
        actions,
        mixerArray,
    };
};
// 播放模型动画
export const playActiveAction = (
    actions,
    playKey,
    flag = true,
    loop = THREE.LoopOnce,
) => {
    if (!actions) return;
    const activeAction = actions[playKey];
    if (!activeAction) return;
    activeAction.clampWhenFinished = true;
    activeAction.loop = loop;
    activeAction.reset();
    flag ? activeAction.fadeIn(0.1).play() : activeAction.fadeIn(0.3).stop();
};
// 加载gltf模型
export const loadGltf = (url, name) => {
    return new Promise((res, rej) => {
        const loaderGltf = new GLTFLoader();
        loaderGltf.load(
            url,
            (gltf) => {
                const { scene } = gltf;
                scene.name = name;
                res(gltf);
            },
            (xhr) => {
                // console.log("加载进度：", Math.floor((xhr.loaded / xhr.total) * 100));
            },
            (err) => {
                rej(err);
            },
        );
    });
};
// 加载fbx模型
export const loadFbx = (url, name) => {
    return new Promise((res, rej) => {
        const loader = new FBXLoader();
        loader.load(
            url,
            (object) => {
                object.name = name;
                res(object);
            },
            (xhr) => {
                // console.log("加载进度：", Math.floor((xhr.loaded / xhr.total) * 100));
            },
            (err) => {
                rej(err);
            },
        );
    });
};
// 获取模型
export const getModel = (name, scene) => {
    return scene.getObjectByName(name);
};
// 创建材质
const createFaceMaterial = (color, opacity) => {
    const material = new THREE.MeshBasicMaterial({
        color: color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: opacity ? opacity : 1,
    });
    return material;
};
// 创建面
export const createFace = (array, color) => {
    const heartShape = new THREE.Shape(
        array.map((item) => new THREE.Vector2(item.x, item.z)),
    );
    const geometry = new THREE.ShapeGeometry(heartShape);
    const material = createFaceMaterial(color);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = Math.PI / 2;
    return mesh;
};
// 设置几何体样式
export const setGeometryStyle = (name, color, scene) => {
    const mesh = scene.scene.getObjectByName(name);
    if (!mesh) return;
    mesh.material = createFaceMaterial(color);
};
// 创建线条
export const createLine = (coordArray, lineName = "") => {
    const points = coordArray.map((p) => new THREE.Vector3(p.x, p.y, p.z));
    const curve = new THREE.CatmullRomCurve3(points, false);
    const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(
            curve.getPoints(points.length * 10),
        ),
        new THREE.LineBasicMaterial({
            color: 0xefffe5,
        }),
    );
    line.name = lineName;
    return line;
};
// 巡逻类
export class Patrol {
    constructor(params, callback) {
        const {
            three3D,
            coordArray,
            meshName = "",
            isFirstPerson = false,
            factor = 1,
            rotation,
        } = params;
        this.rotation = rotation;
        this.isFirstPerson = isFirstPerson;
        this.three3D = three3D;
        this.meshName = meshName;
        this.isStop = false;
        this.factor = factor;
        this.finishCallback = callback;
        let distanceToPoint = 0;
        const points = coordArray.map((p) => new THREE.Vector3(p.x, p.y, p.z));
        points.forEach((p, i) => {
            if (i !== 0 && points[i + 1]) {
                distanceToPoint += p.distanceTo(points[i + 1]);
            }
        });
        const curve = new THREE.CatmullRomCurve3(points, false);
        this.curvePoints = curve.getPoints(distanceToPoint * (100 / factor));
    }
    init() {
        const vm = this;
        async function* stepGen() {
            for (let i = 0; i < vm.curvePoints.length; i++) {
                yield vm.step(vm.curvePoints, i);
            }
            yield false;
        }
        this.runGen = stepGen();
    }
    reset() {
        this.runGen = null;
        this.isStop = false;
    }
    stop() {
        this.isStop = true;
    }
    run() {
        if (!this.isStop && this.runGen) return;
        if (!this.runGen) {
            this.init();
        }
        this.isStop = false;
        this.asyncGenerator(this.runGen);
    }
    switch(flag) {
        this.isFirstPerson = flag;
    }
    async asyncGenerator(g) {
        if (this.isStop) return;
        g.next().then((v) => {
            const { done, value } = v;
            // 吸收 step 返回的 Promise 的拒绝，避免未处理的 Promise 报错
            try {
                if (value && typeof value.then === 'function') {
                    value.catch(() => { });
                }
            } catch (e) { }
            if (!done) {
                setTimeout(() => {
                    this.asyncGenerator(g);
                }, 1);
            }
            this.finishCallback ? this.finishCallback(done, value) : null;
        }).catch(() => { });
    }
    step(point, i) {
        const vm = this;
        return new Promise((res, rej) => {
            if (!this.three3D) return rej(false);
            try {
                vm._runModel(point, i, res, vm);
            } catch (err) {
                // console.log(err);
                rej(false);
            }
        });
    }
    _runModel(point, i, res, vm) {
        const lookAt = i < point.length - 11 ? point[i + 10] : point[0];
        if (this.meshName) {
            const model = this.three3D.scene.getObjectByName(this.meshName);
            model.position.set(point[i].x, point[i].y, point[i].z);
            model.lookAt(lookAt.x, lookAt.y, lookAt.z);
            if (this.rotation) {
                const { x = 0, y = 0, z = 0 } = this.rotation;
                model.rotation.x = model.rotation.x + x;
                model.rotation.y = model.rotation.y + y;
                model.rotation.z = model.rotation.z + z;
            }
            if (vm.isFirstPerson) {
                this.three3D.camera.position.set(
                    point[i].x,
                    point[i].y + 1.8,
                    point[i].z,
                );
                this.three3D.controls.setCameraLookAt({
                    x: lookAt.x,
                    y: lookAt.y + 1.8,
                    z: lookAt.z,
                });
            }
            res(point[i]);
        }
    }
}
// 判断点是否在路径上
export const pointInThis = (point, pathList) => {
    const { x: px, z: py } = point;
    let flag = false;
    const length = pathList.length;
    for (let i = 0, l = length, j = l - 1; i < l; j = i, i++) {
        const { x: sx, z: sy } = pathList[i];
        const { x: tx, z: ty } = pathList[j];
        if ((sx === px && sy === py) || (tx === px && ty === py)) return true;
        if (
            sy === ty &&
            sy === py &&
            ((sx > px && tx < px) || (sx < px && tx > px))
        )
            return true;
        if ((sy < py && ty >= py) || (sy >= py && ty < py)) {
            const x = sx + ((py - sy) * (tx - sx)) / (ty - sy);
            if (x === px) return true;
            if (x > px) flag = !flag;
        }
    }
    return flag ? true : false;
};