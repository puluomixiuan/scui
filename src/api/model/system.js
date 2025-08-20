import config from "@/config"
import http from "@/utils/request"
import mockService from "@/mock"

// 判断是否使用mock数据
const USE_MOCK = true // 临时启用mock数据，方便测试

export default {
	menu: {
		myMenus: {
			url: `${config.API_URL}/system/menu/my/1.6.1`,
			name: "获取我的菜单",
			get: async function () {
				if (USE_MOCK) {
					return await mockService.getMenuList();
				}
				return await http.get(this.url);
			}
		},
		list: {
			url: `${config.API_URL}/system/menu/list`,
			name: "获取菜单",
			get: async function () {
				if (USE_MOCK) {
					return await mockService.getMenuList();
				}
				return await http.get(this.url);
			}
		}
	},
	dic: {
		tree: {
			url: `${config.API_URL}/system/dic/tree`,
			name: "获取字典树",
			get: async function () {
				if (USE_MOCK) {
					// 返回模拟的字典树数据
					return {
						code: 200,
						message: "操作成功",
						data: [
							{
								id: 1,
								name: "系统字典",
								children: [
									{ id: 11, name: "用户状态", value: "user_status" },
									{ id: 12, name: "评估类型", value: "evaluation_type" }
								]
							}
						]
					};
				}
				return await http.get(this.url);
			}
		},
		list: {
			url: `${config.API_URL}/system/dic/list`,
			name: "字典明细",
			get: async function (params) {
				if (USE_MOCK) {
					// 返回模拟的字典明细数据
					return {
						code: 200,
						message: "操作成功",
						data: {
							list: [
								{ id: 1, name: "启用", value: "1", sort: 1 },
								{ id: 2, name: "禁用", value: "0", sort: 2 }
							],
							total: 2
						}
					};
				}
				return await http.get(this.url, params);
			}
		},
		get: {
			url: `${config.API_URL}/system/dic/get`,
			name: "获取字典数据",
			get: async function (params) {
				if (USE_MOCK) {
					// 返回模拟的字典数据
					return {
						code: 200,
						message: "操作成功",
						data: [
							{ id: 1, name: "启用", value: "1" },
							{ id: 2, name: "禁用", value: "0" }
						]
					};
				}
				return await http.get(this.url, params);
			}
		}
	},
	role: {
		list: {
			url: `${config.API_URL}/system/role/list2`,
			name: "获取角色列表",
			get: async function (params) {
				if (USE_MOCK) {
					// 返回模拟的角色列表数据
					return {
						code: 200,
						message: "操作成功",
						data: {
							list: [
								{ id: 1, name: "超级管理员", code: "admin", status: 1 },
								{ id: 2, name: "普通用户", code: "user", status: 1 },
								{ id: 3, name: "访客", code: "guest", status: 1 }
							],
							total: 3
						}
					};
				}
				return await http.get(this.url, params);
			}
		}
	},
	dept: {
		list: {
			url: `${config.API_URL}/system/dept/list`,
			name: "获取部门列表",
			get: async function (params) {
				if (USE_MOCK) {
					// 返回模拟的部门列表数据
					return {
						code: 200,
						message: "操作成功",
						data: {
							list: [
								{ id: 1, name: "技术部", parent_id: 0, sort: 1 },
								{ id: 2, name: "产品部", parent_id: 0, sort: 2 },
								{ id: 3, name: "运营部", parent_id: 0, sort: 3 }
							],
							total: 3
						}
					};
				}
				return await http.get(this.url, params);
			}
		}
	},
	user: {
		list: {
			url: `${config.API_URL}/system/user/list`,
			name: "获取用户列表",
			get: async function (params) {
				if (USE_MOCK) {
					return await mockService.getUserList(params);
				}
				return await http.get(this.url, params);
			}
		}
	},
	app: {
		list: {
			url: `${config.API_URL}/system/app/list`,
			name: "应用列表",
			get: async function () {
				if (USE_MOCK) {
					// 返回模拟的应用列表数据
					return {
						code: 200,
						message: "操作成功",
						data: {
							list: [
								{ id: 1, name: "评估系统", code: "evaluation", status: 1 },
								{ id: 2, name: "管理系统", code: "admin", status: 1 }
							],
							total: 2
						}
					};
				}
				return await http.get(this.url);
			}
		}
	},
	log: {
		list: {
			url: `${config.API_URL}/system/log/list`,
			name: "日志列表",
			get: async function (params) {
				if (USE_MOCK) {
					// 返回模拟的日志列表数据
					return {
						code: 200,
						message: "操作成功",
						data: {
							list: [
								{
									id: 1,
									user_name: "admin",
									action: "登录",
									ip: "127.0.0.1",
									create_time: "2024-01-20 10:30:00"
								},
								{
									id: 2,
									user_name: "user",
									action: "查看用户列表",
									ip: "127.0.0.1",
									create_time: "2024-01-20 09:15:00"
								}
							],
							total: 2
						}
					};
				}
				return await http.get(this.url, params);
			}
		}
	},
	table: {
		list: {
			url: `${config.API_URL}/system/table/list`,
			name: "表格列管理列表",
			get: async function (params) {
				if (USE_MOCK) {
					// 返回模拟的表格列管理数据
					return {
						code: 200,
						message: "操作成功",
						data: {
							list: [
								{ id: 1, table_name: "user", column_name: "username", title: "用户名", sort: 1 },
								{ id: 2, table_name: "user", column_name: "nickname", title: "昵称", sort: 2 }
							],
							total: 2
						}
					};
				}
				return await http.get(this.url, params);
			}
		},
		info: {
			url: `${config.API_URL}/system/table/info`,
			name: "表格列管理详情",
			get: async function (params) {
				if (USE_MOCK) {
					// 返回模拟的表格列管理详情数据
					return {
						code: 200,
						message: "操作成功",
						data: {
							id: 1,
							table_name: "user",
							column_name: "username",
							title: "用户名",
							sort: 1,
							status: 1
						}
					};
				}
				return await http.get(this.url, params);
			}
		}
	},
	tasks: {
		list: {
			url: `${config.API_URL}/system/tasks/list`,
			name: "系统任务管理",
			get: async function (params) {
				if (USE_MOCK) {
					// 返回模拟的系统任务数据
					return {
						code: 200,
						message: "操作成功",
						data: {
							list: [
								{
									id: 1,
									name: "数据备份",
									cron: "0 2 * * *",
									status: 1,
									create_time: "2024-01-20 10:30:00"
								},
								{
									id: 2,
									name: "日志清理",
									cron: "0 3 * * 0",
									status: 1,
									create_time: "2024-01-20 09:15:00"
								}
							],
							total: 2
						}
					};
				}
				return await http.get(this.url, params);
			}
		}
	}
}
