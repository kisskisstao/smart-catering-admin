<template>
  <el-container class="admin-layout">
    <el-aside width="220px" class="aside">
      <div class="brand">
        <el-icon><Bowl /></el-icon>
        <span>智慧餐饮商家端</span>
      </div>
      <el-menu
        :default-active="route.path"
        router
        class="menu"
        background-color="#111827"
        text-color="#cbd5e1"
        active-text-color="#ffffff"
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataLine /></el-icon>
          <span>仪表盘</span>
        </el-menu-item>
        <el-menu-item index="/orders">
          <el-icon><Tickets /></el-icon>
          <span>订单管理</span>
        </el-menu-item>
        <el-menu-item index="/dishes">
          <el-icon><Dish /></el-icon>
          <span>菜品管理</span>
        </el-menu-item>
        <el-menu-item index="/tables">
          <el-icon><Grid /></el-icon>
          <span>桌台管理</span>
        </el-menu-item>
        <el-menu-item index="/reservations">
          <el-icon><Calendar /></el-icon>
          <span>预约管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div>
          <div class="header-title">{{ route.meta.title || '智慧餐饮' }}</div>
          <div class="header-subtitle">门店 ID：{{ storeId }}</div>
        </div>
        <div class="header-actions">
          <el-tag :type="socketOnline ? 'success' : 'info'">{{ socketOnline ? '实时连接中' : '连接中' }}</el-tag>
          <el-button @click="logout">退出登录</el-button>
        </div>
      </el-header>
      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElNotification } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { createMerchantOrderSocket } from '@/utils/ws'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const storeId = 1
const socketOnline = ref(false)
let socketClient = null

function logout() {
  auth.logout()
  router.replace('/login')
}

onMounted(() => {
  socketClient = createMerchantOrderSocket(storeId, {
    open: () => {
      socketOnline.value = true
    },
    close: () => {
      socketOnline.value = false
    },
    message: message => {
      if (!message || message.type !== 'NEW_ORDER') return
      ElNotification({
        title: '新订单',
        message: `订单 ${message.orderNo || message.orderId}，金额 ¥${message.totalAmount || 0}`,
        type: 'success',
        position: 'top-right',
        duration: 4500
      })
      window.dispatchEvent(new CustomEvent('merchant:new-order', { detail: message }))
    }
  })
})

onBeforeUnmount(() => {
  socketClient?.close()
})
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
}

.aside {
  background: #111827;
}

.brand {
  height: 64px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 20px;
  color: #ffffff;
  font-size: 17px;
  font-weight: 700;
}

.menu {
  border-right: 0;
}

.header {
  height: 64px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
}

.header-title {
  font-size: 18px;
  font-weight: 700;
}

.header-subtitle {
  margin-top: 4px;
  color: #6b7280;
  font-size: 13px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.main {
  padding: 22px;
}
</style>
