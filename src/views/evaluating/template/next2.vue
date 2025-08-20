<template>
    <div class="evaluation-container">
        <!-- 主要内容区 -->
        <div class="evaluation-content">
            <!-- 左侧说明区域 -->
            <div class="question-section">
                <div class="question-header">
                    <span class="question-number">{{
						formattedQuestionNumber
					}}</span>
                    <span class="question-category">| {{ currentCategory }}</span>
                    <div class="question-type">数字化基础 | 设备系统</div>
                </div>

                <div class="question-content">
                    <div class="question-title">
                        {{ currentQuestionData.dimension || "网络建设" }} |
                        <!-- 动态维度 -->
                        <span>{{ currentQuestionTitle }}</span>
                    </div>

                    <!-- 动态渲染单选或多选组件 -->
                    <el-radio-group v-if="currentQuestionType === 'radio'" v-model="selectedAnswer" class="answer-options">
                        <el-radio v-for="option in currentOptions" :key="option.value" :label="option.value" class="option-item">
                            <span class="option-label">{{ option.label }}</span>
                            <span class="option-text">{{ option.text }}</span>
                        </el-radio>
                    </el-radio-group>

                    <el-checkbox-group v-else-if="currentQuestionType === 'checkbox'" v-model="selectedAnswers" class="answer-options">
                        <el-checkbox v-for="option in currentOptions" :key="option.value" :label="option.value" class="option-item">
                            <span class="option-label">{{ option.label }}</span>
                            <span class="option-text">{{ option.text }}</span>
                        </el-checkbox>
                    </el-checkbox-group>
                </div>

                <div class="navigation-buttons">
                    <el-button :disabled="currentQuestion === 1" @click="goToPreviousQuestion" class="nav-button prev-button" icon="el-icon-Back">
                        上一题
                    </el-button>
                    <el-button type="primary" @click="goToNextQuestion" :disabled="!selectedAnswer" size="large" class="nav-button next-button">
                        {{ isLastQuestion ? "完成评测" : "下一题" }}
                        <el-icon v-if="!isLastQuestion"><el-icon-right /></el-icon>
                    </el-button>
                </div>
            </div>

            <!-- 右侧题目区域 -->
            <div class="instructions-section">
                <!-- 顶部进度条 -->
                <div class="progress-header">
                    <div class="progress-info">
                        <span class="progress-title">评测进度</span>
                        <span class="progress-count">{{ currentQuestion }}/{{ totalQuestions }}题</span>
                    </div>
                    <el-progress :percentage="progressPercentage" :stroke-width="6" :show-text="false" class="progress-bar"></el-progress>

                    <div class="description-box">
                        <p>
                            本评测包含{{
								totalQuestions
							}}道题目，分为数字化基础、数字化管理、数字化成效、数字化经营四个维度。完成评测后，您将获得详细的转型能力分析报告和个性化改进建议。
                        </p>
                    </div>
                </div>

                <div class="guide-box">
                    <h4>操作指南</h4>
                    <ul>
                        <li>
                            <img src="/evaluating/book.png" width="16" height="16" />根据企业实际情况选择最符合的选项
                        </li>
                        <li>
                            <img src="/evaluating/book.png" width="16" height="16" />可随时使用"上一题"按钮修改之前的答案
                        </li>
                        <li>
                            <img src="/evaluating/book.png" width="16" height="16" />所有答案没有对错之分，仅用于评估企业数据现状
                        </li>
                        <li>
                            <img src="/evaluating/book.png" width="16" height="16" />完成所有题目后系统将自动生成评测报告
                        </li>
                    </ul>
                </div>

                <div class="support-box">
                    <h4>帮助与支持</h4>
                    <p>
                        如果您在评测过程中遇到任何问题，可以电话联系我们的专业顾问或现场咨询服务人员获取支持。
                    </p>
                    <el-button icon="el-icon-PhoneFilled">400-0000-0000</el-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "next2", // 组件名称
    data() {
        return {
            currentQuestion: 1, // 当前题目序号（从1开始）
            selectedAnswer: "", // 单选答案（存储当前题目的单选选项value）
            selectedAnswers: [], // 多选答案（存储当前题目的多选选项value数组）
            // 题目数据数组：包含所有题目信息，支持单选/多选题型
            questions: [
                {
                    id: 1, // 题目唯一标识
                    type: "radio", // 题型：radio-单选，checkbox-多选
                    category: "单选题", // 题目分类显示文本
                    dimension: "网络建设", // 题目所属维度（如：网络建设、数字化工具等）
                    title: "企业数据网络建设情况(    )", // 题目文本
                    options: [
                        // 选项列表：包含value（提交值）、label（选项标签A/B/C）、text（选项文本）
                        { value: "A", label: "A.", text: "无" },
                        {
                            value: "B",
                            label: "B.",
                            text: "具备工控网络，支持产线自动化生产",
                        },
                        {
                            value: "C",
                            label: "C.",
                            text: "具备应用型系统网络，实现大规模生产设备、人员与信息系统数据互联",
                        },
                        {
                            value: "D",
                            label: "D.",
                            text: "具备5G工业网络，实现多系统互联，满足AGV、ERP、MES等系统协同工作",
                        },
                        {
                            value: "E",
                            label: "E.",
                            text: "具备全面覆盖生产现场与各流程环节数据协同能力，进一步自我研究数字化应用技术能力",
                        },
                    ],
                },
                {
                    id: 2,
                    type: "checkbox", // 多选标识
                    category: "多选题",
                    dimension: "数字化工具", // 添加维度字段
                    title: "企业数字化工具使用情况(可多选)",
                    options: [
                        { value: "A", label: "A.", text: "无" },
                        {
                            value: "B",
                            label: "B.",
                            text: "具备工控网络，支持产线自动化生产",
                        },
                        {
                            value: "C",
                            label: "C.",
                            text: "具备应用型系统网络，实现大规模生产设备、人员与信息系统数据互联",
                        },
                        {
                            value: "D",
                            label: "D.",
                            text: "具备5G工业网络，实现多系统互联，满足AGV、ERP、MES等系统协同工作",
                        },
                        {
                            value: "E",
                            label: "E.",
                            text: "具备全面覆盖生产现场与各流程环节数据协同能力，进一步自我研究数字化应用技术能力",
                        },
                    ],
                },
                // 可以继续添加更多题目...
            ],
            answers: {},
        };
    },
    computed: {
        progressPercentage() {
            return Math.round(
                (this.currentQuestion / this.totalQuestions) * 100
            );
        },
        formattedQuestionNumber() {
            return this.currentQuestion.toString().padStart(2, "0");
        },
        // 获取当前题目数据
        currentQuestionData() {
            return this.questions[this.currentQuestion - 1] || {};
        },
        currentCategory() {
            return this.currentQuestionData.category;
        },
        currentQuestionTitle() {
            return this.currentQuestionData.title;
        },
        currentOptions() {
            return this.currentQuestionData.options || [];
        },
        currentQuestionType() {
            return this.currentQuestionData.type || "radio";
        },
        totalQuestions() {
            return this.questions.length;
        },
        isLastQuestion() {
            return this.currentQuestion === this.totalQuestions;
        },
    },
    methods: {
        // 统一题目切换处理
        navigateQuestion(direction) {
            this.saveCurrentAnswer();
            this.currentQuestion += direction;
            this.loadCurrentAnswer();
        },

        goToPreviousQuestion() {
            if (this.currentQuestion > 1) {
                this.navigateQuestion(-1);
            }
        },

        goToNextQuestion() {
            if (!this.isAnswerValid()) return; // 验证答案是否填写（单选非空/多选至少一项）

            if (this.isLastQuestion) {
                this.submitEvaluation();
            } else {
                this.navigateQuestion(1);
            }
        },

        // 答案验证：根据题型判断答案是否有效
        isAnswerValid() {
            if (this.currentQuestionType === "radio") {
                return !!this.selectedAnswer; // 单选：答案非空
            } else {
                return this.selectedAnswers.length > 0; // 多选：至少选择一项
            }
        },

        // 保存当前题答案到answers对象
        saveCurrentAnswer() {
            const questionId = this.currentQuestionData.id; // 获取当前题目id
            if (this.currentQuestionType === "radio") {
                this.answers[questionId] = this.selectedAnswer; // 单选：直接存储value
            } else {
                this.answers[questionId] = [...this.selectedAnswers]; // 多选：存储数组副本（避免引用问题）
            }
        },

        // 加载目标题答案：从answers中读取并赋值给当前选中状态
        loadCurrentAnswer() {
            const questionId = this.currentQuestionData.id;
            const savedAnswer = this.answers[questionId]; // 获取已保存的答案

            if (this.currentQuestionType === "radio") {
                this.selectedAnswer = savedAnswer || ""; // 单选：无答案时为空字符串
            } else {
                this.selectedAnswers = savedAnswer ? [...savedAnswer] : []; // 多选：无答案时为空数组
            }
        },

        // 提交评测：收集所有答案并处理（实际项目中替换为API调用）
        submitEvaluation() {
            // console.log("提交评测答案:", this.answers); // 打印答案（调试用）
            // alert("评测完成！即将生成报告..."); // 用户提示
            // this.$router.push('/report');  // 实际项目中跳转到报告页
            this.$emit("nextStep", 3);
        },
    },
};
</script>

