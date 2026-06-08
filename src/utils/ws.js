export function createMerchantOrderSocket(storeId, handlers = {}) {
  const url = `ws://localhost:8080/ws/merchant/order?storeId=${storeId}`
  let socket = new WebSocket(url)
  let closedByUser = false
  let reconnectTimer = null

  const connect = () => {
    socket = new WebSocket(url)
    bind()
  }

  const bind = () => {
    socket.onopen = event => handlers.open?.(event)
    socket.onmessage = event => {
      try {
        handlers.message?.(JSON.parse(event.data))
      } catch {
        handlers.message?.(event.data)
      }
    }
    socket.onerror = event => handlers.error?.(event)
    socket.onclose = event => {
      handlers.close?.(event)
      if (!closedByUser) {
        reconnectTimer = window.setTimeout(connect, 3000)
      }
    }
  }

  bind()

  return {
    close() {
      closedByUser = true
      if (reconnectTimer) window.clearTimeout(reconnectTimer)
      socket?.close()
    }
  }
}
