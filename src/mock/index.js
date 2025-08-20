import mockData from './data.json'

// Mock API 服务
class MockService {
    constructor() {
        this.data = mockData;
        this.init();
    }

    init() {
        console.log('🚀 Mock服务已启动');
    }

    // 模拟网络延迟
    async delay(ms = 300) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 通用响应格式
    success(data, message = '操作成功') {
        return {
            code: 200,
            message,
            data,
            timestamp: new Date().toISOString()
        };
    }

    error(message = '操作失败', code = 500) {
        return {
            code,
            message,
            data: null,
            timestamp: new Date().toISOString()
        };
    }

    // 用户相关API
    async login(params) {
        await this.delay();

        const { username, password } = params;

        // 添加调试信息
        console.log('🔍 Mock登录请求参数:', { username, password });

        // 匹配用户名和MD5加密后的密码
        // admin的MD5: 21232f297a57a5a743894a0e4a801fc3
        // user的MD5: ee11cbb19052e40b07aac0ca060c23ee
        let userData = null;

        if (username === 'admin' && password === '21232f297a57a5a743894a0e4a801fc3') {
            // admin用户
            userData = this.data.users.find(u => u.username === 'admin');
            console.log('✅ 匹配到admin用户:', userData);
        } else if (username === 'user' && password === 'ee11cbb19052e40b07aac0ca060c23ee') {
            // user用户
            userData = this.data.users.find(u => u.username === 'user');
            console.log('✅ 匹配到user用户:', userData);
        } else if (username === 'guest' && password === '084e0343a0486ff05530df6c705c8bb4') {
            // guest用户 (guest的MD5)
            userData = this.data.users.find(u => u.username === 'guest');
            console.log('✅ 匹配到guest用户:', userData);
        } else {
            console.log('❌ 未匹配到用户，参数不匹配');
        }

        if (!userData) {
            return this.error('用户不存在或密码错误', 401);
        }

        // 返回用户信息和菜单
        const userInfo = {
            ...userData,
            // 添加系统期望的字段名
            userName: userData.username,
            name: userData.nickname,
            group: userData.role,
            groupName: userData.role_name,
            role: [userData.role], // 转换为数组格式，路由权限检查需要
            date: userData.create_time,
            token: `mock_token_${userData.id}_${Date.now()}`,
            menus: this.getUserMenus(userData.permissions),
            menuList: this.getUserMenus(userData.permissions), // 添加menuList字段，路由需要
            dashboard: '0' // 添加dashboard字段
        };

        console.log('🎯 返回用户信息:', userInfo);
        return this.success({
            userInfo: userInfo,
            token: userInfo.token
        }, '登录成功');
    }

    async loginDemo(params) {
        await this.delay();

        const { user, password } = params;

        // 直接匹配MD5加密后的用户名和密码
        // user的MD5: ee11cbb19052e40b07aac0ca060c23ee
        let userData = null;

        if (user === 'ee11cbb19052e40b07aac0ca060c23ee' && password === 'ee11cbb19052e40b07aac0ca060c23ee') {
            // user用户
            userData = this.data.users.find(u => u.username === 'user');
        }

        if (!userData) {
            return this.error('用户不存在或密码错误', 401);
        }

        const userInfo = {
            ...userData,
            // 添加系统期望的字段名
            userName: userData.username,
            name: userData.nickname,
            group: userData.role,
            groupName: userData.role_name,
            role: [userData.role], // 转换为数组格式，路由权限检查需要
            date: userData.create_time,
            token: `mock_demo_token_${Date.now()}`,
            menus: this.getUserMenus(['dashboard', 'profile', 'settings']),
            menuList: this.getUserMenus(['dashboard', 'profile', 'settings']), // 添加menuList字段，路由需要
            dashboard: '0' // 添加dashboard字段
        };

        console.log('🎯 返回用户信息:', userInfo);
        return this.success({
            userInfo: userInfo,
            token: userInfo.token
        }, '登录成功');
    }

    async getUserList(params = {}) {
        await this.delay();

        let users = [...this.data.users];

        // 模拟分页
        const { page = 1, limit = 10, keyword = '' } = params;

        if (keyword) {
            users = users.filter(user =>
                user.username.includes(keyword) ||
                user.nickname.includes(keyword) ||
                user.email.includes(keyword)
            );
        }

        const total = users.length;
        const start = (page - 1) * limit;
        const end = start + limit;
        const list = users.slice(start, end).map(user => ({
            ...user,
            // 添加系统期望的字段名
            userName: user.username,
            name: user.nickname,
            group: user.role,
            groupName: user.role_name,
            date: user.create_time
        }));

        return this.success({
            list,
            total,
            page: parseInt(page),
            limit: parseInt(limit)
        });
    }

    async saveUser(params) {
        await this.delay();

        const { id, ...userData } = params;

        if (id) {
            // 更新用户
            const index = this.data.users.findIndex(u => u.id === id);
            if (index !== -1) {
                this.data.users[index] = { ...this.data.users[index], ...userData };
                return this.success(this.data.users[index], '用户更新成功');
            }
        } else {
            // 新增用户
            const newUser = {
                id: Math.max(...this.data.users.map(u => u.id)) + 1,
                ...userData,
                create_time: new Date().toISOString().replace('T', ' ').split('.')[0],
                status: 1
            };
            this.data.users.push(newUser);
            return this.success(newUser, '用户创建成功');
        }

        return this.error('操作失败');
    }

