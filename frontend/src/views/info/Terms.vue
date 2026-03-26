<script setup>
import { useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
const router = useRouter()
</script>

<template>
    <div class="h-full flex items-center justify-center p-4">
        <div
            class="w-full max-w-3xl h-[90vh] glass-panel rounded-[2.5rem] overflow-hidden flex flex-col bg-white border border-slate-100 shadow-2xl">
            <div class="p-6 md:p-8 border-b border-slate-100 flex items-center gap-4 bg-white sticky top-0 z-10">
                <button @click="router.back()" class="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <ArrowLeft class="w-6 h-6 text-slate-600" />
                </button>
                <div>
                    <h1 class="text-xl font-extrabold text-slate-900">이용약관</h1>
                    <p class="text-xs text-slate-400 font-medium">시행일자: 2024년 03월 25일</p>
                </div>
            </div>

            <div
                class="flex-1 overflow-y-auto custom-scroll p-6 md:p-10 space-y-8 text-sm leading-relaxed text-slate-600">
                <section>
                    <h2 class="text-base font-bold text-slate-900 mb-2">제 1 조 (목적)</h2>
                    <p>본 약관은 '탈래말래'(이하 '회사')가 제공하는 동승 매칭 서비스 및 관련 제반 서비스의 이용과 관련하여 회사와 회원과의 권리, 의무 및 책임사항을 규정함을 목적으로
                        합니다.</p>
                </section>

                <section>
                    <h2 class="text-base font-bold text-slate-900 mb-2">제 2 조 (용어의 정의)</h2>
                    <p>1. '서비스'라 함은 회사가 스마트폰 등 이동단말기를 통하여 제공하는 동승 매칭 플랫폼 서비스를 의미합니다.<br>
                        2. '회원'이라 함은 회사의 서비스에 접속하여 본 약관에 따라 회사와 이용계약을 체결하고 서비스를 이용하는 고객을 말합니다.</p>
                </section>

                <section>
                    <h2 class="text-base font-bold text-slate-900 mb-2">제 3 조 (서비스의 제공)</h2>
                    <p>회사는 동승 매칭, 커뮤니티, 위치 기반 서비스를 제공하며, 서비스 품질 향상을 위해 내용을 변경할 수 있습니다.</p>
                </section>

            </div>

            <div class="p-6 border-t border-slate-100 bg-slate-50 flex justify-center">
                <button @click="router.back()"
                    class="px-10 py-3.5 bg-slate-900 text-white rounded-2xl font-bold hover:bg-indigo-600 transition-all shadow-lg">확인했습니다</button>
            </div>
        </div>
    </div>
</template>