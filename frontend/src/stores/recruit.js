/**
 * ==============================================================================
 * 1. IMPORTS
 * ==============================================================================
 */
import { defineStore } from "pinia";
import { ref } from "vue";

/**
 * ==============================================================================
 * 2. STORE DEFINITION
 * ==============================================================================
 */
export const useRecruitStore = defineStore('recruit', () => {

    /**
     * ==============================================================================
     * 3. STATE (상태 변수)
     * ==============================================================================
     */
    // 상태(State)
    const status = ref('IDLE')
    const recruitId = ref(null)

    // 채팅방용: 현재 참여/모집 중인 여정의 상세 정보
    // (JSON 불러오기 vs 모달 생성 -> 둘 다 여기에 저장되어 ChatView에서 사용됨)
    const currentRideInfo = ref(null)

    // 메인화면용: 전체 모집 리스트
    // (API 로드 + 내가 만든 모집글 통합 관리)
    const recruitList = ref([])

    /**
     * ==============================================================================
     * 4. ACTIONS (상태 변경 함수)
     * ==============================================================================
     */
    // 방장이 되었을 때
    const setOwner = (id) => {
        status.value = 'OWNER'
        recruitId.value = id
    }

    // 참여자가 되었을 때
    const setJoined = (id) => {
        status.value = 'JOINED'
        recruitId.value = id
    }

    // 방에서 나갔을 때 (초기화)
    const clear = () => {
        status.value = 'IDLE'
        recruitId.value = null
        currentRideInfo.value = null
    }

    // 여정 정보 저장 (ChatHeader 등에 표시될 내용)
    const setRideInfo = (info) => { currentRideInfo.value = info }

    // 전체 리스트 초기화 (API 로드 시 사용)
    const setRecruitList = (list) => { recruitList.value = list }

    // 리스트에 모집글 1개 추가 (모달 생성 or 소켓 수신 시 사용)
    const addRecruit = (recruit) => {
        if (!recruitList.value.find(r => r.id === recruit.id)) {
            recruitList.value.unshift(recruit)
        }
    }

    // 모집글 정보 업데이트 (참여 인원 변경 등)
    const updateRecruit = (updatedRecruit) => {
        const index = recruitList.value.findIndex(r => r.id === updatedRecruit.id)
        if (index !== -1) {
            recruitList.value[index] = updatedRecruit
        }
    }

    /**
     * ==============================================================================
     * 5. RETURN (외부 노출)
     * ==============================================================================
     */

    return {
        // State
        status, recruitId, currentRideInfo, recruitList,
        // Actions
        setOwner, setJoined, clear, setRideInfo, setRecruitList, addRecruit, updateRecruit
    }
})