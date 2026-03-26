<script setup>
/**
 * ==============================================================================
 * 1. IMPORTS
 * ==============================================================================
 */
import { BellOff } from 'lucide-vue-next'
import NotificationItem from './NotificationItem.vue'

/**
 * ==============================================================================
 * 2. CONFIG & STORES
 * ==============================================================================
 */
defineProps({
    items: { type: Array, default: () => [] }
})

defineEmits(['readItem'])
</script>

<template>
    <div class="flex-1 overflow-y-auto custom-scroll p-10 pt-6">
        <div class="max-w-4xl mx-auto w-full space-y-3">

            <transition-group name="list">
                <NotificationItem v-for="item in items" :key="item.idx ?? item.id" :item="item" @read="$emit('readItem', $event)" />
            </transition-group>

            <div v-if="items.length === 0" class="py-20 flex flex-col items-center text-center animate-fade-in">
                <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
                    <BellOff class="w-8 h-8" />
                </div>
                <p class="text-slate-400 font-medium">새로운 알림이 없습니다.</p>
            </div>

        </div>
    </div>
</template>

<style scoped>
.list-enter-active,
.list-leave-active {
    transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
    opacity: 0;
    transform: translateY(10px);
}

.animate-fade-in {
    animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.custom-scroll::-webkit-scrollbar {
    width: 5px;
}

.custom-scroll::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 10px;
}
</style>