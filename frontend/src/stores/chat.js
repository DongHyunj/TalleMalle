import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useChatStore = defineStore('chat', () => {
  const unreadByRecruit = ref(JSON.parse(localStorage.getItem('chatUnread') || '{}'))

  const hasUnread = computed(() => Object.values(unreadByRecruit.value).some(Boolean))

  const markUnread = (recruitId) => {
    if (!recruitId) return
    unreadByRecruit.value[recruitId] = true
    localStorage.setItem('chatUnread', JSON.stringify(unreadByRecruit.value))
  }

  const setUnreadFromServer = (recruitIds) => {
    const next = {}
    recruitIds.forEach((id) => {
      next[id] = true
    })
    unreadByRecruit.value = next
    localStorage.setItem('chatUnread', JSON.stringify(unreadByRecruit.value))
  }

  const clearUnread = (recruitId) => {
    if (!recruitId) return
    delete unreadByRecruit.value[recruitId]
    localStorage.setItem('chatUnread', JSON.stringify(unreadByRecruit.value))
  }

  return {
    unreadByRecruit,
    hasUnread,
    markUnread,
    setUnreadFromServer,
    clearUnread,
  }
})
