<template>
  <div class="sidebar-content">
    <!-- Logo 区域 -->
    <div class="logo" @click="emit('close-drawer')">
      TaskBoard
    </div>
    
    <!-- 导航菜单 -->
    <el-menu
      :default-active="activeMenu"
      background-color="#304156"
      text-color="#fff"
      active-text-color="#409eff"
      router
    >
      <el-menu-item index="/dashboard" @click="emit('close-drawer')">
        <el-icon><Odometer /></el-icon>
        <span>仪表盘</span>
      </el-menu-item>
      <el-menu-item index="/tasks" @click="emit('close-drawer')">
        <el-icon><List /></el-icon>
        <span>任务管理</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script setup>
import { Odometer, List } from '@element-plus/icons-vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const emit = defineEmits(['close-drawer'])

// 当前激活的菜单
const activeMenu = route.path
</script>

<style scoped>
.sidebar-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  color: white;
  cursor: pointer;
  background-color: #1f2d3d;
  border-bottom: 1px solid #1f2d3d;
}

.el-menu {
  border-right: none;
  flex: 1;
}
</style>