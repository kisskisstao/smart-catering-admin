<template>
  <div>
    <div class="page-header">
      <div>
        <div class="page-title">桌台管理</div>
        <div class="page-subtitle">维护桌台、状态和点餐二维码</div>
      </div>
      <div class="header-actions">
        <el-button :loading="loading" @click="loadTables">刷新</el-button>
        <el-button type="primary" @click="openCreateDialog">新增桌台</el-button>
      </div>
    </div>

    <div class="panel">
      <el-table :data="tables" v-loading="loading" row-key="id">
        <el-table-column prop="id" label="ID" width="90" />
        <el-table-column label="桌台号" min-width="140">
          <template #default="{ row }">{{ row.tableNo || `${row.id}号桌` }}</template>
        </el-table-column>
        <el-table-column prop="seats" label="座位数" width="110" />
        <el-table-column prop="storeId" label="门店" width="110" />
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="statusMeta[row.status]?.type || 'info'">
              {{ statusMeta[row.status]?.text || row.status || '空闲' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="qrToken" label="二维码Token" min-width="260" show-overflow-tooltip />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="generateQrcode(row)">生成二维码</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="createVisible" title="新增桌台" width="460px" destroy-on-close>
      <el-form ref="createFormRef" :model="createForm" :rules="rules" label-width="86px">
        <el-form-item label="桌台号" prop="tableNo">
          <el-input v-model.trim="createForm.tableNo" placeholder="例如 A01" />
        </el-form-item>
        <el-form-item label="座位数" prop="seats">
          <el-input-number v-model="createForm.seats" :min="1" :max="30" controls-position="right" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="createForm.status" placeholder="请选择状态">
            <el-option label="空闲" value="FREE" />
            <el-option label="就餐中" value="OCCUPIED" />
            <el-option label="已预订" value="RESERVED" />
            <el-option label="待清理" value="DIRTY" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createVisible = false">取消</el-button>
        <el-button type="primary" :loading="creating" @click="submitCreate">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="qrcodeVisible" title="桌台二维码" width="420px">
      <div class="qrcode-box">
        <img v-if="qrcodeUrl" :src="qrcodeUrl" alt="桌台二维码" />
        <div class="qrcode-title">{{ currentTable?.tableNo || currentTable?.id }}号桌</div>
      </div>
      <template #footer>
        <el-button @click="qrcodeVisible = false">关闭</el-button>
        <el-button type="primary" :disabled="!qrcodeUrl" @click="downloadQrcode">下载二维码</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { nextTick, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { createTable, fetchTableQrcodeImage, fetchTables, generateTableQrcode } from '@/api/tables'
import { normalizeList } from '@/utils/format'

const storeId = 1
const loading = ref(false)
const creating = ref(false)
const tables = ref([])
const createVisible = ref(false)
const createFormRef = ref(null)
const qrcodeVisible = ref(false)
const qrcodeUrl = ref('')
const currentTable = ref(null)

const createForm = reactive({
  tableNo: '',
  seats: 4,
  status: 'FREE'
})

const rules = {
  tableNo: [
    { required: true, message: '请输入桌台号', trigger: 'blur' },
    { min: 1, max: 32, message: '桌台号长度不能超过32个字符', trigger: 'blur' }
  ],
  seats: [{ required: true, message: '请输入座位数', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

const statusMeta = {
  FREE: { text: '空闲', type: 'success' },
  AVAILABLE: { text: '空闲', type: 'success' },
  OCCUPIED: { text: '就餐中', type: 'warning' },
  USING: { text: '就餐中', type: 'warning' },
  RESERVED: { text: '已预订', type: 'primary' },
  DIRTY: { text: '待清理', type: 'info' },
  CLEANING: { text: '待清理', type: 'info' }
}

async function loadTables() {
  loading.value = true
  try {
    const data = await fetchTables({ storeId })
    tables.value = normalizeList(data)
  } finally {
    loading.value = false
  }
}

function openCreateDialog() {
  createForm.tableNo = ''
  createForm.seats = 4
  createForm.status = 'FREE'
  createVisible.value = true
  nextTick(() => createFormRef.value?.clearValidate())
}

async function submitCreate() {
  const valid = await createFormRef.value?.validate().catch(() => false)
  if (!valid) return

  creating.value = true
  try {
    await createTable({ storeId }, {
      tableNo: createForm.tableNo,
      seats: createForm.seats,
      status: createForm.status
    })
    ElMessage.success('桌台新增成功')
    createVisible.value = false
    await loadTables()
  } finally {
    creating.value = false
  }
}

async function generateQrcode(row) {
  currentTable.value = row
  try {
    await generateTableQrcode(row.id, { storeId })
    const blob = await fetchTableQrcodeImage(row.id, { storeId })
    if (qrcodeUrl.value) URL.revokeObjectURL(qrcodeUrl.value)
    qrcodeUrl.value = URL.createObjectURL(blob)
    qrcodeVisible.value = true
  } catch {
    if (row.qrCodeUrl || row.qrcodeUrl) {
      qrcodeUrl.value = row.qrCodeUrl || row.qrcodeUrl
      qrcodeVisible.value = true
      return
    }
    ElMessage.error('二维码生成失败')
  }
}

function downloadQrcode() {
  const a = document.createElement('a')
  a.href = qrcodeUrl.value
  a.download = `table-${currentTable.value?.id || 'qrcode'}.png`
  a.click()
}

onMounted(loadTables)
</script>

<style scoped>
.page-subtitle {
  margin-top: 4px;
  color: #6b7280;
  font-size: 13px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.qrcode-box {
  text-align: center;
}

.qrcode-box img {
  width: 260px;
  height: 260px;
  object-fit: contain;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.qrcode-title {
  margin-top: 14px;
  font-weight: 700;
}
</style>
