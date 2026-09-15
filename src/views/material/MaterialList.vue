<!--
  [业务页面] views/material/MaterialList.vue —— 物料管理 / 物料列表
  说明：筛选区（名称/分类/预警状态）+ 物料表格（库存预警标记）+
       新增/编辑弹窗 + 详情抽屉（出入库记录追溯）
-->
<template>
  <div class="material-view">
    <!-- ========== 模块一：页头操作 ========== -->
    <div class="gg-card table-card">
      <div class="gg-card-head">
        <span class="gg-card-title">物料列表</span>
        <div>
          <a-button class="head-btn" @click="exportMaterialList"><DownloadOutlined /> 导出</a-button>
          <a-button type="primary" @click="openMaterialModal()"><PlusOutlined /> 新增物料</a-button>
        </div>
      </div>

      <!-- ========== 模块二：筛选区 ========== -->
      <div class="filter-bar">
        <a-input v-model:value="query.keyword" style="width: 200px" placeholder="物料名称 / 编码" allowClear />
        <a-select v-model:value="query.category" style="width: 140px" :options="categoryOptions" placeholder="全部分类" allowClear />
        <a-select v-model:value="query.status" style="width: 130px" :options="statusOptions" placeholder="预警状态" allowClear />
        <a-button type="primary" @click="searchMaterialList">查询</a-button>
        <a-button @click="resetFilter">重置</a-button>
      </div>

      <!-- ========== 模块三：物料表格 ========== -->
      <a-table
        :columns="tableColumns"
        :data-source="materialList"
        :loading="listLoading"
        :pagination="pagination"
        row-key="id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <!-- 库存状态（FR-MAT-02 预警标记） -->
          <template v-if="column.key === 'status'">
            <a-tag :color="statusColors[record.status]">{{ record.status }}</a-tag>
          </template>
          <!-- 库存 / 安全库存 -->
          <template v-if="column.key === 'stock'">
            <span :class="{ 'stock-warn': record.stock < record.safetyStock }">
              {{ record.stock }} / {{ record.safetyStock }}
            </span>
          </template>
          <!-- 操作列 -->
          <template v-if="column.key === 'action'">
            <a-space>
              <a @click="openMaterialDetail(record.id)">详情</a>
              <a @click="openMaterialModal(record)">编辑</a>
              <a class="danger-link" @click="confirmRemoveMaterial(record)">删除</a>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>

    <!-- ========== 模块四：新增 / 编辑弹窗 ========== -->
    <a-modal
      v-model:open="modalOpen"
      :title="editingMaterial ? '编辑物料' : '新增物料'"
      :confirm-loading="saveLoading"
      @ok="submitMaterial"
    >
      <a-form ref="formElRef" :model="materialForm" :rules="materialRules" layout="vertical">
        <a-form-item label="物料名称" name="name">
          <a-input v-model:value="materialForm.name" placeholder="请输入物料名称" />
        </a-form-item>
        <a-form-item label="物料编码" name="materialCode">
          <a-input v-model:value="materialForm.materialCode" placeholder="如 MAT-0301" />
        </a-form-item>
        <a-row :gutter="12">
          <a-col :span="12">
            <a-form-item label="物料分类" name="category">
              <a-select v-model:value="materialForm.category" :options="categoryOptions" placeholder="请选择分类" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="单位" name="unit">
              <a-select v-model:value="materialForm.unit" :options="unitOptions" placeholder="请选择单位" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="规格型号" name="spec">
          <a-input v-model:value="materialForm.spec" placeholder="如 3.2V / 280Ah" />
        </a-form-item>
        <a-row :gutter="12">
          <a-col :span="12">
            <a-form-item label="当前库存" name="stock">
              <a-input-number v-model:value="materialForm.stock" :min="0" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="安全库存" name="safetyStock">
              <a-input-number v-model:value="materialForm.safetyStock" :min="0" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>

    <!-- ========== 模块五：详情抽屉（信息 + 出入库追溯） ========== -->
    <a-drawer v-model:open="detailOpen" title="物料详情 / 记录追溯" width="560">
      <template v-if="materialDetail">
        <a-descriptions :column="2" bordered size="small">
          <a-descriptions-item label="物料编码">{{ materialDetail.materialCode }}</a-descriptions-item>
          <a-descriptions-item label="分类">{{ materialDetail.category }}</a-descriptions-item>
          <a-descriptions-item label="物料名称" :span="2">{{ materialDetail.name }}</a-descriptions-item>
          <a-descriptions-item label="规格">{{ materialDetail.spec }}</a-descriptions-item>
          <a-descriptions-item label="单位">{{ materialDetail.unit }}</a-descriptions-item>
          <a-descriptions-item label="库存 / 安全库存">{{ materialDetail.stock }} / {{ materialDetail.safetyStock }}</a-descriptions-item>
          <a-descriptions-item label="库存状态">
            <a-tag :color="statusColors[materialDetail.status]">{{ materialDetail.status }}</a-tag>
          </a-descriptions-item>
        </a-descriptions>

        <!-- 入库记录（FR-MAT-05 追溯） -->
        <h4 class="detail-subtitle">入库记录（{{ materialDetail.inboundRecords.length }}）</h4>
        <a-table
          :columns="orderColumns"
          :data-source="materialDetail.inboundRecords"
          :pagination="false"
          row-key="id"
          size="small"
        />

        <!-- 出库记录 -->
        <h4 class="detail-subtitle">出库记录（{{ materialDetail.outboundRecords.length }}）</h4>
        <a-table
          :columns="orderColumns"
          :data-source="materialDetail.outboundRecords"
          :pagination="false"
          row-key="id"
          size="small"
        />
      </template>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
