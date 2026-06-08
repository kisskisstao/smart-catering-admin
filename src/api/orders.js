import request from './request'

export function fetchOrders(params) {
  return request.get('/merchant/order/page', { params })
}

export function fetchOrderDetail(orderId, params) {
  return request.get(`/merchant/order/detail/${orderId}`, { params })
}

export function updateOrderStatus(orderId, params) {
  return request.put(`/merchant/order/${orderId}/status`, null, { params })
}
