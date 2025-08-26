<template>
    <div class="layout">
        <div class="head" :style="{'--head-bg': 'url(/image/head_bg.png)'}">
            <p data-text="Digital Factory">Digital Factory</p>
        </div>
        <div class="centre">
            <div class="left box">
                <Card class="card-box">
                    <template #title>
                        <div class="title">数据统计</div>
                    </template>
                    <div class="device-online">
                        <div id="deviceOnline" />
                        <div class="device">
                            <div>
                                在线设备：<span>{{ deviceOnlineData.online }}</span>
                            </div>
                            <div>离线设备：{{ deviceOnlineData.downline }}</div>
                        </div>
                    </div>
                </Card>
                <Card class="card-box">
                    <template #title>
                        <div class="title">告警次数</div>
                    </template>
                    <div class="device-online">
                        <div id="numberOfAlarms" />
                    </div>
                </Card>

                <Card class="card-box">
                    <template #title>
                        <div class="title">告警分布</div>
                    </template>
                    <!-- <div class="device-online">
                        <div id="distribute" />
                    </div> -->
                    <div style="width:260px">
                        <AlarmGauge :value="20" :dotInsetPx="10" />
                    </div>
                </Card>
            </div>
            <div class="three">
                <div id="office" />
            </div>
            <div class="right box">
                <Card class="card-box">
                    <template #title>
                        <div class="title">巡逻人员</div>
                    </template>
                    <div class="list">
                        <div class="people">
                            <div class="item" @click="clickDevice(item)" v-for="item in patrolPartyList" :key="item.id">
                                <SvgIcon iconName="Place" />
                                {{ item.name }}
                            </div>
                        </div>
                    </div>
                </Card>
                <Card class="card-box">
                    <template #title>
                        <div class="title">设备列表</div>
                    </template>
                    <div class="list">
                        <div class="people">
                            <div class="item" @click="locationPatrolParty(item)" v-for="item in deviceList" :key="item.id">
                                <SvgIcon iconName="Place" />
                                <span :class="{
                    state: item.state === 0,
                  }">
                                    {{ item.name }}</span>
                            </div>
                        </div>
                    </div>
                </Card>
                <Card class="card-box">
                    <template #title>
                        <div class="title">告警列表</div>
                    </template>
                    <div class="list">
                        <div class="people">
                            <div class="item" v-for="item in 20" :key="item">设备告警</div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
        <div class="control">
            <el-button type="primary" @click="showPatrol">
                {{ patrolStatus ? "点击继续巡逻" : "点击暂停巡逻" }}</el-button>
            <el-button type="primary" @click="firstPerson">
                {{ isFirstPerson ? "第三人称" : "第一人称" }}</el-button>
            <el-button type="primary" @click="switchShowLine">
                {{ showLine ? "隐藏轨迹" : "显示轨迹" }}</el-button>
            <el-dropdown @command="changeView">
                <el-button type="primary"> 视角切换 </el-button>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item :command="i" v-for="(item, i) in visualAngleList" :key="i">{{ item.name }}</el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>

            <!-- 模型描边发光控制 -->
            <el-dropdown @command="onOutlineMenu">
                <el-button type="primary"> 模型描边发光 </el-button>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item command="create-电箱">为电箱创建</el-dropdown-item>
                        <el-dropdown-item command="create-办公楼">为办公楼创建</el-dropdown-item>
                        <el-dropdown-item command="create-厂房">为厂房创建</el-dropdown-item>
                        <el-dropdown-item divided command="glow-2.0">增强发光</el-dropdown-item>
                        <el-dropdown-item command="glow-0.5">减弱发光</el-dropdown-item>
                        <el-dropdown-item divided command="color-red">红色描边</el-dropdown-item>
                        <el-dropdown-item command="color-green">绿色描边</el-dropdown-item>
                        <el-dropdown-item command="color-cyan">青色描边</el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>

        </div>
    </div>
</template>

 <script>
// 导入Vue的响应式API和生命周期钩子
import { ref, onMounted } from "vue";
// 导入自定义Card组件
import Card from "./components/Card.vue";
import AlarmGauge from "@/components/AlarmGauge.vue";

