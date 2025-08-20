import config from "@/config"
import http from "@/utils/request"
import mockService from "@/mock"

// 判断是否使用mock数据
const USE_MOCK = process.env.NODE_ENV === 'development' && process.env.VUE_APP_USE_MOCK === 'true'

export default {
	upload: {
		url: `${config.API_URL}/upload`,
		name: "文件上传",
		post: async function (data, config = {}) {
			if (USE_MOCK) {
				// 返回模拟的文件上传响应
				return {
					code: 200,
					message: "文件上传成功",
					data: {
						url: "https://example.com/uploaded-file.jpg",
						filename: "uploaded-file.jpg",
						size: 1024
					}
				};
			}
			return await http.post(this.url, data, config);
		}
	},
	uploadFile: {
		url: `${config.API_URL}/uploadFile`,
		name: "附件上传",
		post: async function (data, config = {}) {
			if (USE_MOCK) {
				// 返回模拟的附件上传响应
				return {
					code: 200,
					message: "附件上传成功",
					data: {
						url: "https://example.com/attachment.pdf",
						filename: "attachment.pdf",
						size: 2048
					}
				};
			}
			return await http.post(this.url, data, config);
		}
	},
	exportFile: {
		url: `${config.API_URL}/fileExport`,
		name: "导出附件",
		get: async function (data, config = {}) {
			if (USE_MOCK) {
				// 返回模拟的文件导出响应
				return {
					code: 200,
					message: "文件导出成功",
					data: {
						url: "https://example.com/exported-data.xlsx",
						filename: "exported-data.xlsx"
					}
				};
			}
			return await http.get(this.url, data, config);
		}
	},
	importFile: {
		url: `${config.API_URL}/fileImport`,
		name: "导入附件",
		post: async function (data, config = {}) {
			if (USE_MOCK) {
				// 返回模拟的文件导入响应
				return {
					code: 200,
					message: "文件导入成功",
					data: {
						imported_count: 100,
						total_count: 100
					}
				};
			}
			return await http.post(this.url, data, config);
		}
	},
	file: {
		menu: {
			url: `${config.API_URL}/file/menu`,
			name: "获取文件分类",
			get: async function () {
				if (USE_MOCK) {
					// 返回模拟的文件分类数据
					return {
						code: 200,
						message: "操作成功",
						data: [
							{ id: 1, name: "图片", icon: "el-icon-picture" },
							{ id: 2, name: "文档", icon: "el-icon-document" },
							{ id: 3, name: "视频", icon: "el-icon-video-camera" }
						]
					};
				}
				return await http.get(this.url);
			}
		},
		list: {
			url: `${config.API_URL}/file/list`,
			name: "获取文件列表",
			get: async function (params) {
				if (USE_MOCK) {
					// 返回模拟的文件列表数据
					return {
						code: 200,
						message: "操作成功",
						data: {
							list: [
								{
									id: 1,
									name: "example.jpg",
									url: "https://example.com/example.jpg",
									size: 1024,
									type: "image/jpeg",
									create_time: "2024-01-20 10:30:00"
								},
								{
									id: 2,
									name: "document.pdf",
									url: "https://example.com/document.pdf",
									size: 2048,
									type: "application/pdf",
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
