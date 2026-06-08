<template>
  <div class="task-view">
    <!-- 标题和操作栏 -->
    <div class="header">
      <h1>任务管理</h1>
      <div class="actions">
        <el-button type="primary" @click="handleAdd" :icon="Plus">新增任务</el-button>
        <el-input
          v-model="searchKeyword"
          placeholder="搜索任务标题..."
          clearable
          style="width: 200px; margin-left: 10px;"
          @input="handleSearch"
        />
        <el-select
          v-model="filterStatus"
          placeholder="状态筛选"
          clearable
          style="width: 120px; margin-left: 10px;"
          @change="handleFilter"
        >
          <el-option label="未开始" value="pending" />
          <el-option label="进行中" value="processing" />
          <el-option label="已完成" value="done" />
        </el-select>
      </div>
    </div>

    <!-- 任务表格 -->
    <el-table :data="filteredTasks" border stripe style="width: 100%; margin-top: 20px;">
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="title" label="任务标题" min-width="180" />
      <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
      <el-table-column prop="assignee" label="负责人" width="100" />
      <el-table-column prop="priority" label="优先级" width="90">
        <template #default="{ row }">
          <el-tag :type="getPriorityType(row.priority)">{{ row.priority }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="dueDate" label="截止日期" width="120" />
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑任务弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增任务' : '编辑任务'"
      width="500px"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="任务标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入任务标题" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入任务描述"
          />
        </el-form-item>
        <el-form-item label="负责人" prop="assignee">
          <el-input v-model="form.assignee" placeholder="请输入负责人" />
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-select v-model="form.priority" placeholder="请选择优先级">
            <el-option label="高" value="high" />
            <el-option label="中" value="medium" />
            <el-option label="低" value="low" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态">
            <el-option label="未开始" value="pending" />
            <el-option label="进行中" value="processing" />
            <el-option label="已完成" value="done" />
          </el-select>
        </el-form-item>
        <el-form-item label="截止日期" prop="dueDate">
          <el-date-picker
            v-model="form.dueDate"
            type="date"
            placeholder="请选择截止日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%;"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 任务列表数据
const tasks = ref([
  { id: 1, title: '完善登录页面UI', description: '优化登录表单的视觉效果和响应式', assignee: '张三', priority: 'medium', status: 'done', dueDate: '2024-05-20' },
  { id: 2, title: '开发任务列表页面', description: '实现任务的增删改查和筛选功能', assignee: '李四', priority: 'high', status: 'processing', dueDate: '2024-05-25' },
  { id: 3, title: '设计数据统计图表', description: '使用ECharts设计仪表盘的数据可视化图表', assignee: '王五', priority: 'medium', status: 'pending', dueDate: '2024-05-30' },
  { id: 4, title: '编写项目使用文档', description: '为项目编写详细的使用和部署说明文档', assignee: '赵六', priority: 'low', status: 'pending', dueDate: '2024-06-05' },
  { id: 5, title: '后端API接口联调', description: '与后端开发人员协作完成接口对接和测试', assignee: '张三', priority: 'high', status: 'processing', dueDate: '2024-05-28' }
])

// 搜索和筛选
const searchKeyword = ref('')
const filterStatus = ref('')
const filteredTasks = computed(() => {
  return tasks.value.filter(task => {
    const matchKeyword = task.title.includes(searchKeyword.value) || 
                         task.description.includes(searchKeyword.value)
    const matchStatus = !filterStatus.value || task.status === filterStatus.value
    return matchKeyword && matchStatus
  })
})

// 弹窗和表单
const dialogVisible = ref(false)
const dialogType = ref('add') // 'add' 或 'edit'
const form = ref({
  id: null,
  title: '',
  description: '',
  assignee: '',
  priority: 'medium',
  status: 'pending',
  dueDate: ''
})
const formRef = ref()

// 表单验证规则
const rules = {
  title: [{ required: true, message: '请输入任务标题', trigger: 'blur' }],
  assignee: [{ required: true, message: '请输入负责人', trigger: 'blur' }],
  priority: [{ required: true, message: '请选择优先级', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

// 状态和优先级标签样式
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

// 操作方法
const handleAdd = () => {
  dialogType.value = 'add'
  form.value = {
    id: null,
    title: '',
    description: '',
    assignee: '',
    priority: 'medium',
    status: 'pending',
    dueDate: ''
  }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogType.value = 'edit'
  form.value = { ...row } // 复制行数据到表单
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除任务"${row.title}"吗？`, '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    tasks.value = tasks.value.filter(task => task.id !== row.id)
    ElMessage.success('删除成功')
  })
}

const handleSearch = () => {
  // 搜索逻辑已在computed属性filteredTasks中自动处理
}

const handleFilter = () => {
  // 筛选逻辑已在computed属性filteredTasks中自动处理
}

const submitForm = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      if (dialogType.value === 'add') {
        // 新增：生成新ID并添加到列表
        const newId = tasks.value.length > 0 ? Math.max(...tasks.value.map(t => t.id)) + 1 : 1
        tasks.value.push({ ...form.value, id: newId })
        ElMessage.success('新增成功')
      } else {
        // 编辑：更新对应任务
        const index = tasks.value.findIndex(task => task.id === form.value.id)
        if (index !== -1) {
          tasks.value[index] = { ...form.value }
        }
        ElMessage.success('更新成功')
      }
      dialogVisible.value = false
    }
  })
}

// 模拟初始化加载
onMounted(() => {
  console.log('TaskView 组件已挂载，任务数据加载完成')
})
</script>

<style scoped>
.task-view {
  padding: 20px;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.actions {
  display: flex;
  align-items: center;
}
</style>