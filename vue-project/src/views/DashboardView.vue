<template>
  <div class="dashboard-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>数据仪表盘</h1>
      <p class="subtitle">实时任务数据概览与统计分析</p >
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-card shadow="hover" class="stats-card">
        <div class="card-content">
          <div class="card-icon" style="background-color: #e8f4ff;">
            <el-icon><List /></el-icon>
          </div>
          <div class="card-info">
            <div class="card-value">{{ stats.total }}</div>
            <div class="card-label">总任务数</div>
          </div>
        </div>
      </el-card>

      <el-card shadow="hover" class="stats-card">
        <div class="card-content">
          <div class="card-icon" style="background-color: #fff7e6;">
            <el-icon><Clock /></el-icon>
          </div>
          <div class="card-info">
            <div class="card-value">{{ stats.processing }}</div>
            <div class="card-label">进行中</div>
          </div>
        </div>
      </el-card>

      <el-card shadow="hover" class="stats-card">
        <div class="card-content">
          <div class="card-icon" style="background-color: #f6ffed;">
            <el-icon><Check /></el-icon>
          </div>
          <div class="card-info">
            <div class="card-value">{{ stats.completed }}</div>
            <div class="card-label">已完成</div>
          </div>
        </div>
      </el-card>

      <el-card shadow="hover" class="stats-card">
        <div class="card-content">
          <div class="card-icon" style="background-color: #fff2f0;">
            <el-icon><Warning /></el-icon>
          </div>
          <div class="card-info">
            <div class="card-value">{{ stats.overdue }}</div>
            <div class="card-label">已逾期</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 图表区域 -->
    <div class="charts-row">
      <!-- 状态分布饼图 -->
      <el-card shadow="never" class="chart-card">
        <template #header>
          <div class="chart-header">
            <span>任务状态分布</span>
            <el-tag type="info">实时</el-tag>
          </div>
        </template>
        <div ref="statusChartRef" class="chart-container"></div>
      </el-card>

      <!-- 优先级分布柱状图 -->
      <el-card shadow="never" class="chart-card">
        <template #header>
          <div class="chart-header">
            <span>任务优先级分布</span>
            <el-tag type="info">实时</el-tag>
          </div>
        </template>
        <div ref="priorityChartRef" class="chart-container"></div>
      </el-card>
    </div>

    <!-- 近期任务列表 -->
    <el-card shadow="never" class="recent-tasks">
      <template #header>
        <div class="chart-header">
          <span>近期任务</span>
          <el-button type="primary" text @click="gotoTasks">查看全部</el-button>
        </div>
      </template>
      <el-table :data="recentTasks" style="width: 100%" height="250">
        <el-table-column prop="title" label="任务标题" width="300" />
        <el-table-column prop="assignee" label="负责人" width="100" />
        <el-table-column prop="priority" label="优先级" width="100">
          <template #default="{ row }">
            <el-tag :type="getPriorityType(row.priority)" size="small">{{ row.priority }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="dueDate" label="截止日期" width="120" />
        <el-table-column label="操作" width="80" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" text @click="handleViewTask(row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { List, Clock, Check, Warning } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()

// 模拟任务数据（实际项目中应该从API获取）
const tasks = ref([
  { id: 1, title: '完善登录页面UI', description: '优化登录表单的视觉效果和响应式', assignee: '张三', priority: 'medium', status: 'done', dueDate: '2024-05-20' },
  { id: 2, title: '开发任务列表页面', description: '实现任务的增删改查和筛选功能', assignee: '李四', priority: 'high', status: 'processing', dueDate: '2024-05-25' },
  { id: 3, title: '设计数据统计图表', description: '使用ECharts设计仪表盘的数据可视化图表', assignee: '王五', priority: 'medium', status: 'pending', dueDate: '2024-05-30' },
  { id: 4, title: '编写项目使用文档', description: '为项目编写详细的使用和部署说明文档', assignee: '赵六', priority: 'low', status: 'pending', dueDate: '2024-06-05' },
  { id: 5, title: '后端API接口联调', description: '与后端开发人员协作完成接口对接和测试', assignee: '张三', priority: 'high', status: 'processing', dueDate: '2024-05-28' },
  { id: 6, title: '用户反馈收集模块', description: '设计并实现用户反馈表单和展示页面', assignee: '李四', priority: 'medium', status: 'pending', dueDate: '2024-06-10' },
  { id: 7, title: '性能优化与测试', description: '对系统进行性能测试并优化关键路径', assignee: '王五', priority: 'high', status: 'processing', dueDate: '2024-05-27' }
])

// 统计卡片数据
const stats = computed(() => {
  const total = tasks.value.length
  const processing = tasks.value.filter(t => t.status === 'processing').length
  const completed = tasks.value.filter(t => t.status === 'done').length
  
  // 简单模拟逾期任务：截止日期在今天之前的未完成任务
  const today = new Date().toISOString().split('T')[0]
  const overdue = tasks.value.filter(t => 
    t.status !== 'done' && t.dueDate < today
  ).length

  return { total, processing, completed, overdue }
})

// 近期任务（取最新5条）
const recentTasks = computed(() => {
  return [...tasks.value]
    .sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate))
    .slice(0, 5)
})

