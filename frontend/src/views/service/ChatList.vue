<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import chatApi from '@/api/chat'

const router = useRouter()
const isLoading = ref(true)
const ongoingRooms = ref([])
const endedRooms = ref([])

const formatTime = (dateValue) => {
  if (!dateValue) return '--:--'
  const date = new Date(dateValue)
  return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}

const loadRooms = async () => {
  isLoading.value = true
  try {
    const res = await chatApi.getChatRooms()
    const list = res?.result ?? res ?? []
    const ongoing = []
    const ended = []
    list.forEach((room) => {
      if (room.status === 'END') ended.push(room)
      else ongoing.push(room)
    })
    ongoingRooms.value = ongoing
    endedRooms.value = ended
  } finally {
    isLoading.value = false
  }
}

const openRoom = (room) => {
  const recruitId = room.recruitIdx
  if (!recruitId) return
  router.push(`/chat/${recruitId}`)
}

onMounted(loadRooms)
</script>

<template>
  <div class="h-full flex gap-4 p-4 overflow-hidden relative">
    <div class="hidden md:block w-20 shrink-0"></div>

    <main class="flex-1 overflow-hidden">
      <div
        class="h-full bg-white/90 backdrop-blur rounded-[2.5rem] border border-white/50 shadow-sm p-6 overflow-y-auto custom-scroll"
      >
        <header class="flex items-center justify-between mb-6">
          <div>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">My Rooms</p>
            <h2 class="text-xl font-black text-slate-900">채팅방 목록</h2>
          </div>
        </header>

        <div
          v-if="isLoading"
          class="min-h-[220px] bg-slate-50/60 rounded-[2rem] border border-slate-100 flex items-center justify-center"
        >
          <p class="text-slate-400 font-bold animate-pulse">채팅방을 불러오는 중...</p>
        </div>

        <div v-else class="flex flex-col gap-10">
          <section>
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-bold text-slate-500">진행 중</h3>
              <span class="text-xs text-slate-400">{{ ongoingRooms.length }}개</span>
            </div>

            <div v-if="ongoingRooms.length === 0" class="text-slate-400 text-sm">
              진행 중인 채팅방이 없습니다.
            </div>

            <div v-else class="grid md:grid-cols-2 gap-4">
              <button
                v-for="room in ongoingRooms"
                :key="room.recruitId"
                type="button"
                class="text-left bg-white rounded-[2rem] border border-slate-100 p-5 shadow-sm hover:shadow-md hover:border-indigo-100 transition"
                @click="openRoom(room)"
              >
                <div class="flex items-center justify-between gap-4">
                  <div class="min-w-0">
                    <p class="text-[10px] text-slate-400 uppercase tracking-widest">출발 → 도착</p>
                    <p class="font-bold text-slate-900 truncate">
                      {{ room.startPointName }} → {{ room.destPointName }}
                    </p>
                  </div>
                  <div class="text-right shrink-0">
                    <p class="text-[10px] text-slate-400 uppercase tracking-widest">출발 시간</p>
                    <p class="text-sm font-black text-indigo-600">
                      {{ formatTime(room.departureTime) }}
                    </p>
                  </div>
                </div>

                <div class="flex items-center justify-between mt-4">
                  <span class="text-xs text-slate-400">인원</span>
                  <span class="text-xs font-bold text-slate-700">
                    {{ room.currentCapacity }} / {{ room.maxCapacity }}
                  </span>
                </div>
                <div class="h-1 bg-slate-100 rounded-full overflow-hidden mt-2">
                  <div
                    class="h-full bg-indigo-500"
                    :style="{
                      width: `${Math.min(100, (room.currentCapacity / room.maxCapacity) * 100)}%`,
                    }"
                  ></div>
                </div>
              </button>
            </div>
          </section>

          <section>
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-bold text-slate-500">운행 종료</h3>
              <span class="text-xs text-slate-400">{{ endedRooms.length }}개</span>
            </div>

            <div v-if="endedRooms.length === 0" class="text-slate-400 text-sm">
              종료된 채팅방이 없습니다.
            </div>

            <div v-else class="grid md:grid-cols-2 gap-4">
              <button
                v-for="room in endedRooms"
                :key="room.recruitId"
                type="button"
                class="text-left bg-slate-50 rounded-[2rem] border border-slate-100 p-5 text-slate-600 hover:bg-slate-100 transition"
                @click="openRoom(room)"
              >
                <div class="flex items-center justify-between gap-4">
                  <div class="min-w-0">
                    <p class="text-[10px] text-slate-400 uppercase tracking-widest">출발 → 도착</p>
                    <p class="font-bold truncate">
                      {{ room.startPointName }} → {{ room.destPointName }}
                    </p>
                  </div>
                  <div class="text-right shrink-0">
                    <p class="text-[10px] text-slate-400 uppercase tracking-widest">출발 시간</p>
                    <p class="text-sm font-black">{{ formatTime(room.departureTime) }}</p>
                  </div>
                </div>

                <div class="flex items-center justify-between mt-4">
                  <span class="text-xs text-slate-400">인원</span>
                  <span class="text-xs font-bold text-slate-600">
                    {{ room.currentCapacity }} / {{ room.maxCapacity }}
                  </span>
                </div>
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  </div>
</template>
