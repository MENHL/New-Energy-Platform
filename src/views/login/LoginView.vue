<!--
  [登录页] views/login/LoginView.vue —— 登录页
  说明：双栏布局（左侧品牌介绍 + 右侧登录表单），GSAP 入场动画，
       表单校验 / 登录加载 / 记住登录状态 / 演示账号提示
-->
<template>
  <div class="login-page">
    <!-- 左侧：品牌介绍区 -->
    <section ref="brandRef" class="login-brand">
      <div class="brand-logo">
        <img class="logo-icon" src="@/assets/logo.svg" alt="GreenGrid" />
        <span class="logo-name">GreenGrid 新能源运营平台</span>
      </div>

      <h1 class="brand-title">让企业运营数据<br />一目了然</h1>
      <p class="brand-desc">
        覆盖项目、设备、物料与仓储全链路的一站式运营数据可视化平台，助力管理决策更高效。
      </p>

      <!-- 平台亮点列表 -->
      <ul class="brand-points">
        <li>
          <CheckCircleOutlined /> 项目 · 设备 · 物料 · 仓储 统一管理入口
        </li>
        <li>
          <CheckCircleOutlined /> 库存预警 · 设备异常 实时监控提醒
        </li>
        <li>
          <CheckCircleOutlined /> 趋势 · 排行 · 占比 多维可视化分析
        </li>
      </ul>

      <div class="brand-footer">2026 GreenGrid · 仅限企业内部授权用户使用</div>
    </section>

    <!-- 右侧：登录表单区 -->
    <section ref="formRef" class="login-panel">
      <div class="login-card gg-card">
        <h2 class="login-title">欢迎登录</h2>
        <p class="login-subtitle">新能源企业运营数据可视化平台</p>

        <!-- 登录表单：账号 + 密码 + 记住状态 -->
        <a-form ref="formElRef" :model="loginForm" :rules="loginRules" layout="vertical">
          <a-form-item label="账号" name="username">
            <a-input v-model:value="loginForm.username" size="large" placeholder="请输入企业账号 / 工号">
              <template #prefix>
                <UserOutlined style="color: #9ca3af" />
              </template>
            </a-input>
          </a-form-item>

          <a-form-item label="密码" name="password">
            <a-input-password v-model:value="loginForm.password" size="large" placeholder="请输入密码">
              <template #prefix>
                <LockOutlined style="color: #9ca3af" />
              </template>
            </a-input-password>
          </a-form-item>

          <div class="login-options">
            <a-checkbox v-model:checked="loginForm.remember">记住登录状态</a-checkbox>
            <a class="forget-link">忘记密码？</a>
          </div>

          <a-button type="primary" size="large" block :loading="submitLoading" @click="submitLogin">
            登 录
          </a-button>
        </a-form>

        <!-- 演示账号提示（Mock 数据） -->
        <a-alert class="demo-tip" type="info" show-icon message="演示账号：admin / ops / warehouse / guest，密码 123456" />

        <p class="login-agreement">登录即代表您已阅读并同意《平台使用协议》与《隐私政策》</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
/* [模块] 表单状态 + 校验规则 + 登录跳转 + GSAP 入场动画 */
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message, type FormInstance } from 'ant-design-vue'
import type { Rule } from 'ant-design-vue/es/form'
import gsap from 'gsap'
import {
  UserOutlined,
  LockOutlined,
  CheckCircleOutlined
} from '@ant-design/icons-vue'
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

/* ---------- 表单状态 ---------- */
const formElRef = ref<FormInstance>()
const submitLoading = ref(false)
const loginForm = reactive({
  username: '',
  password: '',
  remember: true
})

/* 校验规则：空值与格式提示（FR-LOGIN-02） */
const loginRules: Record<string, Rule[]> = {
  username: [{ required: true, message: '请输入企业账号 / 工号', trigger: 'blur' }],
  password: [
    { required: true, message: '密码不能为空，请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 位', trigger: 'blur' }
  ]
}

/* ---------- 登录提交 ---------- */
async function submitLogin() {
  /* 校验未通过：表单项内已展示错误提示，直接返回 */
  try {
    await formElRef.value?.validate()
  } catch {
    return
  }
  submitLoading.value = true
  try {
    await userStore.submitLogin({ ...loginForm })
    message.success('登录成功，欢迎回来')
    router.push(String(route.query.redirect || '/'))
  } finally {
    submitLoading.value = false
  }
}