    async deleteUser(params) {
        await this.delay();

        const { id } = params;
        const index = this.data.users.findIndex(u => u.id === id);

        if (index !== -1) {
            this.data.users.splice(index, 1);
            return this.success(null, '用户删除成功');
        }

        return this.error('用户不存在');
    }

    // 菜单相关API
    async getMenuList() {
        await this.delay();

        // 添加调试信息
        console.log('📋 Mock菜单数据:', this.data.menus);

        return this.success({
            menu: this.data.menus,
            permissions: ['*'],
            dashboardGrid: this.data.stats
        });
    }

    async saveMenu(params) {
        await this.delay();

        const { id, ...menuData } = params;

        if (id) {
            // 更新菜单
            const updateMenu = (menus) => {
                for (let i = 0; i < menus.length; i++) {
                    if (menus[i].id === id) {
                        menus[i] = { ...menus[i], ...menuData };
                        return true;
                    }
                    if (menus[i].children && updateMenu(menus[i].children)) {
                        return true;
                    }
                }
                return false;
            };

            if (updateMenu(this.data.menus)) {
                return this.success(null, '菜单更新成功');
            }
        } else {
            // 新增菜单
            const newMenu = {
                id: Math.max(...this.getAllMenuIds()) + 1,
                ...menuData,
                status: 1
            };
            this.data.menus.push(newMenu);
            return this.success(newMenu, '菜单创建成功');
        }

        return this.error('操作失败');
    }

    // 统计相关API
    async getStats() {
        await this.delay();
        return this.success(this.data.stats);
    }

    // 辅助方法
    getUserMenus(permissions) {
        if (permissions.includes('*')) {
            return this.data.menus;
        }

        // 根据权限过滤菜单
        const filterMenus = (menus) => {
            return menus.filter(menu => {
                // 检查当前菜单是否有权限
                let hasPermission = false;

                // 检查路径权限 - 适配新的菜单结构
                const pathKey = menu.path.replace('/', '');
                if (permissions.includes(pathKey)) {
                    hasPermission = true;
                }

                // 检查评估系统权限
                if (pathKey === 'evaluating' && permissions.includes('evaluating')) {
                    hasPermission = true;
                }

                // 检查子菜单权限
                if (menu.children && menu.children.length > 0) {
                    menu.children = filterMenus(menu.children);
                    // 如果子菜单有权限，父菜单也应该显示
                    if (menu.children.length > 0) {
                        hasPermission = true;
                    }
                }

                return hasPermission;
            });
        };

        return filterMenus(JSON.parse(JSON.stringify(this.data.menus)));
    }

    getAllMenuIds() {
        const ids = [];
        const collectIds = (menus) => {
            menus.forEach(menu => {
                ids.push(menu.id);
                if (menu.children && menu.children.length > 0) {
                    collectIds(menu.children);
                }
            });
        };
        collectIds(this.data.menus);
        return ids;
    }

    // Demo相关API
    async getDemoVer() {
        await this.delay();
        return this.success({
            version: "1.6.9",
            build_time: "2024-01-20 10:30:00",
            changelog: "修复已知问题，优化用户体验"
        });
    }

    async getDemoMenu() {
        await this.delay();
        return this.success({
            menu: [
                {
                    name: "dashboard",
                    path: "/dashboard",
                    meta: {
                        title: "仪表板",
                        icon: "el-icon-s-data",
                        type: "menu"
                    },
                    component: "dashboard/index"
                },
                {
                    name: "profile",
                    path: "/profile",
                    meta: {
                        title: "个人中心",
                        icon: "el-icon-user",
                        type: "menu"
                    },
                    component: "profile/index"
                },
                {
                    name: "settings",
                    path: "/settings",
                    meta: {
                        title: "系统设置",
                        icon: "el-icon-setting",
                        type: "menu"
                    },
                    component: "settings/index"
                }
            ],
            permissions: ["dashboard", "profile", "settings"],
            dashboardGrid: this.data.stats
        });
    }

    async getDemoList(params = {}) {
        await this.delay();
        return this.success([
            { id: 1, name: "示例数据1", status: 1 },
            { id: 2, name: "示例数据2", status: 1 },
            { id: 3, name: "示例数据3", status: 0 }
        ]);
    }

    async getDemoPage(params = {}) {
        await this.delay();
        return this.success({
            list: [
                { id: 1, name: "示例数据1", status: 1, create_time: "2024-01-20 10:30:00" },
                { id: 2, name: "示例数据2", status: 1, create_time: "2024-01-20 09:15:00" }
            ],
            total: 2,
            page: 1,
            limit: 10
        });
    }

    async postDemo(data = {}) {
        await this.delay();
        return this.success({
            list: [
                { id: 1, name: "示例数据1", status: 1, create_time: "2024-01-20 10:30:00" },
                { id: 2, name: "示例数据2", status: 1, create_time: "2024-01-20 09:15:00" }
            ],
            total: 2,
            page: 1,
            limit: 10
        });
    }

    async getDemoStatus() {
        await this.delay();
        return this.success({
            status: "running",
            uptime: "2天3小时15分钟",
            memory_usage: "45%",
            cpu_usage: "23%"
        });
    }
}

// 创建全局mock服务实例
const mockService = new MockService();

export default mockService;
