<template>
    <div ref="wrap" :style="{height: height, width: width}">
        <scEcharts ref="scEcharts" height="100%" width="100%" :option="option" />
    </div>
</template>

<script>
import scEcharts from "@/components/scEcharts";

export default {
    name: "AlarmGauge",
    components: { scEcharts },
    props: {
        value: { type: Number, default: 0 },
        max: { type: Number, default: 100 },
        levelText: { type: String, default: "" },
        height: { type: String, default: "160px" },
        width: { type: String, default: "100%" },
        // 主进度颜色
        progressColor: { type: String, default: "#3B82F6" },
        // 背景区间颜色（低/中/高）
        bandColors: {
            type: Array,
            default: () => ["#FF6B6B", "#FFB020", "#5B8FF9"],
        },
        // 圆点到外沿的贴合程度（百分比长度，越大越靠外）
        dotPercent: { type: Number, default: 100 },
        // 圆点直径（像素）
        dotSize: { type: Number, default: 16 },
        // 圆点回缩百分比，用于抵消圆点半径带来的"探出"，建议 1~3
        dotBackoff: { type: Number, default: 2 },
        // 是否自动根据容器尺寸与圆点大小计算最佳回缩
        autoFitDot: { type: Boolean, default: true },
        // 额外内收像素（>0 会将圆点推入仪表盘内部）
        dotInsetPx: { type: Number, default: 0 },
        // 等级文字颜色
        levelColor: { type: String, default: "#16a34a" },
    },
    data() {
        return {
            dotBackoffAuto: 2,
            _resizeHandler: null,
        };
    },
    computed: {
        percentage() {
            const v = Math.max(0, Math.min(this.value, this.max));
            return Number(((v / this.max) * 100).toFixed(2));
        },
        levelDisplay() {
            if (this.levelText) return this.levelText;
            const p = this.percentage;
            if (p < 34) return "L1-初始级";
            if (p < 67) return "L2-规范级";
            return "L3-集成级";
        },
        option() {
            const bandColors = this.bandColors.slice(0, 3);
            const backoff = this.autoFitDot
                ? this.dotBackoffAuto
                : Math.max(0, this.dotBackoff);
            return {
                animation: true,
                grid: { left: 0, right: 0, top: 0, bottom: 0 },
                series: [
                    // 背景分段细环
                    {
                        type: "gauge",
                        startAngle: 180,
                        endAngle: 0,
                        center: ["50%", "60%"],
                        radius: "100%",
                        axisLine: {
                            lineStyle: {
                                width: 8,
                                color: [
                                    [1 / 3, bandColors[0]],
                                    [2 / 3, bandColors[1]],
                                    [1, bandColors[2]],
                                ],
                            },
                        },
                        pointer: { show: false },
                        splitLine: { show: false },
                        axisTick: { show: false },
                        axisLabel: { show: false },
                        detail: { show: false },
                        progress: { show: false },
                    },
                    // 主进度粗环
                    {
                        type: "gauge",
                        startAngle: 180,
                        endAngle: 0,
                        center: ["50%", "60%"],
                        radius: "100%",
                        axisLine: {
                            lineStyle: {
                                width: 14,
                                color: [[1, "#EDF1F7"]],
                            },
                        },
                        progress: {
                            show: true,
                            roundCap: true,
                            width: 14,
                            itemStyle: { color: this.progressColor },
                        },
                        pointer: { show: false },
                        splitLine: { show: false },
                        axisTick: { show: false },
                        axisLabel: { show: false },
                        anchor: { show: false },
                        data: [
                            {
                                value: Math.max(
                                    0,
                                    Math.min(this.value, this.max)
                                ),
                            },
                        ],
                        detail: { show: false },
                        animationDuration: 600,
                    },
                    // 末端圆点
                    {
                        type: "gauge",
                        startAngle: 180,
                        endAngle: 0,
                        center: ["50%", "60%"],
                        radius: "100%",
                        z: 10,
                        axisLine: { lineStyle: { width: 0 } },
                        splitLine: { show: false },
                        axisTick: { show: false },
                        axisLabel: { show: false },
                        progress: { show: false },
                        pointer: {
                            show: true,
                            showAbove: true,
                            icon: "circle",
                            length: "182%",
                            width: this.dotSize,
                            itemStyle: {
                                color: "#67c23a",
                                borderColor: "#ffffff",
                                borderWidth: 2,
                            },
                        },
                        anchor: { show: false },
                        detail: { show: false },
                        data: [
                            {
                                value: Math.max(
                                    0,
                                    Math.min(this.value, this.max)
                                ),
                            },
                        ],
                        animationDuration: 600,
                    },
                    // 装饰渐变弧形
                    {
                        type: "gauge",
                        startAngle: 180,
                        endAngle: 0,
                        center: ["50%", "60%"],
                        radius: "75%",
                        z: 1,
                        axisLine: {
                            lineStyle: {
                                width: 3,
                                color: [
                                    [
                                        1,
                                        {
                                            type: "linear",
                                            x: 0,
                                            y: 0,
                                            x2: 1,
                                            y2: 0,
                                            colorStops: [
                                                {
                                                    offset: 0,
                                                    color: "#F75C5C",
                                                },
                                                {
                                                    offset: 0.25,
                                                    color: "#F98A34",
                                                },
                                                {
                                                    offset: 0.5,
                                                    color: "#FCBA00",
                                                },
                                                {
                                                    offset: 0.75,
                                                    color: "#27A845",
                                                },
                                                {
                                                    offset: 1,
                                                    color: "#2961FF",
                                                },
                                            ],
                                        },
                                    ],
                                ],
                            },
                        },
                        pointer: { show: false },
                        splitLine: { show: false },
                        axisTick: { show: false },
                        axisLabel: { show: false },
                        detail: { show: false },
                        progress: { show: false },
                    },
                ],
                graphic: [
                    {
                        type: "text",
                        left: "center",
                        top: "62%",
                        style: {
                            text: this.levelDisplay,
                            fontSize: 18,
                            fontWeight: 600,
                            fill: this.levelColor,
                        },
                    },
                    {
                        type: "text",
                        left: "center",
                        top: "78%",
                        style: {
                            text: `综合得分：${Math.round(this.value)}分`,
                            fontSize: 12,
                            fill: "#666",
                        },
                    },
                ],
            };
        },
    },
    methods: {
        updateAutoBackoff() {
            if (!this.$refs.wrap) return;
            const w = this.$refs.wrap.clientWidth || 0;
            const h = this.$refs.wrap.clientHeight || 0;
            if (!w || !h) return;
            const radius = Math.min(w, h) / 2;
            const visualPadding = 1; // 轻微视觉内缩，避免越界
            const pxBackoff =
                this.dotSize / 2 + visualPadding + Math.max(0, this.dotInsetPx);
            const percent = (pxBackoff / radius) * 100;
            this.dotBackoffAuto = Math.max(
                0,
                Math.min(6, Number(percent.toFixed(2)))
            );
        },
        waitForEchartsReady() {
            // 检查 scEcharts 组件是否准备好
            if (this.$refs.scEcharts && this.$refs.scEcharts.myChart) {
                this.updateAutoBackoff();
                this._resizeHandler = () => this.updateAutoBackoff();
                window.addEventListener("resize", this._resizeHandler);
            } else {
                // 如果还没准备好，延迟重试
                this.$nextTick(() => {
                    setTimeout(() => this.waitForEchartsReady(), 50);
                });
            }
        },
    },
    mounted() {
        this.$nextTick(() => {
            // 等待 scEcharts 组件完全初始化
            this.waitForEchartsReady();
        });
    },
    beforeUnmount() {
        if (this._resizeHandler) {
            window.removeEventListener("resize", this._resizeHandler);
            this._resizeHandler = null;
        }
    },
};
</script>

<style scoped>
:deep(.echarts) {
    user-select: none;
}
</style>


