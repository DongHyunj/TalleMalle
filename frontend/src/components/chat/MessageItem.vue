<script setup>
/**
 * ==============================================================================
 * 1. CONFIG & PROPS (설정 및 Props/Emits 정의)
 * ==============================================================================
 */
// Props 정의
const props = defineProps({
  msg: {
    type: Object,
    required: true,
  },
})

// Emits 정의
defineEmits([])
</script>

<template>
  <!-- 
      Case 1: 날짜 표시줄 (Today, Yesterday 등) 
      - v-if="msg.type === 'date'" 일 때만 보입니다.
      - 화면 가운데 정렬(flex justify-center)
    -->
  <div v-if="msg.type === 'date'" class="flex justify-center">
    <span
      class="text-[10px] font-bold text-slate-300 bg-slate-100 px-3 py-1 rounded-full uppercase"
    >
      {{ msg.text }}
    </span>
  </div>

  <!-- 
      Case 2: 시스템 알림 메시지 (입장/퇴장 등)
      - v-else-if="msg.type === 'system'"
      - 연한 보라색 배경 박스로 디자인됨
    -->
  <div v-else-if="msg.type === 'system'" class="flex justify-center">
    <div class="bg-indigo-50/50 px-4 py-2 rounded-2xl border border-indigo-100/50">
      <p class="text-[11px] text-indigo-400 font-medium">{{ msg.text }}</p>
    </div>
  </div>

  <!-- [NEW] 이미지 메시지 (내가 보낸 것 or isMe 플래그) -->
  <div
    v-else-if="msg.type === 'image' && (msg.type === 'me' || msg.isMe)"
    class="flex items-end gap-3 justify-end"
  >
    <span class="text-[10px] text-slate-300 mb-1">{{ msg.time }}</span>
    <div class="flex flex-col gap-1 max-w-[70%] items-end">
      <!-- 이미지 컨테이너 -->
      <div class="bg-indigo-600 p-1.5 rounded-xl shadow-md overflow-hidden">
        <img :src="msg.text" alt="sent image" class="rounded-lg max-w-full max-h-60 object-cover" />
      </div>
    </div>
  </div>

  <!-- [NEW] 이미지 메시지 (상대방) -->
  <div v-else-if="msg.type === 'image'" class="flex items-end gap-3">
    <div
      class="w-8 h-8 rounded-full bg-slate-200 overflow-hidden shrink-0 shadow-sm"
    >
      <img :src="msg.user?.img || msg.avatar" alt="user" class="w-full h-full object-cover" />
    </div>
    <div class="flex flex-col gap-1 max-w-[70%]">
      <span class="text-[10px] text-slate-400 ml-1">{{ msg.user?.name || msg.sender }}</span>
      <div class="bg-white p-1.5 border border-slate-100 rounded-xl shadow-sm overflow-hidden">
        <img
          :src="msg.text"
          alt="received image"
          class="rounded-lg max-w-full max-h-60 object-cover"
        />
      </div>
    </div>
    <span class="text-[10px] text-slate-300 mb-1">{{ msg.time }}</span>
  </div>

  <!-- 
      Case 3: 상대방이 보낸 메시지
      - 프로필 사진 + 이름 + 흰색 말풍선 조합
      - 왼쪽 정렬 (기본값)
    -->
  <div v-else-if="msg.type === 'other'" class="flex items-end gap-3">
    <!-- 프로필 사진 (클릭 가능) -->
    <!-- hover:scale-105: 마우스를 올리면 살짝 커지는 애니메이션 -->
    <div
      class="w-8 h-8 rounded-full bg-slate-200 overflow-hidden shrink-0 shadow-sm"
    >
      <!-- 이미지가 없으면 엑박 대신 빈 공간이 나오도록 처리 -->
      <img :src="msg.user?.img || msg.avatar" alt="user" class="w-full h-full object-cover" />
    </div>

    <!-- 이름 + 말풍선 -->
    <div class="flex flex-col gap-1 max-w-[70%]">
      <!-- 보낸 사람 이름 -->
      <span class="text-[10px] text-slate-400 ml-1">{{ msg.user?.name || msg.sender }}</span>

      <!-- 흰색 말풍선 -->
      <!-- 
               rounded-tr-2xl ... : 말풍선 꼬리 모양을 만들기 위해 모서리 둥글기를 다르게 설정 
               whitespace-pre-wrap: 줄바꿈 문자를 그대로 화면에 반영
            -->
      <div
        class="bg-white border border-slate-100 p-3.5 text-sm leading-relaxed shadow-sm rounded-tr-2xl rounded-bl-2xl rounded-br-2xl text-slate-800 break-words whitespace-pre-wrap"
      >
        {{ msg.text }}
      </div>
    </div>

    <!-- 보낸 시간 (오후 2:30) -->
    <span class="text-[10px] text-slate-300 mb-1">{{ msg.time }}</span>
  </div>

  <!-- 
      Case 4: 내가 보낸 메시지
      - 보라색 말풍선
      - 오른쪽 정렬 (justify-end)
      - 프로필 사진 없음
    -->
  <div v-else-if="msg.type === 'me'" class="flex items-end gap-3 justify-end">
    <!-- 보낸 시간 (말풍선 왼쪽에 위치) -->
    <span class="text-[10px] text-slate-300 mb-1">{{ msg.time }}</span>

    <div class="flex flex-col gap-1 max-w-[70%] items-end">
      <!-- 보라색 말풍선 (Text White) -->
      <div
        class="bg-indigo-600 text-white p-3.5 text-sm leading-relaxed shadow-lg shadow-indigo-100 rounded-tl-2xl rounded-tr-xl rounded-bl-2xl rounded-br-sm break-words whitespace-pre-wrap"
      >
        {{ msg.text }}
      </div>
    </div>
  </div>
</template>
