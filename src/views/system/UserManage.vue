<!--
  [系统页面] views/system/UserManage.vue —— 系统管理 / 用户与权限
  说明：筛选区 + 用户表格（角色/状态/部门）+ 新增/编辑弹窗 + 禁用/启用/重置密码/删除
-->
<template>
  <div class="user-view">
    <!-- ========== 模块一：页头操作 ========== -->
    <div class="gg-card table-card">
      <div class="gg-card-head">
        <span class="gg-card-title">用户与权限</span>
        <a-button type="primary" @click="openUserModal()"><PlusOutlined /> 新增用户</a-button>
      </div>

      <!-- ========== 模块二：筛选区 ========== -->
      <div class="filter-bar">
        <a-input v-model:value="query.keyword" style="width: 200px" placeholder="用户名 / 工号" allowClear />
        <a-select v-model:value="query.role" style="width: 150px" :options="roleOptions" placeholder="全部角色" allowClear />
        <a-select v-model:value="query.status" style="width: 130px" :options="statusOptions" placeholder="全部状态" allowClear />
        <a-button type="primary" @click="searchUserList">查询</a-button>
        <a-button @click="resetFilter">重置</a-button>
      </div>

      <!-- ========== 模块三：用户表格 ========== -->
      <a-table
        :columns="tableColumns"
        :data-source="userList"
        :loading="listLoading"
        :pagination="pagination"
        row-key="id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <!-- 角色标签 -->
          <template v-if="column.key === 'roleName'">
            <a-tag :color="roleColors[record.role]">{{ record.roleName }}</a-tag>
          </template>
          <!-- 账号状态 -->
          <template v-if="column.key === 'status'">
            <a-badge :status="record.status === 1 ? 'success' : 'error'" :text="record.status === 1 ? '启用' : '已禁用'" />
          </template>
          <!-- 操作列：禁用用户可恢复启用（FR-SYS-01） -->
          <template v-if="column.key === 'action'">
            <a-space>
              <a @click="openUserModal(record)">编辑</a>
              <a @click="resetUserPassword(record)">重置密码</a>
              <a v-if="record.status === 1" class="danger-link" @click="toggleUserStatus(record, 0)">禁用</a>
              <a v-else @click="toggleUserStatus(record, 1)">启用</a>
              <a v-if="record.status !== 1" class="danger-link" @click="confirmRemoveUser(record)">删除</a>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>

    <!-- ========== 模块四：新增 / 编辑弹窗 ========== -->
    <a-modal
      v-model:open="modalOpen"
      :title="editingUser ? '编辑用户' : '新增用户'"
      :confirm-loading="saveLoading"
      @ok="submitUser"
    >
      <a-form ref="formElRef" :model="userForm" :rules="userRules" layout="vertical">
        <a-row :gutter="12">
          <a-col :span="12">
            <a-form-item label="账号 / 工号" name="username">
              <a-input v-model:value="userForm.username" :disabled="!!editingUser" placeholder="请输入账号" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="姓名" name="name">
              <a-input v-model:value="userForm.name" placeholder="请输入姓名" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="12">
          <a-col :span="12">
            <a-form-item label="角色" name="role">
              <a-select v-model:value="userForm.role" :options="roleOptions" placeholder="请选择角色" @change="handleRoleChange" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="所属部门" name="dept">
              <a-input v-model:value="userForm.dept" placeholder="请输入部门" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
/* [模块] 用户列表 + 弹窗表单 + 状态切换 + 密码重置 + 删除 */
import { onMounted, reactive, ref } from 'vue'
import { message, Modal, type FormInstance } from 'ant-design-vue'
import type { Rule } from 'ant-design-vue/es/form'
import { PlusOutlined } from '@ant-design/icons-vue'
import { fetchUserList, addUser, updateUser, removeUser } from '@/api/system'

/* ---------- 筛选与分页 ---------- */
const listLoading = ref(false)
const userList = ref<any[]>([])
const query = reactive<Record<string, any>>({ page: 1, pageSize: 10, keyword: '', role: undefined, status: undefined })
const pagination = reactive({ current: 1, pageSize: 10, total: 0, showSizeChanger: false, showTotal: (t: number) => `共 ${t} 条记录 · 每页 10 条` })

