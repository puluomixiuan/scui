import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as THREE from 'three';
import BaseThreeClass from '@/utils/BaseThreeClass';

export function useThree(containerRef) {
    const threeInstance = ref(null);

    // 初始化3D场景
    function initThree() {
        threeInstance.value = new BaseThreeClass({
            container: containerRef.value,
            id: 'office',
        });
        // 可在此处调用threeInstance.value的相关方法进行模型、标签、围栏等初始化
    }

    // 相机移动
    function moveCamera(position, lookAt, time = 1000) {
        if (!threeInstance.value) return;
        if (typeof threeInstance.value.moveCamera === 'function') {
            threeInstance.value.moveCamera(position, lookAt, time);
        } else {
            const camera = threeInstance.value.camera;
            camera.position.set(position.x, position.y, position.z);
            camera.lookAt(lookAt.x, lookAt.y, lookAt.z);
        }
    }

    // 销毁
    function dispose() {
        if (threeInstance.value) threeInstance.value.dispose();
    }

    onMounted(() => {
        initThree();
    });
    onBeforeUnmount(() => {
        dispose();
    });

    return {
        threeInstance,
        moveCamera,
        dispose,
        // 可扩展更多方法，如addLabels、addFence、startPatrol等
    };
}