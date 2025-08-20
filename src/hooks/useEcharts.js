import { watch, onMounted, ref } from "vue";
import * as echarts from "echarts";
export default function (option, element) {
    const myChart = ref(null);
    watch(
        () => option,
        () => {
            if (!myChart.value) return;
            myChart.value.setOption(option.value);
        },
        { immediate: true, deep: true },
    );
    onMounted(() => {
        const elementNode = element instanceof Element ? element : document.getElementById(element);
        myChart.value = echarts.init(elementNode);
        myChart.value.setOption(option.value);
    });
}