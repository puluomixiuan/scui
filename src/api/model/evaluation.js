import config from "@/config"
import http from "@/utils/request"

export default {
    // 评估列表
    evaluation: {
        list: {
            url: `${config.API_URL}/evaluation/list`,
            name: "获取评估列表",
            get: async function (params) {
                return await http.get(this.url, params);
            }
        },
        save: {
            url: `${config.API_URL}/evaluation/save`,
            name: "保存评估",
            post: async function (data) {
                return await http.post(this.url, data);
            }
        },
        delete: {
            url: `${config.API_URL}/evaluation/delete`,
            name: "删除评估",
            post: async function (data) {
                return await http.post(this.url, data);
            }
        }
    },

    // 评估项目
    project: {
        list: {
            url: `${config.API_URL}/evaluation/project/list`,
            name: "获取评估项目列表",
            get: async function (params) {
                return await http.get(this.url, params);
            }
        },
        save: {
            url: `${config.API_URL}/evaluation/project/save`,
            name: "保存评估项目",
            post: async function (data) {
                return await http.post(this.url, data);
            }
        },
        delete: {
            url: `${config.API_URL}/evaluation/project/delete`,
            name: "删除评估项目",
            post: async function (data) {
                return await http.post(this.url, data);
            }
        }
    },

    // 评估指标
    indicator: {
        list: {
            url: `${config.API_URL}/evaluation/indicator/list`,
            name: "获取评估指标列表",
            get: async function (params) {
                return await http.get(this.url, params);
            }
        },
        save: {
            url: `${config.API_URL}/evaluation/indicator/save`,
            name: "保存评估指标",
            post: async function (data) {
                return await http.post(this.url, data);
            }
        },
        delete: {
            url: `${config.API_URL}/evaluation/indicator/delete`,
            name: "删除评估指标",
            post: async function (data) {
                return await http.post(this.url, data);
            }
        }
    },

    // 评估报告
    report: {
        list: {
            url: `${config.API_URL}/evaluation/report/list`,
            name: "获取评估报告列表",
            get: async function (params) {
                return await http.get(this.url, params);
            }
        },
        save: {
            url: `${config.API_URL}/evaluation/report/save`,
            name: "保存评估报告",
            post: async function (data) {
                return await http.post(this.url, data);
            }
        },
        delete: {
            url: `${config.API_URL}/evaluation/report/delete`,
            name: "删除评估报告",
            post: async function (data) {
                return await http.post(this.url, data);
            }
        }
    },

    // 统计数据
    stats: {
        overview: {
            url: `${config.API_URL}/evaluation/stats/overview`,
            name: "获取评估统计概览",
            get: async function () {
                return await http.get(this.url);
            }
        },
        chart: {
            url: `${config.API_URL}/evaluation/stats/chart`,
            name: "获取评估图表数据",
            get: async function (params) {
                return await http.get(this.url, params);
            }
        }
    }
}