const roleOptions = [
  { value: 'super', label: '超级管理员' },
  { value: 'ops', label: '运营管理员' },
  { value: 'warehouse', label: '仓储管理员' },
  { value: 'project', label: '项目管理员' },
  { value: 'guest', label: '只读访客' }
]
const roleColors: Record<string, string> = {
  super: 'red',
  ops: 'green',
  warehouse: 'blue',
  project: 'purple',
  guest: 'default'
}
const statusOptions = [
  { value: 1, label: '启用' },
  { value: 0, label: '已禁用' }
]

/* 表格列定义 */
const tableColumns = [
  { title: '姓名', dataIndex: 'name', key: 'name', width: 110 },
  { title: '账号', dataIndex: 'username', key: 'username', width: 120 },
  { title: '角色', dataIndex: 'roleName', key: 'roleName', width: 130 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '所属部门', dataIndex: 'dept', key: 'dept', width: 110 },
  { title: '最近登录', dataIndex: 'lastLoginAt', key: 'lastLoginAt', width: 160 },
  { title: '操作', key: 'action', width: 220 }
]

/* ---------- 拉取用户列表 ---------- */
async function loadUserList() {
  listLoading.value = true
  try {
    const data = await fetchUserList({ ...query })
    userList.value = data.list
    pagination.current = query.page
    pagination.total = data.total
  } finally {
    listLoading.value = false
  }
}

function searchUserList() {
  query.page = 1
  loadUserList()
}

function resetFilter() {
  Object.assign(query, { page: 1, keyword: '', role: undefined, status: undefined })
  loadUserList()
}

function handleTableChange(pager: any) {
  query.page = pager.current
  query.pageSize = pager.pageSize
  loadUserList()
}

/* ---------- 新增 / 编辑弹窗 ---------- */
const formElRef = ref<FormInstance>()
const modalOpen = ref(false)
const saveLoading = ref(false)
const editingUser = ref<any>(null)

const userForm = reactive<Record<string, any>>({ username: '', name: '', role: undefined, dept: '' })

const userRules: Record<string, Rule[]> = {
  username: [{ required: true, message: '请输入账号 / 工号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色' }],
  dept: [{ required: true, message: '请输入所属部门', trigger: 'blur' }]
}

function openUserModal(record?: any) {
  editingUser.value = record || null
  if (record) {
    Object.assign(userForm, record)
  } else {
    Object.assign(userForm, { username: '', name: '', role: undefined, dept: '' })
  }
  modalOpen.value = true
}

/* 选择角色时同步角色名称 */
function handleRoleChange(value: string) {
  const hit = roleOptions.find((opt) => opt.value === value)
  userForm.roleName = hit?.label || ''
}

async function submitUser() {
  try {
    await formElRef.value?.validate()
  } catch {
    return
  }
  saveLoading.value = true
  try {
    if (editingUser.value) {
      await updateUser(editingUser.value.id, { ...userForm })
      message.success('用户信息已更新')
    } else {
      await addUser({ ...userForm, roleName: userForm.roleName || '普通用户' })
      message.success('用户创建成功')
    }
    modalOpen.value = false
    loadUserList()
  } finally {
    saveLoading.value = false
  }
}

/* ---------- 禁用 / 启用 ---------- */
async function toggleUserStatus(record: any, status: 0 | 1) {
  await updateUser(record.id, { status })
  message.success(status === 1 ? `用户「${record.name}」已启用` : `用户「${record.name}」已禁用`)
  loadUserList()
}

/* ---------- 重置密码（模拟） ---------- */
function resetUserPassword(record: any) {
  Modal.confirm({
    title: '确认重置密码？',
    content: `用户「${record.name}」的密码将重置为初始密码，请通知其尽快修改。`,
    onOk: () => message.success('密码已重置为初始密码')
  })
}

/* ---------- 删除用户 ---------- */
function confirmRemoveUser(record: any) {
  Modal.confirm({
    title: '确认删除该用户？',
    content: `用户「${record.name}」（${record.username}）删除后不可恢复。`,
    okText: '确认删除',
    okType: 'danger',
    onOk: async () => {
      await removeUser(record.id)
      message.success('用户已删除')
      loadUserList()
    }
  })
}

onMounted(loadUserList)
</script>

<style lang="scss" scoped>
.table-card {
  .head-btn {
    margin-right: 12px;
  }
}

.filter-bar {
  display: -webkit-flex;
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  -webkit-flex-wrap: wrap;
  flex-wrap: wrap;
}

.danger-link {
  color: $color-danger;
}
</style>
