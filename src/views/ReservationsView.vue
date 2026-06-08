<template>
  <div>
    <div class="page-header">
      <div>
        <div class="page-title">预约管理</div>
        <div class="page-subtitle">查看、确认和取消用户桌台预约</div>
      </div>
      <el-button :loading="loading" @click="loadReservations">刷新</el-button>
    </div>

    <div class="panel">
      <div class="toolbar">
        <el-select v-model="query.status" style="width: 180px" @change="loadReservations">
          <el-option label="全部预约" value="ALL" />
          <el-option label="待确认" value="PENDING" />
          <el-option label="已确认" value="CONFIRMED" />
          <el-option label="已取消" value="CANCELLED" />
        </el-select>
      </div>

      <el-table :data="reservations" v-loading="loading" row-key="id">
        <el-table-column prop="id" label="预约ID" width="100" />
        <el-table-column label="桌台" width="120">
          <template #default="{ row }">{{ row.tableNo || `${row.tableId}号桌` }}</template>
        </el-table-column>
        <el-table-column prop="contactName" label="联系人" width="120" />
        <el-table-column prop="contactPhone" label="电话" min-width="150" />
        <el-table-column label="预约时间" min-width="190">
          <template #default="{ row }">{{ row.reservationDate }} {{ row.reservationTime }}</template>
        </el-table-column>
        <el-table-column prop="partySize" label="人数" width="90" />
        <el-table-column label="状态" width="110">
          <template #default="{ row }">
            <el-tag :type="statusMeta[row.status]?.type || 'info'">
              {{ statusMeta[row.status]?.text || row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="160" show-overflow-tooltip />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button
              size="small"
              type="primary"
              :disabled="row.status !== 'PENDING'"
              @click="changeStatus(row, 'CONFIRMED')"
            >
              确认
            </el-button>
            <el-button
              size="small"
              type="danger"
              :disabled="row.status === 'CANCELLED'"
              @click="changeStatus(row, 'CANCELLED')"
            >
              取消
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pager">
        <el-pagination
          v-model:current-page="query.pageNo"
          v-model:page-size="query.pageSize"
          layout="prev, pager, next, jumper"
          :total="total"
          @current-change="loadReservations"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { fetchReservations, updateReservationStatus } from '@/api/reservations'
import { normalizeList } from '@/utils/format'

const storeId = 1
const loading = ref(false)
const reservations = ref([])
const total = ref(0)
const query = reactive({
  storeId,
  status: 'ALL',
  pageNo: 1,
  pageSize: 10
})

const statusMeta = {
  PENDING: { text: '待确认', type: 'warning' },
  CONFIRMED: { text: '已确认', type: 'success' },
  CANCELLED: { text: '已取消', type: 'info' }
}

async function loadReservations() {
  loading.value = true
  try {
    const data = await fetchReservations(query)
    reservations.value = normalizeList(data)
    total.value = data?.total || reservations.value.length
  } finally {
    loading.value = false
  }
}

async function changeStatus(row, status) {
  await updateReservationStatus(row.id, { storeId, status })
  ElMessage.success(status === 'CONFIRMED' ? '预约已确认' : '预约已取消')
  loadReservations()
}

onMounted(loadReservations)
</script>

<style scoped>
.page-subtitle {
  margin-top: 4px;
  color: #6b7280;
  font-size: 13px;
}

.toolbar {
  margin-bottom: 16px;
  display: flex;
  justify-content: flex-end;
}

.pager {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