// 导入Three.js相关工具函数
import {
    initThree, // 初始化Three.js场景
    patrolStatus, // 巡逻状态(响应式)
    isFirstPerson, // 是否第一人称视角(响应式)
    showPatrol, // 控制巡逻状态的方法
    firstPerson, // 切换第一/第三人称视角的方法
    showLine, // 是否显示轨迹(响应式)
    switchShowLine, // 切换轨迹显示状态的方法
    moveCamera, // 移动相机位置的方法
    patrolPartyList, // 巡逻人员列表数据
    deviceList, // 设备列表数据
    getModelParams, // 获取模型参数的方法
    showModel, // 显示指定模型的方法
    createModelOutline, // 创建模型描边发光
    setModelOutlineParams, // 设置模型描边发光参数
    manualCreateModelOutline, // 手动创建模型描边发光
} from "@/utils/useThree.js";
import useEcharts from "@/hooks/useEcharts.js";
import useEchartsData from "@/hooks/useEchartsData.js";

export default {
    name: "ThreeD",
    components: {
        Card, // 注册Card组件
        AlarmGauge,
    },
    setup() {
        // three 相关
        // 视角配置列表
        const visualAngleList = [
            {
                name: "主视图",
                position: { x: 0, y: 10, z: 150 },
                lookAt: { x: 0, y: 0, z: 0 },
            },
            {
                name: "电箱",
                position: { x: 140, y: 10, z: 40 },
                lookAt: { x: 40, y: 5, z: 40 },
            },
            {
                name: "办公楼",
                position: { x: -40, y: 10, z: 100 },
                lookAt: { x: -40, y: 15, z: 0 },
            },
            {
                name: "猫",
                position: { x: 10, y: 2, z: 50 },
                lookAt: { x: 10, y: 0, z: 40 },
            },
            {
                name: "厂房",
                position: { x: 50, y: 40, z: 100 },
                lookAt: { x: 50, y: 0, z: 0 },
            },
            // 新增自定义视角
            {
                name: "全景",
                position: { x: 0, y: 100, z: 0 },
                lookAt: { x: 0, y: 0, z: 0 },
            },
        ];

        // 切换视角方法
        const changeView = (v) => {
            const idx = Number(v); // 保证索引为数字
            const { position, lookAt } = visualAngleList[idx];
            moveCamera(position, lookAt); // 移动相机到指定视角
            showModel("Obj3d66-9137221-8872-105", true); // 显示指定模型
        };

        // 根据名称定位模型
        const location = (name) => {
            const model = getModelParams(name); // 获取模型参数
            if (!model) return;
            const { position } = model;
            // 移动相机到模型上方位置
            moveCamera(
                {
                    x: position.x,
                    y: 50,
                    z: position.z + 20,
                },
                position, // 相机朝向模型位置
                1000 // 动画过渡时间(ms)
            );
        };

        // 设备定位处理
        const locationPatrolParty = (v) => {
            const { name } = v;
            location(name);
        };

        // 巡逻人员点击处理
        const clickDevice = (v) => {
            const { name } = v;
            location(name);
        };

        // ===== 模型描边发光下拉控制 =====
        const currentOutlineName = ref("电箱描边发光");
        const onOutlineMenu = (cmd) => {
            const [type, payload] = cmd.split("-");
            if (type === "create") {
                currentOutlineName.value = `${payload}描边发光`;
                createModelOutline(payload);
                return;
            }
            if (type === "glow") {
                const val = Number(payload);
                setModelOutlineParams(currentOutlineName.value, {
                    glowIntensity: val,
                });
                return;
            }
            if (type === "color") {
                const map = {
                    red: { x: 1.0, y: 0.0, z: 0.0 },
                    green: { x: 0.0, y: 1.0, z: 0.0 },
                    cyan: { x: 0.0, y: 0.8, z: 1.0 },
                };
                const color = map[payload];
                if (color) {
                    setModelOutlineParams(currentOutlineName.value, {
                        outlineColor: color,
                        glowColor: color,
                    });
                }
                return;
            }
        };

        // echarts hooks
        const {
            deviceOnlineData,
            deviceOnlineOption,
            numberOfAlarmsOption,
            distributeOption,
        } = useEchartsData();
        // echarts 渲染
        useEcharts(deviceOnlineOption, "deviceOnline");
        useEcharts(numberOfAlarmsOption, "numberOfAlarms");
        // useEcharts(distributeOption, "distribute");

        // 组件挂载后初始化Three.js场景
        onMounted(() => {
            initThree("office"); // 在id为office的DOM元素中初始化场景
        });

        // 暴露给模板使用的变量和方法
        return {
            deviceOnlineData,
            patrolStatus,
            isFirstPerson,
            showPatrol,
            firstPerson,
            showLine,
            switchShowLine,
            moveCamera,
            patrolPartyList,
            deviceList,
            visualAngleList,
            changeView,
            locationPatrolParty,
            clickDevice,
            createModelOutline,
            setModelOutlineParams,
            manualCreateModelOutline,
            onOutlineMenu,
            currentOutlineName,
        };
    },
};
</script>