/* [模块] 列表查询 + 弹窗表单 + 详情追溯 + 删除确认 */
import { onMounted, reactive, ref } from 'vue'
import { message, Modal, type FormInstance } from 'ant-design-vue'
import type { Rule } from 'ant-design-vue/es/form'
import { DownloadOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { fetchMaterialDetail, fetchMaterialList, addMaterial, updateMaterial, removeMaterial } from '@/api/material'

/* ---------- 筛选与分页 ---------- */
const listLoading = ref(false)
const materialList = ref<any[]>([])
const query = reactive<Record<string, any>>({ page: 1, pageSize: 10, keyword: '', category: undefined, status: undefined })
const pagination = reactive({ current: 1, pageSize: 10, total: 0, showSizeChanger: false, showTotal: (t: number) => `共 ${t} 条记录 · 每页 10 条` })

const categoryOptions = ['电芯电池', '光伏组件', '电气元件', '结构件辅材'].map((c) => ({ value: c, label: c }))
const unitOptions = ['件', '块', '个', '台', '套', '卷', '米'].map((u) => ({ value: u, label: u }))
const statusOptions = ['正常', '低库存', '缺货'].map((s) => ({ value: s, label: s }))
const statusColors: Record<string, string> = { 正常: 'green', 低库存: 'orange', 缺货: 'red' }

/* 表格列定义 */
const tableColumns = [
  { title: '物料编码', dataIndex: 'materialCode', key: 'materialCode', width: 120 },
  { title: '物料名称', dataIndex: 'name', key: 'name', ellipsis: true },
  { title: '规格', dataIndex: 'spec', key: 'spec', width: 140, ellipsis: true },
  { title: '分类', dataIndex: 'category', key: 'category', width: 110 },
  { title: '单位', dataIndex: 'unit', key: 'unit', width: 70 },
  { title: '库存状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '库存 / 安全库存', dataIndex: 'stock', key: 'stock', width: 140 },
  { title: '操作', key: 'action', width: 150 }
]

/* 出入库记录列 */
const orderColumns = [
  { title: '单号', dataIndex: 'orderNo', key: 'orderNo' },
  { title: '数量', dataIndex: 'quantity', key: 'quantity', width: 70 },
  { title: '仓库 / 去向', dataIndex: 'target', key: 'target', ellipsis: true },
  { title: '时间', dataIndex: 'time', key: 'time', width: 140 }
]

/* ---------- 拉取物料列表 ---------- */
async function loadMaterialList() {
  listLoading.value = true
  try {
    const data = await fetchMaterialList({ ...query })
    materialList.value = data.list
    pagination.current = query.page
    pagination.total = data.total
  } finally {
    listLoading.value = false
  }
}

function searchMaterialList() {
  query.page = 1
  loadMaterialList()
}

function resetFilter() {
  Object.assign(query, { page: 1, keyword: '', category: undefined, status: undefined })
  loadMaterialList()
}

function handleTableChange(pager: any) {
  query.page = pager.current
  query.pageSize = pager.pageSize
  loadMaterialList()
}

/* ---------- 新增 / 编辑弹窗 ---------- */
const formElRef = ref<FormInstance>()
const modalOpen = ref(false)
const saveLoading = ref(false)
const editingMaterial = ref<any>(null)

const materialForm = reactive<Record<string, any>>({
  name: '',
  materialCode: '',
  category: undefined,
  unit: undefined,
  spec: '',
  stock: 0,
  safetyStock: 0
})

const materialRules: Record<string, Rule[]> = {
  name: [{ required: true, message: '请输入物料名称', trigger: 'blur' }],
  materialCode: [{ required: true, message: '请输入物料编码', trigger: 'blur' }],
  category: [{ required: true, message: '请选择物料分类' }],
  unit: [{ required: true, message: '请选择单位' }]
}

function openMaterialModal(record?: any) {
  editingMaterial.value = record || null
  if (record) {
    Object.assign(materialForm, record)
  } else {
    Object.assign(materialForm, { name: '', materialCode: '', category: undefined, unit: undefined, spec: '', stock: 0, safetyStock: 0 })
  }
  modalOpen.value = true
}

async function submitMaterial() {
  try {
    await formElRef.value?.validate()
  } catch {
    return
  }
  saveLoading.value = true
  try {
    if (editingMaterial.value) {
      await updateMaterial(editingMaterial.value.id, { ...materialForm })
      message.success('物料已更新')
    } else {
      await addMaterial({ ...materialForm })
      message.success('物料创建成功')
    }
    modalOpen.value = false
    loadMaterialList()
  } finally {
    saveLoading.value = false
  }
}

/* ---------- 详情抽屉：信息 + 出入库追溯 ---------- */
const detailOpen = ref(false)
const materialDetail = ref<any>(null)

async function openMaterialDetail(id: number) {
  detailOpen.value = true
  materialDetail.value = await fetchMaterialDetail(id)
}

/* ---------- 删除确认 ---------- */
function confirmRemoveMaterial(record: any) {
  Modal.confirm({
    title: '确认删除该物料？',
    content: `「${record.name}」删除后不可恢复，历史出入库记录将保留。`,
    okText: '确认删除',
    okType: 'danger',
    onOk: async () => {
      await removeMaterial(record.id)
      message.success('物料已删除')
      loadMaterialList()
    }
  })
}

/* ---------- 模拟导出 ---------- */
function exportMaterialList() {
  message.success('导出任务已创建，稍后可在下载列表查看')
}

onMounted(loadMaterialList)
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

/* 低于安全库存时库存数字标红 */
.stock-warn {
  color: $color-danger;
  font-weight: 600;
}

.detail-subtitle {
  margin: 20px 0 10px;
  font-size: 14px;
  font-weight: 600;
}

.danger-link {
  color: $color-danger;
}
</style>
