<template>
  <div class="login-page">
    <div class="login-card">
      <div class="title">智慧餐饮商家端</div>
      <div class="subtitle">登录后管理订单、菜品与桌台</div>

      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @keyup.enter="submit">
        <el-form-item label="账号" prop="username">
          <el-input v-model="form.username" placeholder="请输入账号" clearable />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" placeholder="请输入密码" type="password" show-password />
        </el-form-item>
        <el-button type="primary" class="login-button" :loading="loading" @click="submit">登录</el-button>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { loginApi } from '@/api/auth'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

async function submit() {
  await formRef.value.validate()
  loading.value = true
  try {
    const data = await loginApi(form)
    auth.setAuth(data)
    ElMessage.success('登录成功')
    router.replace(route.query.redirect || '/dashboard')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ecfdf5, #eff6ff);
}

.login-card {
  width: 420px;
  padding: 34px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 18px 50px rgba(15, 23, 42, 0.12);
}

.title {
  font-size: 26px;
  font-weight: 800;
}

.subtitle {
  margin: 8px 0 28px;
  color: #64748b;
}

.login-button {
  width: 100%;
  margin-top: 8px;
}
</style>
