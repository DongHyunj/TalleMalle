/**
 * ==============================================================================
 * 1. IMPORTS
 * ==============================================================================
 */
import { ref, onUnmounted } from 'vue'
import { Client } from '@stomp/stompjs'

/**
 * ==============================================================================
 * 2. GLOBAL STATE (싱글톤: 앱 전체에서 소켓 상태 공유)
 * ==============================================================================
 */
const stompClient = ref(null)
const isConnected = ref(false)

/**
 * ==============================================================================
 * 3. COMPOSABLE DEFINITION
 * ==============================================================================
 */
export function useWebSocket() {

    /**
     * ==============================================================================
     * 4. METHODS - SOCKET LOGIC
     * ==============================================================================
     */
    // 소켓 연결 함수
    const connect = (brokerUrl, onMessageCallback, userIdx) => {
        // 이미 연결되어 있다면 패스
        if (stompClient.value && stompClient.value.connected) {
            return
        }

        stompClient.value = new Client({
            brokerURL: brokerUrl,
            reconnectDelay: 3000,
            heartbeatIncoming: 10000,
            heartbeatOutgoing: 10000,

            onConnect: () => {
                // console.log(`✅ STOMP Connected : ${brokerUrl}`)
                isConnected.value = true


                // 연결되면 all-calls topic으로 구독
                stompClient.value.subscribe('/topic/all-calls', (message) => {
                    if (onMessageCallback) {
                        // // 백엔드에서 날아온 순수 DTO를 파싱
                        // const receivedDto = JSON.parse(message.body)

                        // const formattedData = {
                        //     type: 'newRecruit',
                        //     payload: receivedDto
                        // }
                        // onMessageCallback({ data: JSON.stringify(formattedData) })
                        onMessageCallback({ data: message.body })
                    }
                })

                // 기사님 전용 모집 완료 방송국 구독 
                stompClient.value.subscribe('/topic/complete', (message) => {
                    if (onMessageCallback) {
                        onMessageCallback({ data: JSON.stringify({ type: 'recruitFull', payload: message.body }) })
                    }
                })

                if (userIdx) {
                    stompClient.value.subscribe(`/topic/user/${userIdx}/notifications`, (message) => {
                        const payload = JSON.parse(message.body)

                        // PUSH_NOTIFICATION 타입인지 확인
                        if (payload.type === 'PUSH_NOTIFICATION' && onMessageCallback) {
                            // console.log('🔔 새로운 개인 알림 도착:', payload)

                            // UI 처리를 위해 컴포넌트로 데이터 전달
                            const formattedData = {
                                type: 'personalNotification',
                                payload: payload,
                            }
                            onMessageCallback({ data: JSON.stringify(formattedData) })
                        }
                    })
                }
            },
            // 에러 발생 시
            onWebSocketError: (error) => {
                // console.error("❌ WebSocket Error : ", error)
                isConnected.value = false
            },

            // STOMP 프로토콜 에러 발생 시
            onStompError: (frame) => {
                // console.error('❌ STOMP Error : ', frame.headers['message'])
                isConnected.value = false
            },

            // 연결 종료 시
            onWebSocketClose: () => {
                // console.log("⚠️ STOMP disConnected")
                isConnected.value = false
            }
        })

        stompClient.value.activate();

    }

    // 메시지 전송 함수
    const sendMessage = (destination, data) => {
        if (stompClient.value && stompClient.value.connected) {
            stompClient.value.publish({
                destination: destination,
                body: JSON.stringify(data)
            })
        } else {
            // console.warn("🚫 STOMP가 연결되지 않아 메시지를 보낼 수 없습니다.")
        }
    }

    // 연결 해제 함수
    const disconnect = () => {
        if (stompClient.value) {
            stompClient.value.deactivate() // STOMP 안전 종료
            stompClient.value = null
        }
        isConnected.value = false
    }
    /**
     * ==============================================================================
     * 6. RETURN
     * ==============================================================================
     */
    return {
        isConnected,
        connect,
        sendMessage,
        disconnect
    }
}