/* ---------- GSAP 入场动画：左侧滑入 + 右侧上浮 ---------- */
const brandRef = ref<HTMLElement>()
const formRef = ref<HTMLElement>()

onMounted(() => {
  gsap.from(brandRef.value, { x: -60, opacity: 0, duration: 0.7, ease: 'power3.out' })
  gsap.from(formRef.value, { y: 40, opacity: 0, duration: 0.7, delay: 0.15, ease: 'power3.out' })
})
</script>

<style lang="scss" scoped>
/* 登录页：左右双栏铺满全屏 */
.login-page {
  display: -webkit-flex;
  display: flex;
  height: 100%;
  overflow: hidden;
}

/* ---------- 左侧品牌区：品牌绿渐变 ---------- */
.login-brand {
  -webkit-flex: 1;
  flex: 1;
  position: relative;
  padding: 60px 8%;
  color: #ffffff;
  background: -webkit-linear-gradient(135deg, #0f766e, #16a34a 60%, #4ade80);
  background: linear-gradient(135deg, #0f766e, #16a34a 60%, #4ade80);
  display: -webkit-flex;
  display: flex;
  -webkit-flex-direction: column;
  flex-direction: column;

  @media (max-width: 768px) {
    display: none;
  }

  .brand-logo {
    @include flex-between;
    -webkit-box-pack: start;
    -webkit-justify-content: flex-start;
    justify-content: flex-start;

    .logo-icon {
      width: 32px;
      height: 32px;
      display: block;
      flex-shrink: 0;
      border-radius: 8px;
    }

    .logo-name {
      margin-left: 10px;
      font-size: 16px;
      font-weight: 600;
    }
  }

  .brand-title {
    margin-top: 12vh;
    font-size: 40px;
    line-height: 1.35;
    font-weight: 700;
  }

  .brand-desc {
    margin-top: 20px;
    max-width: 460px;
    font-size: 15px;
    line-height: 1.8;
    opacity: 0.9;
  }

  .brand-points {
    margin-top: 32px;

    li {
      margin-bottom: 14px;
      font-size: 14px;

      .a-icon,
      .anticon {
        margin-right: 10px;
        color: #bbf7d0;
      }
    }
  }

  .brand-footer {
    margin-top: auto;
    font-size: 12px;
    opacity: 0.7;
  }
}

/* ---------- 右侧表单区 ---------- */
.login-panel {
  width: 480px;
  // flex: 1;
  flex-shrink: 0;
  @include flex-center;
  padding: 24px;
  background: $color-bg-page;

  /* 小屏（<768px）：左侧品牌区隐藏，表单区铺满并水平居中 */
  @media (max-width: 768px) {
    background: -webkit-linear-gradient(135deg, #0f766e, #16a34a 60%, #4ade80);
    background: linear-gradient(135deg, #0f766e, #16a34a 60%, #4ade80);
    width: 100%;
    -webkit-flex: 1;
    flex: 1;
  }
}

.login-card {
  width: 100%;
  max-width: 380px;
  padding: 32px 28px;

  /* 👇 新增：隐藏浏览器（如 Edge）自带的密码显示按钮，避免出现两个小眼睛 */
  :deep(input[type='password']) {
    &::-ms-reveal {
      display: none;
      /* 隐藏 Edge 的密码显示按钮 */
    }

    &::-webkit-credentials-auto-fill-button {
      display: none !important;
      /* 隐藏 Chrome/Webkit 的凭据自动填充按钮 */
    }
  }

  .login-title {
    font-size: 22px;
    font-weight: 700;
  }

  .login-subtitle {
    margin: 6px 0 24px;
    font-size: 13px;
    color: $color-text-secondary;
  }
}

/* 记住登录 + 忘记密码 */
.login-options {
  @include flex-between;
  margin-bottom: 20px;

  .forget-link {
    font-size: 13px;
  }
}

/* 演示账号提示 */
.demo-tip {
  margin-top: 20px;
}

.login-agreement {
  margin-top: 14px;
  font-size: 12px;
  color: $color-text-weak;
  text-align: center;
}
</style>