<style lang="scss" scoped>


.evaluation-container {
    width: 100%;
    height: 100%;
    margin: 0 auto;
    padding: 20px;
    background-color: #f5f7fa;
    display: flex;
    justify-content: center; // 水平居中
    align-items: center; // 垂直居中

    .evaluation-content {
        display: flex;
        gap: 20px;
        transition: transform 0.3s ease;

        .instructions-section {
            flex: 1;
            min-width: 300px;

            .progress-header {
                height: 140px;
                margin-bottom: 10px;
                background-color: #fff;
                padding: 15px 20px;
                border-radius: 8px;
                box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);

                .progress-info {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 10px;
                    font-size: 16px;

                    .progress-title {
                        font-size: 12px;
                        font-weight: 600;
                        color: #001b4d;
                    }

                    .progress-count {
                        font-size: 14px;
                        font-weight: 600;
                        color: #2961ff;
                    }
                }

                .progress-bar {
                    margin-top: 10px;
                    margin-bottom: 10px;
                }
                .description-box {
                    font-size: 12px;
                    font-weight: 400;
                    color: #283a5a;
                    line-height: 24px;
                }
            }

            .guide-box,
            .support-box {
                background-color: #fff;
                padding: 16px;
                border-radius: 8px;
                box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
            }

            .guide-box {
                height: 168px;
                margin: 10px 0;
                h4 {
                    margin-top: 0;
                    margin-bottom: 15px;
                    font-size: 12px;
                    font-weight: 600;
                    color: #001b4d;
                }

                ul {
                    margin: 0;

                    li {
                        margin-bottom: 8px;
                        font-size: 12px;
                        font-weight: 400;
                        color: #283a5a;
                        list-style-type: none;
                        display: flex;
                        align-items: center;
                        img {
                            margin-right: 10px;
                        }
                    }
                }
            }

            .support-box {
                height: 160px;
                h4 {
                    margin-top: 0;
                    margin-bottom: 15px;
                    color: #303133;
                    font-size: 16px;
                }

                p {
                    color: #606266;
                    margin: 0;
                }

                button {
                    margin-top: 12px;
                    width: 294px;
                    height: 40px;
                    background: #ffffff;
                    border: 1px solid #2961ff;
                    border-radius: 10px;
                    color: #2961ff;
                }
            }
        }

        .question-section {
            flex: 2;
            background-color: #fff;
            padding: 25px;
            border-radius: 8px;
            box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);

            .question-header {
                display: flex;
                align-items: center;
                margin-bottom: 23px;

                .question-number {
                    margin-right: 10px;
                    font-size: 16px;
                    font-weight: 600;
                    color: #2961ff;
                }

                .question-category {
                    font-size: 12px;
                    font-weight: 400;
                    color: #6d7b93;
                }

                .question-type {
                    width: 152px;
                    height: 24px;
                    background: #e6edff;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: 400;
                    color: #2961ff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-left: auto;
                }
            }

            .question-content {
                .question-title {
                    margin: 0 0 20px 0;
                    font-size: 16px;
                    font-weight: 600;
                    color: #001b4d;
                    span {
                        font-weight: normal;
                    }
                }

                .answer-options {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;

                    .option-item {
                        display: flex;
                        align-items: center;
                        margin: 0;
                        padding: 10px;
                        border-radius: 4px;
                        transition: all 0.3s;
                        border: 1px solid #d0daef;

                        &:hover {
                            background-color: #e6edff;
                            border: 1px solid #2961ff;
                            padding: 9px;
                            color: #001b4d;
                        }

                        &.is-checked {
                            background-color: #e6edff;
                            border: 1px solid #2961ff;
                            padding: 9px;
                        }

                        .option-label {
                            font-weight: bold;
                            margin-right: 8px;
                            min-width: 25px;
                        }

                        .option-text {
                            flex: 1;
                        }
                    }
                }
            }

            .navigation-buttons {
                display: flex;
                justify-content: space-between;
                margin-top: 33px;

                .nav-button {
                    width: 120px;
                    height: 40px;
                }

                .next-button {
                    margin-left: auto;
                }
            }
        }
    }

    :deep(.el-radio-group) {
        align-items: stretch;
    }
}

/* 1K屏适配 (1920x1080) */
@media (min-width: 1920px) and (max-width: 2559px) {
    .evaluation-content {
        transform: scale(1.15);
    }
}

/* 2K屏适配 (2560x1440及以上) */
@media (min-width: 2560px) {
    .evaluation-content {
        transform: scale(1.5);
    }
}
</style>