<style lang="scss" scoped>
.three {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 0;
    #office {
        position: relative;
        width: 100vw;
        height: 100vh;
    }
}

.layout {
    position: relative;
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;

    .head {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 60px;
        z-index: 9999999;
        font-size: 40px;
        p {
            position: relative;
            margin: auto;
            word-spacing: 0.2em;
            display: inline-block;
            white-space: nowrap;
            color: transparent;
            background-color: #17c2e5;
            background-clip: text;
            z-index: 2;
            font-weight: 900;
            font-family: myFirstFont;
        }

        p::after {
            content: attr(data-text);
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            z-index: 5;
            background-image: linear-gradient(
                120deg,
                transparent 0%,
                transparent 2rem,
                white 2rem,
                transparent 4.15rem,
                transparent 15rem,
                rgba(255, 255, 255, 0.3) 40px,
                transparent 25rem,
                transparent 27rem,
                rgba(255, 255, 255, 0.6) 32rem,
                white 33rem,
                rgba(255, 255, 255, 0.3) 33.15rem,
                transparent 38rem,
                transparent 40rem,
                rgba(255, 255, 255, 0.3) 45rem,
                transparent 20rem,
                transparent 100%
            );

            background-clip: text;
            background-size: 150% 100%;
            background-repeat: no-repeat;
            animation: shine 5s infinite linear;
        }

        @keyframes shine {
            0% {
                background-position: 50% 0;
            }
            100% {
                background-position: -190% 0;
            }
        }

        &::after {
            display: flex;
            content: "";
            position: absolute;
            background-image: var(--head-bg);
            left: 0;
            top: 0;
            width: 100vw;
            height: 60px;
            background-size: 100% 100%;
            opacity: 0.8;
            z-index: 0;
        }
    }
    .centre {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        .box {
            position: relative;
            padding: 10px;
            width: 300px;
            z-index: 9999999;
            .card-box {
                margin-bottom: 20px;
            }
        }
        .right {
            .list {
                height: 200px;
                overflow-y: auto;
                .people {
                    margin: 5px 10px;
                    .item {
                        height: 26px;
                        line-height: 26px;
                        border-bottom: 1px dashed #56bce7;
                        span {
                            margin-left: 5px;
                        }
                        .state {
                            color: #ff123b;
                        }
                    }
                }
            }
        }
        .left {
            .device-online {
                display: flex;
                align-items: center;
                .device {
                    margin-top: 10px;
                    margin-left: 10px;
                    span {
                        font-weight: 900;
                        color: #3cadc9;
                    }
                }
            }
            #deviceOnline {
                width: 100px;
                height: 100px;
            }
            #numberOfAlarms {
                width: 100%;
                height: 200px;
            }
            #distribute {
                width: 100%;
                height: 300px;
            }
        }
    }
}

.control {
    position: fixed;
    left: 50%;
    bottom: 0;
    transform: translate(-50%, -50%);
    .el-dropdown {
        margin-left: 10px;
    }
}
</style>
