<template>
    <!-- 主题内容 -->
    <el-row class="enterprise-info-form" ref="scrollContainer">
        <el-col :style="{ width: '17.3%', flex: 'none' }"></el-col>
        <el-col :style="{ width: '65.4%', flex: 'none' }">
            <div class="main">
                <div class="main_box">
                    <div class="title">企业数字化转型能力评测报告</div>
                    <div class="time">评测完成时间：2025-10-25 14:28:36 | 报告编号：DTA202310250086</div>
                    <div class="info">企业信息</div>
                    <el-row>
                        <el-col :span="12" class="info_1">
                            <img src="/evaluating/qy.png" width="16" height="16" />
                            企业名称：男女科技创新有限公司
                        </el-col>
                        <el-col :span="12" class="info_1">
                            <img src="/evaluating/hy.png" width="16" height="16" />
                            所属行业：新能源汽车及零部件</el-col>
                        <el-col :span="12" class="info_1">
                            <img src="/evaluating/user.png" width="16" height="16" />
                            企业规模：中型企业（100-200人）</el-col>
                        <el-col :span="12" class="info_1">
                            <img src="/evaluating/time.png" width="16" height="16" />
                            评测用时：18分12秒</el-col>
                    </el-row>
                    <div class="zpjg">
                        <div class="zpjg_title">总体评级结果</div>
                        <div class="zpjg_level">L4-优化级</div>
                        <div class="zpjg_score">综合得分：78分 行业排名：前30%</div>
                        <div class="zpjg_level_text">
                            <div class="text zpjg_level_red">L1-初始级</div>
                            <div class="text zpjg_level_org">L2-探索级</div>
                            <div class="text zpjg_level_yellow">L3-定义级</div>
                            <div class="text zpjg_level_green">L4-优化级</div>
                            <div class="text zpjg_level_bule">L5-引领级</div>
                        </div>
                        <div class="zpjg_level_color">
                            <div class="zpjg_level_red"></div>
                            <div class="zpjg_level_org"></div>
                            <div class="zpjg_level_yellow"></div>
                            <div class="zpjg_level_green"></div>
                            <div class="zpjg_level_bule"></div>
                        </div>
                        <div class="zpjg_ms">您的企业已进入数字化转型优化阶段，数字化应用在主要业务领域取得显著成效， 形成了标准化的数字化流程，数字化深度融入核心业务运营，技术平台支持快速创新，组织具备较强适应性和敏捷性；并开始通过数据分析驱动业务持续优化。
                        </div>
                    </div>
                    <div class="info">数转指标权重分析</div>
                    <div id="chart-container" style="width: 100%; height: 340px;"></div>
                    <div class="zbfx">根据您本次的评测情况，数字化资源、信息安全、价值效益等表现较为突出，数字化成效表现较为薄弱，继续努力突破。</div>
                    <div class="info">评级等级说明</div>
                    <div class="level_text zpjg_level_red" style="margin-bottom:10px;">L1-初始级</div>
                    <div class="level_text">数字化意识薄弱，未开展系统性数字化建设，主要依赖传统方式运营，缺乏数字化技能和资源。</div>
                    <div class="level_text zpjg_level_org" style="margin-bottom:10px;">L2-探索级</div>
                    <div class="level_text">开始意识到数字化重要性，在个别业务领域进行数字化尝试，但缺乏整体规划和高层推动，成效有限。</div>
                    <div class="level_text zpjg_level_yellow" style="margin-bottom:10px;">L3-定义级</div>
                    <div class="level_text">已制定数字化转型战略，在主要业务领域开展数字化建设，建立了初步的数字化流程和组织架构，开始见到转型成效。</div>
                    <div class="level_text zpjg_level_green" style="margin-bottom:10px;">L4-优化级</div>
                    <div class="level_text">数字化转型成效显著，形成标准化的数字化流程和管理体系，数据驱动决策能力较强，数字化成为业务增长的重要支撑。</div>
                    <div class="level_text zpjg_level_bule" style="margin-bottom:10px;">L5-引领级</div>
                    <div class="level_text">数字化转型成为核心竞争力，组织具备持续的数字化创新能力，形成独特的数字化商业模式，引领行业数字化发展方向。</div>

                </div>
            </div>
            <div class="main2">
                <div class="title">
                    <span>评测结果</span>
                    <span>优先解决这些问题，快速提升数字化能力</span>
                </div>
                <div class="conten">
                    <div class="conten-item">
                        <div class="conten-item-title">
                            <div style="color:#001B4D;">数据管理体系建设</div>
                            <div class="btn">高优先级</div>
                        </div>
                        <div class="conten-item-text">企业数据管理体系尚不完善，缺乏数据治理框架和数据质量管控机制，建议建立数据管理体系，明确数据管理职责和流程。</div>
                    </div>
                    <div class="conten-item">
                        <div class="conten-item-title">
                            <div style="color:#001B4D;">生态合作与数字化协同</div>
                            <div class="btn">高优先级</div>
                        </div>
                        <div class="conten-item-text">与供应商和客户的数字化协同程度较低，建议加强生态合作，建立数字化供应链协同平台，提高供应链效率和灵活性。</div>
                    </div>
                    <div class="conten-item">
                        <div class="conten-item-title">
                            <div style="color:#001B4D;">数字化营销能力</div>
                            <div class="btn2">中优先级</div>
                        </div>
                        <div class="conten-item-text">数字化营销工具和渠道应用不足，建议加强数字化营销能力建设，拓展线上销售渠道，提升品牌影响力。</div>
                    </div>
                    <div class="conten-item">
                        <div class="conten-item-title">
                            <div style="color:#001B4D;">组织数字化能力提升</div>
                            <div class="btn2">中优先级</div>
                        </div>
                        <div class="conten-item-text">员工数字化技能和意识有待提高，建议加强员工数字化培训，建立数字化文化，提升组织整体数字化能力。</div>
                    </div>
                </div>
            </div>
            <div class="main3">
                <div class="left">
                    <div class="title">需要专业的数字化转型咨询服务？</div>
                    <div class="text">我们拥有专业的咨询团队，为您提供定制化的数字化转型解决方案，助您快速实现数字化转型目标。如需进一步的数字化转型指导，可拨打
                        　<span style="color:#2961FF">400-000-0000</span>联系专业顾问，获取定制化转型方案。
                    </div>
                    <ul>
                        <li>
                            <el-icon style="color:#2961ff;font-size: 16px;margin-right:14px"><el-icon-SuccessFilled /></el-icon>
                            专业顾问1对1服务
                        </li>
                        <li>
                            <el-icon style="color:#2961ff;font-size: 16px;margin-right:14px"><el-icon-SuccessFilled /></el-icon>
                            定制化解决方案
                        </li>
                        <li>
                            <el-icon style="color:#2961ff;font-size: 16px;margin-right:14px"><el-icon-SuccessFilled /></el-icon>
                            实施落地支持
                        </li>
                    </ul>
                </div>
                <div class="right">
                    <div class="title">预约咨询</div>
                    <el-form :model="loginForm" :rules="loginRules" ref="loginForm" class="login-form">
                        <el-form-item label="姓名">
                            <el-input v-model="loginForm.username" placeholder="请输入您的姓名" size="small" />
                        </el-form-item>
                        <el-form-item label="电话">
                            <el-input v-model="loginForm.password" placeholder="请输入您的号码" size="small" />
                        </el-form-item>
                        <el-form-item label="需求">
                            <el-input v-model="loginForm.password" placeholder="请选择咨询的需求" size="small" />
                        </el-form-item>
                        <el-form-item>
                            <el-button size="small" class="login-form-button" @click="handleLogin">提交预约</el-button>
                        </el-form-item>
                    </el-form>
                </div>
            </div>

        </el-col>
        <el-col :style="{ width: '17.3%', flex: 'none' }">
            <div class="btn">
                <el-button class="nth1" icon="el-icon-download">下载报告</el-button>
                <el-button class="nth2" icon="el-icon-printer">打印报告</el-button>
                <el-button class="nth3" icon="el-icon-refresh-right">重新评测</el-button>
            </div>
        </el-col>
        <!-- 修改el-backtop，指定target为滚动容器 -->
        <el-backtop :right="100" :bottom="100" target=".enterprise-info-form" />
    </el-row>
