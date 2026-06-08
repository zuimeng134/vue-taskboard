<template>
  <!-- 新增：移动端顶部栏，用于显示汉堡菜单和标题 -->
  <div class="mobile-header" v-if="isMobile">
    <el-button text @click="drawerVisible = true" :icon="Menu" />
    <span class="mobile-title">TaskBoard</span>
  </div>

  <!-- 主容器 -->
  <el-container class="layout-container">
    <!-- 左侧边栏抽屉（移动端） -->
    <el-drawer
      v-model="drawerVisible"
      direction="ltr"
      :with-header="false"
      size="200px"
      v-if="isMobile"
    >
      <!-- 抽屉内部复用PC侧边栏的内容 -->
      <div class="drawer-content">
        <SidebarContent @close-drawer="drawerVisible = false" />
      </div>
    </el-drawer>

    <!-- 左侧边栏（PC端） -->
    <el-aside v-if="!isMobile" width="200px" class="pc-sidebar">
      <SidebarContent />
    </el-aside>

    <!-- 右侧主区域 -->
    <el-container>
      <!-- 顶部栏（PC端显示完整，移动端简化） -->
      <el-header class="main-header">
        <div v-if="!isMobile" class="header-left">
          <!-- PC端这里可以放其他内容，目前留空保持简洁 -->
        </div>
        <div class="header-center">
          <!-- 动态标题：在PC端显示当前页面标题会更专业 -->
          <span v-if="!isMobile && currentTitle">{{ currentTitle }}</span>
        </div>
        <div class="header-right">
          <span v-if="!isMobile" style="margin-right: 10px;">你好，管理员！</span>
          <el-button type="text" @click="logout" :icon="SwitchButton">退出</el-button>
        </div>
      </el-header>

      <!-- 内容区 -->
      <el-main class="site-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Menu, SwitchButton, List, Odometer } from '@element-plus/icons-vue'

// 引入抽离的侧边栏组件
import SidebarContent from './components/SidebarContent.vue'

const route = useRoute()
const router = useRouter()

// 控制移动端抽屉显示
const drawerVisible = ref(false)

// 响应式判断：是否是移动端
const isMobile = ref(window.innerWidth <= 768)

// 根据当前路由计算页面标题
const currentTitle = computed(() => {
  const map = {
    '/dashboard': '数据仪表盘',
    '/tasks': '任务管理',
  }
  return map[route.path] || 'TaskBoard'
})

// 监听窗口大小变化
const handleResize = () => {
  isMobile.value = window.innerWidth <= 768
  // 如果是PC端，确保抽屉是关闭的
  if (!isMobile.value) {
    drawerVisible.value = false
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// 退出登录
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
/* 移动端顶部栏 */
.mobile-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  height: 50px;
  background: #304156;
  color: white;
  display: flex;
  align-items: center;
  padding: 0 12px;
  border-bottom: 1px solid #1f2d3d;
}
.mobile-title {
  margin-left: 12px;
  font-weight: bold;
  font-size: 16px;
}

/* 主布局容器 */
.layout-container {
  height: 100vh;
}
.pc-sidebar {
  background-color: #304156;
  color: white;
  transition: width 0.3s;
}

/* 顶部栏 */
.main-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e6e6e6;
  background: white;
  padding: 0 20px;
  height: 60px;
}
.header-left, .header-center, .header-right {
  display: flex;
  align-items: center;
}
.header-center {
  flex: 1;
  justify-content: center;
  font-weight: 500;
}

/* 内容区 */
.site-main {
  padding: 20px;
  background-color: #f5f7fa;
  overflow-x: auto; /* 防止内容溢出 */
}

/* 抽屉内容 */
.drawer-content {
  height: 100%;
  background: #304156;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .main-header {
    padding: 0 15px;
    height: 50px;
  }
  .header-center, .header-left {
    display: none; /* 在移动端隐藏这些部分 */
  }
  .site-main {
    padding: 15px;
  }
  .layout-container {
    height: calc(100vh - 50px); /* 减去移动端顶部栏高度 */
  }
}
</style>