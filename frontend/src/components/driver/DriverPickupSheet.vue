<script setup>
import { MapPin, Navigation, UserCircle2 } from 'lucide-vue-next'

defineProps({
  show: Boolean,
  passengerName: String,
  location: String,
})
defineEmits(['start-drive'])
</script>

<template>
  <Transition
    enter-active-class="transition-transform duration-350 ease-out"
    enter-from-class="translate-y-full"
    enter-to-class="translate-y-0"
    leave-active-class="transition-transform duration-250 ease-in"
    leave-from-class="translate-y-0"
    leave-to-class="translate-y-full"
  >
    <div
      v-if="show"
      class="absolute bottom-0 left-0 right-0 z-40 pb-safe"
    >
      <div class="bg-slate-950/95 backdrop-blur-2xl border-t border-white/10 rounded-t-3xl shadow-[0_-20px_60px_rgba(0,0,0,0.5)] px-5 pt-3 pb-5">

        <!-- handle -->
        <div class="flex justify-center mb-4">
          <div class="w-10 h-1 bg-white/20 rounded-full"></div>
        </div>

        <!-- label -->
        <p class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">탑승 정보</p>

        <!-- passenger info -->
        <div class="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 mb-4">
          <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0">
            <UserCircle2 class="w-5 h-5 text-white" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-white font-bold text-sm leading-tight">{{ passengerName }}</p>
            <div class="flex items-center gap-1.5 mt-0.5">
              <MapPin class="w-3 h-3 text-emerald-400 shrink-0" />
              <p class="text-slate-400 text-xs truncate">{{ location }}</p>
            </div>
          </div>
        </div>

        <!-- start button -->
        <button
          @click="$emit('start-drive')"
          class="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black text-base rounded-2xl flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] shadow-xl shadow-indigo-500/30"
        >
          <Navigation class="w-5 h-5" />
          경로 안내 시작
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
