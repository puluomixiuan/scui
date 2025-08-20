<template>
    <el-main>
        <div class="app-container">
            <div class="header">
                <div class="logo-container">
                    <div class="logo">
                        <img src="/evaluating/logo.png" width="236" height="30" style="margin-top: 13px" />
                    </div>
                    <div class="title">|　中小企业数字化转型评测系统</div>
                    <div class="date-display">
                        {{ currentDate }} {{ currentTime }} {{ currentDay }}
                    </div>
                </div>
            </div>

            <!-- 主题内容 -->
            <div class="main-content bg" v-if="nextActive == 0" :style="{ backgroundImage: 'url(/evaluating/bg.png)' }">
                <img src="/evaluating/icon.png" width="220" height="165" />
                <div class="welcome-section">
                    <div class="welcome-text">
                        欢迎使用中小企业数字化转型评测系统
                    </div>
                    <div class="welcome-desc">
                        全面评估企业数字化水平，提供专业转型建议
                    </div>
                </div>
                <el-button type="primary" size="large" @click="startEvaluation(1)">
                    开始测评<el-icon style="margin-left: 20px"><el-icon-right /></el-icon>
                </el-button>
            </div>

            <div class="main-content" v-if="nextActive == 1">
                <next1 @nextStep="startEvaluation"></next1>
            </div>

            <div class="main-content" v-if="nextActive == 2">
                <next2 @nextStep="startEvaluation"></next2>
            </div>

            <div class="main-content" v-if="nextActive == 3">
                <next3 @nextStep="startEvaluation"></next3>
            </div>

            <div class="footer">
                © 2025 中小企业数字化转型评测系统 | 助力企业数字化转型升级
            </div>
        </div>
    </el-main>
</template>

<script>
import next1 from "./template/next1.vue";
import next2 from "./template/next2.vue";
import next3 from "./template/next3.vue";

export default {
    name: "EvaluationSystem",
    components: {
        next1,
        next2,
        next3,
    },
    data() {
        return {
            currentDate: "",
            currentTime: "",
            currentDay: "",
            nextActive: 0,
        };
    },
    mounted() {
        this.updateDateTime();
        setInterval(this.updateDateTime, 60000);

        // 监听窗口大小变化，处理分辨率切换
        window.addEventListener("resize", this.handleResize);
        // 初始化时也调用一次
        this.handleResize();
    },
    beforeUnmount() {
        // 清理事件监听
        window.removeEventListener("resize", this.handleResize);
    },
    methods: {
        handleResize() {
            // 强制重新计算视口尺寸，避免分辨率切换时出现滚动条
            const vh = window.innerHeight * 0.01;
            const vw = window.innerWidth * 0.01;
            document.documentElement.style.setProperty("--vh", `${vh}px`);
            document.documentElement.style.setProperty("--vw", `${vw}px`);
        },
        updateDateTime() {
            const now = new Date();

            this.currentDate = now.toLocaleDateString("zh-CN", {
                year: "numeric",
                month: "numeric",
                day: "numeric",
            });

            this.currentTime = now.toLocaleTimeString("zh-CN", {
                hour: "2-digit",
                minute: "2-digit",
            });

            const days = [
                "星期日",
                "星期一",
                "星期二",
                "星期三",
                "星期四",
                "星期五",
                "星期六",
            ];
            this.currentDay = days[now.getDay()];
        },
        startEvaluation(e) {
            console.log("Evaluation started");
            this.nextActive = e;
        },
    },
};
</script>

<style lang="scss" scoped>
/* 定义基础变量 */
:root {
    --base-width: 1080px; /* 目标宽度 */
    --scale-factor: 1; /* 缩放系数 */
}

.app-container {
    display: flex;
    flex-direction: column;
    // 框架内打开屏蔽此段代码
    // width: 100vw;
    // min-height: 100vh;
    // min-height: calc(var(--vh, 1vh) * 100);
    box-sizing: border-box;

    .header {
        text-align: center;
        color: #fff;
        background: #2961ff;
        .logo-container {
            color: #fff;
            display: flex;
            align-items: center;
            min-height: 56px;
            .logo {
                margin: 0 10px 0 20px;
            }
            .title {
                font-size: 16px;
            }
        }

        .date-display {
            text-align: right;
            color: #fff;
            font-size: 14px;
            margin-left: auto;
            margin-right: 16px;
        }
    }

    .main-content {
        // background: url(/evaluating/bg.png) no-repeat ;
        // background-size: 100% 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        // 115px 是在el-main 的满屏高度
        min-height: calc(100vh - 56px - 36px - 115px); 
        // min-height: calc((var(--vh, 1vh) * 100) - 56px - 36px);

        .welcome-text {
            font-size: 32px;
            font-weight: 500;
            color: #001b4d;
            margin: 24px 0 16px 0;
        }
        .welcome-desc {
            font-size: 20px;
            font-weight: 400;
            color: #001b4d;
            margin-bottom: 72px;
            text-align: center;
        }
        button {
            font-size: 20px;
            color: #ffffff;
            width: 280px;
            height: 64px;
            background: #2961ff;
            border-radius: 8px;
        }
    }

    .bg {
        background-repeat: no-repeat;
        background-size: 100% 100%;
    }

    .footer {
        margin-top: auto;
        color: #fff;
        font-size: 12px;
        font-weight: 500;
        text-align: center;
        background: linear-gradient(
            148deg,
            #1eb8ff 0%,
            #73ff12 100%,
            #000000 100%
        );
        min-height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
}
</style>
 