</template>

<script>
import * as echarts from "echarts";

export default {
    name: "next3",
    data() {
        return {
            // 登录表单数据
            loginForm: {
                username: "",
                password: "",
                remember: false,
            },
            // 登录表单验证规则
            loginRules: {
                username: [
                    {
                        required: true,
                        message: "请输入用户名",
                        trigger: "blur",
                    },
                ],
                password: [
                    { required: true, message: "请输入密码", trigger: "blur" },
                ],
            },
        };
    },
    mounted() {
        const chart = echarts.init(document.getElementById("chart-container"));
        const option = {
            radar: {
                indicator: [
                    { name: "设备系统", max: 100 },
                    { name: "数据资源", max: 88 },
                    { name: "数字化生命周期", max: 85 },
                    { name: "生产执行数字化", max: 22 },
                    { name: "生产效率", max: 11 },
                    { name: "价值效益", max: 44 },
                    { name: "绿色低碳", max: 55 },
                    { name: "产品质量", max: 22 },
                    { name: "要素保障", max: 100 },
                    { name: "规划管理", max: 100 },
                    { name: "数字化决策", max: 100 },
                    { name: "信息安全", max: 100 },
                    { name: "数字化供应链", max: 100 },
                ],
            },
            series: [
                {
                    type: "radar",
                    data: [
                        {
                            value: [
                                100, 88, 85, 22, 11, 44, 55, 22, 100, 100, 100,
                                100, 100,
                            ], // 对应指标的值
                        },
                    ],
                },
            ],
        };
        chart.setOption(option); // 替换为上述任一 option
    },
    methods: {
        // 登录处理
        handleLogin() {
            this.$refs.loginForm.validate((valid) => {
                if (valid) {
                    // 登录逻辑处理
                    console.log("登录成功", this.loginForm);
                    // 实际项目中这里会调用登录API
                }
            });
        },
    },
};
</script>

