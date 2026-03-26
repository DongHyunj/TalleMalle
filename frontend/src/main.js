import '@/assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()

pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)

// .env.development 파일에서 키 가져오기
const kakaoKey = import.meta.env.VITE_KAKAO_MAP_KEY

// 스크립트 태그 동적 생성
const script = document.createElement('script')
script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoKey}&libraries=services&autoload=false`
script.async = true

// head에 붙이기 
document.head.appendChild(script)

// 스크립트 로드가 완료되면 실행
script.onload = () => {
    // 카카오 맵 SDK가 완전히 준비된 후 마운트
    window.kakao.maps.load(() => {
        app.mount('#app')
        // console.log("카카오맵 로드 완료")

    })
}
