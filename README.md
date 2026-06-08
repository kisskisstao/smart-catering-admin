# 智慧餐饮商家管理端

智慧餐饮商家后台前端，基于 Vue 3 + Vite + Element Plus 构建。用于管理门店订单、菜品、桌台二维码、预约和数据看板，并通过 WebSocket 接收新订单提醒。

## 技术栈

- Vue 3
- Vite 6
- Vue Router 4
- Pinia
- Element Plus
- ECharts
- Axios

## 目录结构

```text
smart-catering-admin/
  index.html
  package.json
  vite.config.js
  src/
    main.js              应用入口
    App.vue              根组件
    router/              路由与登录守卫
    stores/              Pinia 状态管理
    api/                 后端接口封装
    layouts/             商家后台布局
    views/               页面视图
    utils/               WebSocket、格式化工具
    styles/              全局样式
```

## 功能模块

| 页面 | 路由 | 功能 |
| --- | --- | --- |
| 登录 | `/login` | 商家端登录，保存 token 和用户信息 |
| 仪表盘 | `/dashboard` | 今日订单数、今日营业额、待接单数、近 7 天趋势、菜品销量排行、分类占比 |
| 订单管理 | `/orders` | 订单列表、状态筛选、接单、订单详情 |
| 菜品管理 | `/dishes` | 菜品列表、搜索、上下架状态筛选、新增、编辑、删除、规格价格维护 |
| 桌台管理 | `/tables` | 桌台列表、新增桌台、生成/下载桌台二维码 |
| 预约管理 | `/reservations` | 预约列表、状态筛选、确认预约、取消预约 |

后台布局包含：

- 左侧导航菜单
- 顶部当前页面标题
- 当前门店 ID
- WebSocket 实时连接状态
- 新订单右上角通知
- 退出登录

## 环境要求

| 工具 | 建议版本 | 说明 |
| --- | --- | --- |
| Node.js | 18+ | 运行 Vite |
| npm | 随 Node 安装 | 安装依赖 |
| 后端服务 | `smart-catering-backend` | 默认运行在 `http://localhost:8080` |

## 安装依赖

```powershell
cd E:\OvOTAO\code\smart-catering-admin
npm install
```

## 启动开发服务

```powershell
npm run dev
```

`package.json` 中开发命令为：

```json
{
  "dev": "vite --host 0.0.0.0"
}
```

默认访问地址：

```text
http://localhost:5173
```

因为使用了 `--host 0.0.0.0`，同一局域网内也可以通过电脑 IP 访问，例如：

```text
http://10.225.252.99:5173
```

## 构建和预览

生产构建：

```powershell
npm run build
```

本地预览构建产物：

```powershell
npm run preview
```

## 后端代理

Vite 代理配置位于 `vite.config.js`：

```js
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
      rewrite: path => path.replace(/^\/api/, '')
    }
  }
}
```

前端请求统一以 `/api` 开头，开发环境会转发到后端 `http://localhost:8080`。

如果后端运行在其他地址，修改 `vite.config.js` 中的 `target`。

## 登录与鉴权

登录页调用：

```http
POST /api/user/login
```

实际代理到后端：

```http
POST http://localhost:8080/user/login
```

登录成功后，`src/stores/auth.js` 会保存：

- `smart_catering_admin_token`
- `smart_catering_admin_user`

请求封装位于 `src/api/request.js`，会自动把 token 放入请求头：

```http
Authorization: <token>
```

路由守卫位于 `src/router/index.js`：

- 未登录访问后台页面会跳转 `/login`
- 已登录访问 `/login` 会跳转 `/dashboard`

说明：当前管理端登录复用后端 `/user/login` mock 登录能力，登录表单提交 `username/password`，后端会优先使用 `username` 生成 mock 用户。

## API 模块

### 登录

| 方法 | 前端 API | 后端路径 |
| --- | --- | --- |
| POST | `loginApi` | `/user/login` |

### 仪表盘

| 方法 | 前端 API | 后端路径 |
| --- | --- | --- |
| GET | `fetchDashboard` | `/merchant/dashboard` |

### 订单

| 方法 | 前端 API | 后端路径 |
| --- | --- | --- |
| GET | `fetchOrders` | `/merchant/order/page` |
| GET | `fetchOrderDetail` | `/merchant/order/detail/{orderId}` |
| PUT | `updateOrderStatus` | `/merchant/order/{orderId}/status` |

### 菜品