<style lang="scss" scoped>
::v-deep .el-form-item__label {
    font-size: 12px;
    font-weight: 400;
    color: #ffffff;
}
.enterprise-info-form {
    width: 100%;
    height: 100%;
    background: #f5f7fd;
    padding: 16px 0;
    overflow-y: auto;
    /* 限制最大高度为视口高度减去header和footer */
    max-height: calc(100vh - 56px - 36px);

    .info {
        height: 22px;
        font-size: 16px;
        font-weight: 500;
        color: #001b4d;
        margin-bottom: 20px;
    }
    .zpjg_level_red {
        color: #ff5d5d;
    }
    .zpjg_level_org {
        color: #f98a34;
    }
    .zpjg_level_yellow {
        color: #ffba00;
    }
    .zpjg_level_green {
        color: #06a845;
    }
    .zpjg_level_bule {
        color: #2961ff;
    }

    .main {
        width: 100%;
        display: flex;
        align-items: center;
        flex-direction: column;

        .main_box {
            background: #fff;
            width: 100%;
            min-height: 100%;
            padding: 12px 20px;
            border-radius: 8px;

            .title {
                width: 234px;
                height: 25px;
                font-size: 18px;
                font-weight: 600;
                color: #001b4d;
                margin-bottom: 8px;
            }
            .time {
                width: 383px;
                height: 17px;
                font-size: 12px;
                font-weight: 400;
                color: #6d7b93;
                margin-bottom: 20px;
            }

            .info_1 {
                font-size: 14px;
                font-weight: 400;
                color: #283a5a;
                margin-bottom: 16px;
                display: flex;
                align-items: center;
                img {
                    margin-right: 8px;
                }
            }
            .zpjg {
                height: 271px;
                background: #f8faff;
                border-radius: 10px;
                margin-top: 14px;
                margin-bottom: 26px;

                .zpjg_title {
                    height: 22px;
                    font-size: 16px;
                    font-weight: 500;
                    color: #001b4d;
                    padding-left: 26px;
                    padding-top: 12px;
                    margin-bottom: 19px;
                }

                .zpjg_level {
                    height: 28px;
                    font-size: 20px;
                    font-weight: 500;
                    text-align: center;
                    color: #27a845;
                    margin-bottom: 5px;
                }
                .zpjg_score {
                    height: 17px;
                    font-size: 12px;
                    font-weight: 500;
                    text-align: center;
                    color: #283a5a;
                    margin-bottom: 20px;
                }
                .zpjg_level_text {
                    display: flex;
                    justify-content: center;
                    font-size: 12px;
                    font-weight: 400;

                    .text {
                        margin: 0 25px 6px 25px;
                    }
                }
                .zpjg_level_color {
                    display: flex;
                    justify-content: center;
                    margin-bottom: 20px;
                    .zpjg_level_red {
                        width: 106px;
                        height: 8px;
                        background: #ff5d5d;
                    }
                    .zpjg_level_org {
                        width: 106px;
                        height: 8px;
                        background: #f98a34;
                    }
                    .zpjg_level_yellow {
                        width: 106px;
                        height: 8px;
                        background: #ffba00;
                    }
                    .zpjg_level_green {
                        width: 106px;
                        height: 8px;
                        background: #06a845;
                    }
                    .zpjg_level_bule {
                        width: 106px;
                        height: 8px;
                        background: #2961ff;
                    }
                }
                .zpjg_ms {
                    height: 75px;
                    font-size: 14px;
                    font-weight: 400;
                    color: #31415d;
                    line-height: 24px;
                    margin: 0 60px;
                }
            }
            .zbfx {
                font-size: 14px;
                font-weight: 400;
                color: #5e74a7;
                height: 101px;
                background: #f8faff;
                border-radius: 10px;
                padding: 30px;
                margin-bottom: 25px;
            }
            .level_text {
                font-size: 14px;
                font-weight: 400;
                margin-bottom: 20px;
            }
        }
    }

    .main2 {
        height: 612px;
        background: #ffffff;
        border-radius: 8px;
        margin-top: 20px;
        padding: 20px;

        .title {
            margin-bottom: 16px;
            > :nth-child(1) {
                font-size: 16px;
                font-weight: 500;
                color: #001b4d;
            }
            > :nth-child(2) {
                font-size: 12px;
                font-weight: 400;
                color: #6d7b93;
                margin-left: 10px;
            }
        }
        .conten {
            height: 537px;
            background: #f8faff;
            border-radius: 10px;
            padding: 20px;

            .conten-item {
                height: 116px;
                background: #ffffff;
                border-radius: 10px;
                padding: 19px 16px;
                margin-bottom: 10px;

                .conten-item-title {
                    height: 20px;
                    font-size: 14px;
                    font-weight: 500;
                    color: #001b4d;
                    display: flex;

                    .btn {
                        width: 80px;
                        height: 24px;
                        background: #fef4f4;
                        border-radius: 12px;
                        margin-left: auto;
                        color: #f74e4f;
                        display: flex;
                        justify-content: center;
                        font-size: 12px;
                        align-items: center;
                    }
                    .btn2 {
                        width: 80px;
                        height: 24px;
                        background: #fff2dd;
                        border-radius: 12px;
                        margin-left: auto;
                        color: #c37e00;
                        display: flex;
                        justify-content: center;
                        font-size: 12px;
                        align-items: center;
                    }
                }

                .conten-item-text {
                    margin-top: 11px;
                    height: 51px;
                    font-size: 14px;
                    font-weight: 400;
                    color: #31415d;
                }
            }
        }
    }

    .main3 {
        height: 277px;
        background: #e8edff;
        border-radius: 8px;
        margin-top: 20px;
        padding: 20px;
        display: flex;
        justify-content: space-between;

        .left {
            width: 385px;
            .title {
                height: 25px;
                font-size: 18px;
                font-weight: 600;
                color: #001b4d;
                margin-top: 16px;
                margin-bottom: 16px;
            }
            .text {
                height: 61px;
                font-size: 12px;
                font-weight: 400;
                color: #6d7b93;
                line-height: 20px;
                margin-bottom: 18px;
            }
            ul {
                li {
                    display: flex;
                    align-items: center;
                    list-style: none;
                    height: 17px;
                    font-size: 12px;
                    font-weight: 400;
                    color: #283a5a;
                    margin-bottom: 18px;
                }
            }
        }
        .right {
            width: 255px;
            height: 228px;
            border-radius: 10px;
            padding: 16px 20px; /* 添加内边距 */
            box-sizing: border-box; /* 确保padding不影响整体尺寸 */
            background: #2961ff;

            .title {
                height: 20px;
                font-size: 14px;
                font-weight: 400;
                text-align: center;
                color: #fff;
                margin-bottom: 10px;
            }
        }

        /* 登录表单样式 */
        .login-form {
            width: 100%;
            .login-form-remember {
                display: flex;
                justify-content: space-between;
                margin-bottom: 12px;
            }
            .login-form-forgot {
                font-size: 12px;
            }
            .login-form-button {
                width: 100%;
            }
            .el-form-item {
                margin-bottom: 12px;
            }
        }
    }

    .btn {
        display: flex;
        flex-direction: column;
        align-items: center;

        .nth1 {
            margin-bottom: 10px;
            margin-left: 0px;
            width: 116px;
            height: 40px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            text-align: center;
            color: #001b4d;
        }

        .nth2 {
            margin-bottom: 10px;
            margin-left: 0px;
            width: 116px;
            height: 40px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            text-align: center;
            color: #fff;
            background: #2961ff;
        }

        .nth3 {
            margin-bottom: 10px;
            margin-left: 0px;
            width: 116px;
            height: 40px;
            font-size: 14px;
            font-weight: 500;
            text-align: center;
            color: #1c4aff;
            background: #ffffff;
            border: 1px solid #1c4aff;
            border-radius: 8px;
        }
    }
}
</style>
