<template>
    <!-- 主题内容 -->
    <div class="enterprise-info-form">
        <el-form :model="form" :rules="rules" ref="enterpriseForm" label-position="top" label-width="80px">
            <div class="form-title">企业基本信息录入</div>
            <el-row :gutter="20">
                <el-col :span="12">
                    <el-form-item label="企业名称" prop="enterpriseName">
                        <el-input v-model="form.enterpriseName" placeholder="请输入企业名称" clearable></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="企业规模" prop="enterpriseScale">
                        <el-select v-model="form.enterpriseScale" placeholder="请选择企业规模" style="width: 100%">
                            <el-option label="微型企业" value="micro"></el-option>
                            <el-option label="小型企业" value="small"></el-option>
                            <el-option label="中型企业" value="medium"></el-option>
                            <el-option label="大型企业" value="large"></el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="企业地址" prop="enterpriseAddress">
                        <el-input v-model="form.enterpriseAddress" placeholder="请输入企业详细地址" clearable></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="联系人姓名" prop="contactName">
                        <el-input v-model="form.contactName" placeholder="请输入联系人姓名" clearable></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="所属行业" prop="industry">
                        <el-select v-model="form.industry" placeholder="请选择所属行业" style="width: 100%">
                            <el-option label="制造业" value="manufacturing"></el-option>
                            <el-option label="服务业" value="service"></el-option>
                            <el-option label="零售业" value="retail"></el-option>
                            <el-option label="IT/互联网" value="it"></el-option>
                            <el-option label="金融业" value="finance"></el-option>
                            <el-option label="教育业" value="education"></el-option>
                            <el-option label="医疗健康" value="healthcare"></el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="成立年限" prop="establishmentYears">
                        <el-select v-model="form.establishmentYears" placeholder="请选择成立年限" style="width: 100%">
                            <el-option label="1年以下" value="0-1"></el-option>
                            <el-option label="1-3年" value="1-3"></el-option>
                            <el-option label="3-5年" value="3-5"></el-option>
                            <el-option label="5-10年" value="5-10"></el-option>
                            <el-option label="10年以上" value="10+"></el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="电子邮箱" prop="email">
                        <el-input v-model="form.email" placeholder="请输入公司电子邮箱" clearable></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="联系人电话" prop="contactPhone">
                        <el-input v-model="form.contactPhone" placeholder="请输入联系人电话" clearable></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="24" style="text-align: center;">
                    <el-button type="primary" @click="submitForm('enterpriseForm')" class="next-step-btn">
                        下一步：开始评测<el-icon style="margin-left: 20px"><el-icon-right /></el-icon>
                    </el-button>
                </el-col>
            </el-row>
        </el-form>
    </div>
</template>

<script>
export default {
    name: "next1",
    data() {
        // 邮箱验证规则
        const validateEmail = (rule, value, callback) => {
            if (value === "") {
                callback(new Error("请输入电子邮箱"));
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                callback(new Error("请输入正确的邮箱格式"));
            } else {
                callback();
            }
        };

        // 手机号验证规则
        const validatePhone = (rule, value, callback) => {
            if (value === "") {
                callback(new Error("请输入联系人电话"));
            } else if (!/^1[3-9]\d{9}$/.test(value)) {
                callback(new Error("请输入正确的手机号码"));
            } else {
                callback();
            }
        };

        return {
            form: {
                enterpriseName: "",
                enterpriseScale: "",
                enterpriseAddress: "",
                contactName: "",
                industry: "",
                establishmentYears: "",
                email: "",
                contactPhone: "",
            },
            rules: {
                enterpriseName: [
                    {
                        required: true,
                        message: "请输入企业名称",
                        trigger: "blur",
                    },
                    {
                        min: 2,
                        max: 50,
                        message: "长度在 2 到 50 个字符",
                        trigger: "blur",
                    },
                ],
                enterpriseScale: [
                    {
                        required: true,
                        message: "请选择企业规模",
                        trigger: "change",
                    },
                ],
                enterpriseAddress: [
                    {
                        required: true,
                        message: "请输入企业地址",
                        trigger: "blur",
                    },
                ],
                contactName: [
                    {
                        required: true,
                        message: "请输入联系人姓名",
                        trigger: "blur",
                    },
                ],
                industry: [
                    {
                        required: true,
                        message: "请选择所属行业",
                        trigger: "change",
                    },
                ],
                establishmentYears: [
                    {
                        required: true,
                        message: "请选择成立年限",
                        trigger: "change",
                    },
                ],
                email: [
                    {
                        required: true,
                        validator: validateEmail,
                        trigger: "blur",
                    },
                ],
                contactPhone: [
                    {
                        required: true,
                        validator: validatePhone,
                        trigger: "blur",
                    },
                ],
            },
        };
    },
    methods: {
        submitForm(formName) {
            //   this.$refs[formName].validate((valid) => {
            //     if (valid) {
            //       // 表单验证通过，执行下一步操作
            //       alert("表单验证通过，即将跳转到评测页面");
            //       // this.$router.push('/evaluation');
            //     } else {
            //       console.log("表单验证失败");
            //       return false;
            //     }
            //   });
            //  执行下一步
            this.$emit("nextStep", 2);
        },
    },
};
</script>

<style lang="scss" scoped>
.enterprise-info-form {
    width: 100%;
    padding: 30px;
}

.form-title {
    font-size: 18px;
    font-weight: 600;
    text-align: left;
    color: #001b4d;
    margin-bottom: 16px;
}

.next-step-btn {
    width: 280px;
    height: 48px;
    font-size: 16px;
    margin-top: 20px;
    padding: 0 30px;
    background: #2961ff;
    border-radius: 8px;
}
</style>
