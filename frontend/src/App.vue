<script setup>
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import TheSidebar from './components/layout/Nav.vue'
import ErrorBoundary from './components/util/ErrorBoundary.vue'

const route = useRoute()

const isDriverMode = computed(() => route.path.startsWith('/driver'))
const showSidebar = computed(() => !route.meta.hideNavbar && !isDriverMode.value)
</script>

<template>
   <ErrorBoundary>
  <div class="h-screen w-screen overflow-hidden bg-slate-50 relative flex">
    <main class="flex-1 w-full h-full relative z-0">
      <RouterView v-slot="{ Component }">
        <component :is="Component" :key="$route.fullPath" />
      </RouterView>
    </main>

    <Transition name="slide-left">
      <div v-if="showSidebar" class="absolute left-4 top-4 bottom-4 z-50 hidden md:block">
        <TheSidebar />
      </div>
    </Transition>
  </div>
   </ErrorBoundary>
</template>

<style>
/* 왼쪽 슬라이드 애니메이션 */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
}

.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(-120%);
  opacity: 0;
}
</style>