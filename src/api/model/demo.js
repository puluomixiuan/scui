import config from "@/config"
import http from "@/utils/request"
import mockService from "@/mock"

// 判断是否使用mock数据
const USE_MOCK = true // 临时启用mock数据，方便测试

export default {
	ver: {
		url: `${config.API_URL}/demo/ver`,
		name: "获取最新版本号",
		get: async function (params) {
			if (USE_MOCK) {
				return await mockService.getDemoVer();
			}
			return await http.get(this.url, params);
		}
	},
	post: {
		url: `${config.API_URL}/demo/post`,
		name: "分页列表",
		post: async function (data) {
			if (USE_MOCK) {
				return await mockService.postDemo(data);
			}
			return await http.post(this.url, data, {
				headers: {
					//'response-status': 401
				}
			});
		}
	},
	page: {
		url: `${config.API_URL}/demo/page`,
		name: "分页列表",
		get: async function (params) {
			if (USE_MOCK) {
				// 返回模拟的分页数据
				return {
					code: 200,
					message: "操作成功",
					data: {
						list: [
							{ id: 1, name: "示例数据1", status: 1, create_time: "2024-01-20 10:30:00" },
							{ id: 2, name: "示例数据2", status: 1, create_time: "2024-01-20 09:15:00" }
						],
						total: 2,
						page: 1,
						limit: 10
					}
				};
			}
			return await http.get(this.url, params);
		}
	},
	list: {
		url: `${config.API_URL}/demo/list`,
		name: "数据列表",
		get: async function (params) {
			if (USE_MOCK) {
				// 返回模拟的数据列表
				return {
					code: 200,
					message: "操作成功",
					data: [
						{ id: 1, name: "示例数据1", status: 1 },
						{ id: 2, name: "示例数据2", status: 1 },
						{ id: 3, name: "示例数据3", status: 0 }
					]
				};
			}
			return await http.get(this.url, params);
		}
	},
	menu: {
		url: `${config.API_URL}/demo/menu`,
		name: "普通用户菜单",
		get: async function () {
			if (USE_MOCK) {
				return await mockService.getUserMenus(['dashboard', 'profile', 'settings']);
			}
			return await http.get(this.url);
		}
	},
	status: {
		url: `${config.API_URL}/demo/status`,
		name: "模拟无权限",
		get: async function (code) {
			if (USE_MOCK) {
				// 根据code返回不同的模拟响应
				if (code === 401) {
					return {
						code: 401,
						message: "无权限访问",
						data: null
					};
				} else if (code === 403) {
					return {
						code: 403,
						message: "禁止访问",
						data: null
					};
				} else {
					return {
						code: 200,
						message: "操作成功",
						data: { status: "normal" }
					};
				}
			}
			return await http.get(this.url, {}, {
				headers: {
					"response-status": code
				}
			});
		}
	}
}