| 方法 | 前端 API | 后端路径 |
| --- | --- | --- |
| GET | `fetchDishes` | `/merchant/dish/page` |
| GET | `fetchDishDetail` | `/dish/detail/{id}` |
| POST | `createDish` | `/merchant/dish` |
| PUT | `updateDish` | `/merchant/dish/{id}` |
| DELETE | `deleteDish` | `/merchant/dish/{id}` |

说明：`uploadDishImage` 当前是本地预览实现，返回 `URL.createObjectURL(file)`，没有真实上传到后端。

### 桌台

| 方法 | 前端 API | 后端路径 |
| --- | --- | --- |
| GET | `fetchTables` | `/merchant/table/page` |
| POST | `createTable` | `/merchant/table` |
| POST | `generateTableQrcode` | `/merchant/table/{id}/qrcode` |
| GET | `fetchTableQrcodeImage` | `/merchant/table/{id}/qrcode/image` |

### 预约

| 方法 | 前端 API | 后端路径 |
| --- | --- | --- |
| GET | `fetchReservations` | `/merchant/reservation/page` |
| PUT | `updateReservationStatus` | `/merchant/reservation/{id}/status` |

## 固定门店 ID

当前页面中 `storeId` 固定为 `1`：

- `DashboardView.vue`
- `OrdersView.vue`
- `DishesView.vue`
- `TablesView.vue`
- `ReservationsView.vue`
- `AdminLayout.vue`

如果后续支持多门店，需要把 `storeId` 改为从登录用户、路由参数或全局状态读取。

## 订单状态

管理端当前识别的订单状态：

- `PENDING_PAYMENT`：待支付
- `WAIT_ACCEPT`：待接单
- `COOKING`：制作中
- `COMPLETED`：已完成
- `CANCELLED`：已取消

订单管理页中：

- `WAIT_ACCEPT` 订单显示“接单”按钮。
- 点击接单会调用 `PUT /merchant/order/{orderId}/status?status=COOKING`。
- 其他状态订单可查看详情。

## 餐桌状态

桌台管理页识别的桌台状态：

- `FREE` / `AVAILABLE`：空闲
- `OCCUPIED` / `USING`：就餐中
- `RESERVED`：已预订
- `DIRTY` / `CLEANING`：待清理

新增桌台支持填写：

- 桌台号
- 座位数
- 初始状态

二维码功能：

- 点击“生成二维码”调用后端刷新二维码 token。
- 再请求二维码 PNG blob。
- 前端弹窗展示二维码并支持下载。

## 预约状态

预约管理页支持：

- `ALL`：全部
- `PENDING`：待确认
- `CONFIRMED`：已确认
- `CANCELLED`：已取消

待确认预约可以确认或取消；已取消预约不可再次取消。

## WebSocket 新订单提醒

WebSocket 工具位于 `src/utils/ws.js`。

管理端连接：

```text
ws://localhost:8080/ws/merchant/order?storeId=1
```

收到新订单消息：

```json
{
  "type": "NEW_ORDER",
  "orderId": 1,
  "orderNo": "OD202606081200001234",
  "storeId": 1,
  "totalAmount": 58.00
}
```

布局组件 `AdminLayout.vue` 会：

- 显示右上角新订单通知。
- 触发浏览器事件 `merchant:new-order`。
- 订单管理页监听该事件并刷新订单列表。
- WebSocket 断开后 3 秒自动重连。

如果后端不在 `localhost:8080`，需要同步修改 `src/utils/ws.js` 中的 WebSocket 地址。

## 常见问题

### 页面提示网络异常

1. 确认后端已启动并监听 `8080`。
2. 在浏览器或 PowerShell 测试：

```powershell
Invoke-RestMethod "http://localhost:8080/merchant/dashboard?storeId=1"
```

3. 确认 `vite.config.js` 代理 target 正确。
4. 如果使用局域网访问前端，后端仍由开发服务器代理，浏览器只需要访问 `5173`。

### 登录后仍跳回登录页

- 检查浏览器 localStorage 是否保存 `smart_catering_admin_token`。
- 检查后端 `/user/login` 是否返回 `code: 200` 且 `data.token` 存在。

### 新订单没有提醒

- 确认后端 WebSocket 地址 `ws://localhost:8080/ws/merchant/order?storeId=1` 可用。
- 确认后端 RabbitMQ 正常，新订单支付成功后会发布新订单事件。
- 如果后端不在本机，修改 `src/utils/ws.js` 的地址。

### 二维码无法显示

- 确认后端接口 `/merchant/table/{id}/qrcode/image` 返回 PNG。
- 检查浏览器控制台是否有接口错误。
- 先点击“生成二维码”，再打开二维码弹窗。

