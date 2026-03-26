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
                    <h1 class="text-xl font-extrabold text-slate-900">개인정보 처리방침</h1>
                    <p class="text-xs text-slate-400 font-medium">시행일자: 2024년 03월 25일</p>
                </div>
            </div>

            <div
                class="flex-1 overflow-y-auto custom-scroll p-6 md:p-10 space-y-8 text-sm leading-relaxed text-slate-600">
                <section>
                    <h2 class="text-base font-bold text-slate-900 mb-2">제 1 조 (수집하는 개인정보 항목)</h2>
                    <p>회사는 회원가입, 원활한 고객상담, 각종 서비스의 제공을 위해 이메일 주소, 닉네임, 프로필 사진, 실시간 위치 정보를 수집합니다.</p>
                </section>

                <section>
                    <h2 class="text-base font-bold text-slate-900 mb-2">제 2 조 (개인정보의 이용목적)</h2>
                    <p>수집한 정보는 서비스 제공에 따른 요금 정산, 회원 관리, 마케팅 및 광고(동의 시)에 활용됩니다.</p>
                </section>

                <section>
                    <h2 class="text-base font-bold text-slate-900 mb-2">제 3 조 (보유 및 이용기간)</h2>
                    <p>원칙적으로 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 단, 관계법령에 의해 보존할 필요가 있는 경우 법령에서 정한 기간 동안 보관합니다.
                    </p>
                </section>

                <div class="bg-indigo-50 p-4 rounded-xl font-bold text-indigo-700">
                    담당부서: 서비스 운영팀 (contact@tallemalle.com)
                </div>
            </div>

            <div class="p-6 border-t border-slate-100 bg-slate-50 flex justify-center">
                <button @click="router.back()"
                    class="px-10 py-3.5 bg-slate-900 text-white rounded-2xl font-bold hover:bg-indigo-600 transition-all shadow-lg">확인했습니다</button>
            </div>
        </div>
    </div>
</template>