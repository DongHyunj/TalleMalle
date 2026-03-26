self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {}
  const title = data.title || '새 메시지'
  const options = {
    body: data.body || '',
    data: data,
  }

  event.waitUntil(
    (async () => {
      await self.registration.showNotification(title, options)
      if (data.recruitId) {
        const clientList = await clients.matchAll({ type: 'window', includeUncontrolled: true })
        clientList.forEach((client) => {
          client.postMessage({ type: 'chat-unread', recruitId: data.recruitId })
        })
      }
    })(),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const recruitId = event.notification.data?.recruitId
  const targetUrl = recruitId ? `/chat/${recruitId}` : '/'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus()
          client.navigate(targetUrl)
          return
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl)
      }
    }),
  )
})
