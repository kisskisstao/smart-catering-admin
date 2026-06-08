<template>
  <div>
    <div class="page-header">
      <div class="page-title">数据看板</div>
      <el-button :loading="loading" @click="loadDashboard">刷新</el-button>
    </div>

    <el-row :gutter="16" class="summary-row">
      <el-col :span="8">
        <div class="summary-card">
          <div class="summary-label">今日订单数</div>
          <div class="summary-value">{{ summary.todayOrders }}</div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="summary-card">
          <div class="summary-label">今日营业额</div>
          <div class="summary-value">{{ money(summary.todayRevenue) }}</div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="summary-card">
          <div class="summary-label">待接单数</div>
          <div class="summary-value">{{ summary.waitAcceptCount }}</div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <el-col :span="14">
        <div class="panel">
          <div class="chart-title">近 7 天订单趋势</div>
          <div ref="trendRef" class="chart"></div>
        </div>
      </el-col>
      <el-col :span="10">
        <div class="panel">
          <div class="chart-title">菜品类别占比</div>
          <div ref="categoryRef" class="chart"></div>
        </div>
      </el-col>
    </el-row>

    <div class="panel rank-panel">
      <div class="chart-title">菜品销量排行</div>
      <div ref="rankRef" class="chart"></div>
    </div>
  </div>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import * as echarts from 'echarts'
import { fetchDashboard } from '@/api/dashboard'
import { money } from '@/utils/format'

const storeId = 1
const loading = ref(false)
const trendRef = ref(null)
const rankRef = ref(null)
const categoryRef = ref(null)
const summary = reactive({
  todayOrders: 0,
  todayRevenue: 0,
  waitAcceptCount: 0
})

let trendChart = null
let rankChart = null
let categoryChart = null

const fallbackData = {
  summary: { todayOrders: 18, todayRevenue: 1268, waitAcceptCount: 4 },
  trend: [
    { date: '周一', count: 21 },
    { date: '周二', count: 18 },
    { date: '周三', count: 25 },
    { date: '周四', count: 22 },
    { date: '周五', count: 31 },
    { date: '周六', count: 36 },
    { date: '周日', count: 28 }
  ],
  dishRank: [
    { name: '招牌红烧肉', sales: 86 },
    { name: '宫保鸡丁', sales: 72 },
    { name: '麻婆豆腐', sales: 64 },
    { name: '炸鸡翅', sales: 48 },
    { name: '柠檬茶', sales: 42 }
  ],
  categoryRatio: [
    { name: '主食', value: 42 },
    { name: '热菜', value: 36 },
    { name: '小吃', value: 16 },
    { name: '饮品', value: 20 }
  ]
}

function normalizeDashboard(data) {
  return {
    summary: data?.summary || data?.today || fallbackData.summary,
    trend: data?.trend || data?.orderTrend || fallbackData.trend,
    dishRank: data?.dishRank || data?.salesRank || fallbackData.dishRank,
    categoryRatio: data?.categoryRatio || data?.categoryStats || fallbackData.categoryRatio
  }
}

async function loadDashboard() {
  loading.value = true
  try {
    const data = await fetchDashboard({ storeId })
    render(normalizeDashboard(data))
  } catch {
    render(fallbackData)
  } finally {
    loading.value = false
  }
}

function render(data) {
  Object.assign(summary, data.summary)
  nextTick(() => {
    renderTrend(data.trend)
    renderRank(data.dishRank)
    renderCategory(data.categoryRatio)
  })
}

function renderTrend(data) {
  trendChart ||= echarts.init(trendRef.value)
  trendChart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: data.map(item => item.date) },
    yAxis: { type: 'value' },
    series: [{
      name: '订单数',
      type: 'line',
      smooth: true,
      data: data.map(item => item.count),
      areaStyle: {},
      lineStyle: { color: '#16a34a' },
      itemStyle: { color: '#16a34a' }
    }]
  })
}

function renderRank(data) {
  rankChart ||= echarts.init(rankRef.value)
  rankChart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: data.map(item => item.name) },
    yAxis: { type: 'value' },
    series: [{
      name: '销量',
      type: 'bar',
      data: data.map(item => item.sales || item.value),
      itemStyle: { color: '#f59e0b', borderRadius: [4, 4, 0, 0] }
    }]
  })
}

function renderCategory(data) {
  categoryChart ||= echarts.init(categoryRef.value)
  categoryChart.setOption({
    tooltip: { trigger: 'item' },
    legend: { bottom: 0 },
    series: [{
      type: 'pie',
      radius: ['45%', '70%'],
      data
    }]
  })
}

function resizeCharts() {
  trendChart?.resize()
  rankChart?.resize()
  categoryChart?.resize()
}

onMounted(() => {
  loadDashboard()
  window.addEventListener('resize', resizeCharts)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCharts)
  trendChart?.dispose()
  rankChart?.dispose()
  categoryChart?.dispose()
})
</script>

<style scoped>
.summary-row {
  margin-bottom: 16px;
}

.summary-card {
  padding: 22px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
}

.summary-label {
  color: #64748b;
}

.summary-value {
  margin-top: 10px;
  font-size: 30px;
  font-weight: 800;
}

.chart-title {
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 700;
}

.rank-panel {
  margin-top: 16px;
}
</style>
