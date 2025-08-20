import config from "@/config"
import http from "@/utils/request"
import mockService from "@/mock"

// 判断是否使用mock数据
const USE_MOCK = true // 临时启用mock数据，方便测试

export default {
	token: {
		url: `${config.API_URL}/token`,
		name: "登录获取TOKEN",
		post: async function (data = {}) {
			if (USE_MOCK) {
				return await mockService.login(data);
			}
			return await http.post(this.url, data);
		}
	}
}
