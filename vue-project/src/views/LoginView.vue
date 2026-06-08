<template>
  <div class="login-container">
    <el-card class="login-box">
      <h2 style="text-align: center; margin-bottom: 30px;">TaskBoard 登录</h2>
      <el-form :model="form" :rules="rules" ref="formRef">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" style="width: 100%;" @click="handleLogin">登录</el-button>
        </el-form-item>
      </el-form>
      <p style="text-align: center; color: #999; font-size: 12px;">（演示账号任意输入即可）</p >
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const formRef = ref()
const form = ref({
  username: '',
  password: ''
})

// 表单校验规则（记住这个模式，以后一直用）
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

function handleLogin() {
  formRef.value.validate((valid) => {
    if (valid) {
      // 登录成功，存个假token，并跳转到仪表盘
      localStorage.setItem('token', 'demo-token')
      ElMessage.success('登录成功')
      router.push('/dashboard')
    }
  })
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.login-box {
  width: 350px;
}
</style>