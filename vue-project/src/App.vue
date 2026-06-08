<template>
  <el-container class="layout-container">
    <!-- 左侧边栏 -->
    <el-aside width="200px" style="background-color: #304156; color: white;">
      <div class="logo">TaskBoard</div>
      <el-menu
        :default-active="activeMenu"
        background-color="#304156"
        text-color="#fff"
        active-text-color="#409eff"
        router
      >
        <el-menu-item index="/dashboard">
          <el-icon><Odometer /></el-icon>
          <span>仪表盘</span>
        </el-menu-item>
        <el-menu-item index="/tasks">
          <el-icon><List /></el-icon>
          <span>任务管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 右侧主区域 -->
    <el-container>
      <!-- 顶部栏 -->
      <el-header style="border-bottom: 1px solid #e6e6e6; display: flex; align-items: center; justify-content: space-between;">
        <div>你好，管理员！</div>
        <el-button type="text" @click="logout">退出登录</el-button>
      </el-header>
      <!-- 内容区 -->
      <el-main>
        <!-- 这里会根据路由显示不同的页面 -->
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { Odometer, List } from '@element-plus/icons-vue'
import { useRoute, useRouter } from 'vue-router'
import { ref, watch } from 'vue'

const route = useRoute()
const router = useRouter()
const activeMenu = ref('/dashboard')

// 监听路由变化，更新高亮的菜单
watch(() => route.path, (newPath) => {
  activeMenu.value = newPath
})

// 退出登录（最简版）
function logout() {
  localStorage.removeItem('token')
  router.push('/login')
}
</script>

<style scoped>
.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
}
.layout-container {
  height: 100vh;
}
</style>