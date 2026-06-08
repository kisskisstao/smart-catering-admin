<template>
  <div>
    <div class="page-header">
      <div class="page-title">订单管理</div>
      <el-button :loading="loading" @click="loadOrders">刷新</el-button>
    </div>

    <div class="panel">
      <div class="toolbar">
        <el-select v-model="query.status" placeholder="订单状态" clearable style="width: 180px" @change="loadOrders">
          <el-option label="待接单" value="WAIT_ACCEPT" />
          <el-option label="制作中" value="COOKING" />
          <el-option label="已完成" value="COMPLETED" />
        </el-select>
      </div>

      <el-table :data="orders" v-loading="loading" row-key="id">
        <el-table-column prop="orderNo" label="订单号" min-width="160" />
        <el-table-column label="桌台" width="110">
          <template #default="{ row }">{{ row.tableNo || row.tableId }}</template>
        </el-table-column>
        <el-table-column label="金额" width="120">
          <template #default="{ row }">{{ money(row.totalAmount) }}</template>
        </el-table-column>
        <el-table-column label="状态" width="130">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="下单时间" min-width="180" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'WAIT_ACCEPT'"
              type="primary"
              size="small"
              :loading="updatingId === row.id"
              @click="acceptOrder(row)"
            >
              接单
            </el-button>
            <el-button v-else size="small" @click="showDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="detailVisible" title="订单详情" width="640px">
      <el-descriptions v-if="currentOrder" :column="2" border>
        <el-descriptions-item label="订单号">{{ currentOrder.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="桌台">{{ currentOrder.tableNo || currentOrder.tableId }}</el-descriptions-item>
        <el-descriptions-item label="金额">{{ money(currentOrder.totalAmount) }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ statusText(currentOrder.status) }}</el-descriptions-item>
      </el-descriptions>
      <el-table v-if="currentOrder?.items" :data="currentOrder.items" style="margin-top: 16px">
        <el-table-column prop="dishName" label="菜品" />
        <el-table-column prop="spicy" label="口味" />
        <el-table-column prop="size" label="规格" />
        <el-table-column prop="quantity" label="数量" width="90" />
        <el-table-column label="金额" width="120">
          <template #default="{ row }">{{ money(row.amount) }}</template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { fetchOrderDetail, fetchOrders, updateOrderStatus } from '@/api/orders'
import { money, normalizeList } from '@/utils/format'

const storeId = 1
const loading = ref(false)
const updatingId = ref(null)
const orders = ref([])
const detailVisible = ref(false)
const currentOrder = ref(null)
const query = reactive({
  status: ''
})

function statusText(status) {
  const map = {
    PENDING_PAYMENT: '待支付',
    WAIT_ACCEPT: '待接单',
    COOKING: '制作中',
    COMPLETED: '已完成',
    CANCELLED: '已取消'
  }
  return map[status] || status
}

function statusType(status) {
  const map = {
    WAIT_ACCEPT: 'warning',
    COOKING: 'primary',
    COMPLETED: 'success',
    CANCELLED: 'info'
  }
  return map[status] || 'info'
}

async function loadOrders() {
  loading.value = true
  try {
    const data = await fetchOrders({
      storeId,
      status: query.status || undefined
    })
    orders.value = normalizeList(data)
  } finally {
    loading.value = false
  }
}

async function acceptOrder(row) {
  updatingId.value = row.id
  try {
    await updateOrderStatus(row.id, { storeId, status: 'COOKING' })
    ElMessage.success('已接单')
    await loadOrders()
  } finally {
    updatingId.value = null
  }
}

async function showDetail(row) {
  currentOrder.value = await fetchOrderDetail(row.id, { storeId })
  detailVisible.value = true
}

function handleNewOrder() {
  loadOrders()
}

onMounted(() => {
  loadOrders()
  window.addEventListener('merchant:new-order', handleNewOrder)
})

onBeforeUnmount(() => {
  window.removeEventListener('merchant:new-order', handleNewOrder)
})
</script>
