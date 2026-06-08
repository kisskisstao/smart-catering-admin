import request from './request'

export function fetchTables(params) {
  return request.get('/merchant/table/page', { params })
}

export function createTable(params, data) {
  return request.post('/merchant/table', data, { params })
}

export function generateTableQrcode(id, params) {
  return request.post(`/merchant/table/${id}/qrcode`, null, { params })
}

export function fetchTableQrcodeImage(id, params) {
  return request.get(`/merchant/table/${id}/qrcode/image`, {
    params,
    responseType: 'blob'
  })
}