// 图表相关
const statusChartRef = ref(null)
const priorityChartRef = ref(null)
let statusChart = null
let priorityChart = null

// 状态和优先级标签样式（与TaskView.vue保持一致）
const getStatusType = (status) => {
  const map = { pending: 'info', processing: 'warning', done: 'success' }
  return map[status] || ''
}

const getStatusText = (status) => {
  const map = { pending: '未开始', processing: '进行中', done: '已完成' }
  return map[status] || status
}

const getPriorityType = (priority) => {
  const map = { high: 'danger', medium: 'warning', low: '' }
  return map[priority] || ''
}

// 初始化状态分布饼图
const initStatusChart = () => {
  if (!statusChartRef.value) return
  
  statusChart = echarts.init(statusChartRef.value)
  
  // 计算状态分布
  const statusCount = {
    '未开始': tasks.value.filter(t => t.status === 'pending').length,
    '进行中': tasks.value.filter(t => t.status === 'processing').length,
    '已完成': tasks.value.filter(t => t.status === 'done').length
  }
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      data: ['未开始', '进行中', '已完成']
    },
    series: [
      {
        name: '任务状态',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 18,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: statusCount['未开始'], name: '未开始', itemStyle: { color: '#409eff' } },
          { value: statusCount['进行中'], name: '进行中', itemStyle: { color: '#e6a23c' } },
          { value: statusCount['已完成'], name: '已完成', itemStyle: { color: '#67c23a' } }
        ]
      }
    ]
  }
  
  statusChart.setOption(option)
}

// 初始化优先级分布柱状图
const initPriorityChart = () => {
  if (!priorityChartRef.value) return
  
  priorityChart = echarts.init(priorityChartRef.value)
  
  // 计算优先级分布
  const priorityCount = {
    '高': tasks.value.filter(t => t.priority === 'high').length,
    '中': tasks.value.filter(t => t.priority === 'medium').length,
    '低': tasks.value.filter(t => t.priority === 'low').length
  }
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['高', '中', '低'],
      axisLine: {
        lineStyle: {
          color: '#ccc'
        }
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: '#ccc'
        }
      },
      splitLine: {
        lineStyle: {
          type: 'dashed',
          color: '#eee'
        }
      }
    },
    series: [
      {
        name: '任务数量',
        type: 'bar',
        barWidth: '60%',
        data: [
          { value: priorityCount['高'], itemStyle: { color: '#f56c6c' } },
          { value: priorityCount['中'], itemStyle: { color: '#e6a23c' } },
          { value: priorityCount['低'], itemStyle: { color: '#409eff' } }
        ],
        label: {
          show: true,
          position: 'top',
          formatter: '{c}'
        }
      }
    ]
  }
  
  priorityChart.setOption(option)
}

// 处理窗口大小变化，重绘图表
const handleResize = () => {
  if (statusChart) statusChart.resize()
  if (priorityChart) priorityChart.resize()
}

// 导航到任务管理页面
const gotoTasks = () => {
  router.push('/tasks')
}

// 查看任务详情
const handleViewTask = (task) => {
  ElMessage.info(`查看任务: ${task.title}`)
  // 实际项目中这里可以跳转到任务详情页
  router.push(`/tasks?taskId=${task.id}`)
}

// 组件挂载时初始化图表
onMounted(() => {
  initStatusChart()
  initPriorityChart()
  window.addEventListener('resize', handleResize)
})

// 组件卸载前清理
onBeforeUnmount(() => {
  if (statusChart) {
    statusChart.dispose()
    statusChart = null
  }
  if (priorityChart) {
    priorityChart.dispose()
    priorityChart = null
  }
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 120px);
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.page-header .subtitle {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

/* 基础样式 - 不要修改这个 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

/* 响应式调整 - 在这后面添加 */
/* 在手机上变成2列 */
@media (max-width: 640px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 在超小屏幕上变成1列 */
@media (max-width: 480px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }
}

.stats-card {
  border-radius: 8px;
  border: none;
}

.card-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-icon .el-icon {
  font-size: 24px;
  color: #409eff;
}

.card-info {
  flex: 1;
}

.card-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  line-height: 1.2;
}

.card-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.charts-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.chart-card {
  border-radius: 8px;
  border: 1px solid #ebeef5;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.chart-container {
  width: 100%;
  height: 300px;
}

.recent-tasks {
  border-radius: 8px;
  border: 1px solid #ebeef5;
}

@media (max-width: 768px) {
  .charts-row {
    grid-template-columns: 1fr;
  }
}
</style>