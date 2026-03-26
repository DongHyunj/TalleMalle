import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useDriverStore } from '@/stores/driver'
import { useRecruitStore } from '@/stores/recruit'
import userApi from '@/api/user'
import profileApi from '@/api/profile/index.js'
import Main from '@/views/service/Main.vue'
import Login from '@/views/user/Login.vue'
import SocialLoginSuccess from '@/views/user/SocialLoginSuccess.vue'
import Signup from '@/views/user/Signup.vue'
import SignupExtraInfo from '@/views/user/SignupExtraInfo.vue'
import EmailWait from '@/views/user/EmailWait.vue'
import EmailVerifySuccess from '@/views/user/EmailVerifySuccess.vue'
import Chat from '@/views/service/Chat.vue'
import ChatList from '@/views/service/ChatList.vue'
import MyPage from '@/views/profile/MyPage.vue'
import FindPassword from '@/views/user/FindPassword.vue'
import ResetPassword from '@/views/user/ResetPassword.vue'
import Setting from '@/views/info/Setting.vue'
import ChangePassword from '@/views/user/ChangePassword.vue'
import BlockList from '@/views/info/BlockList.vue'
import Notice from '@/views/notice/Notice.vue'
import NoticeDetail from '@/views/notice/NoticeDetail.vue'
import NoticeWrite from '@/views/notice/NoticeWrite.vue'
import Notification from '@/views/info/Notification.vue'
import Terms from '@/views/info/Terms.vue'
import Privacy from '@/views/info/Privacy.vue'
import DriverLogin from '@/views/driver/DriverLogin.vue'
import DriverSignup from '@/views/driver/DriverSignup.vue'
import DriverPage from '@/views/driver/DriverPage.vue'
import DriverCallList from '@/views/driver/DriverCallList.vue'
import DriverCallDetail from '@/views/driver/DriverCallDetail.vue'
import DriverCallHistory from '@/views/driver/DriverCallHistory.vue'
import DriverSettlement from '@/views/driver/DriverSettlement.vue'
import SafeNumberSetting from '@/views/info/SafeNumberSetting.vue'
import PaymentApprove from '@/views/payment/PaymentApprove.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 메인 페이지
    { path: '/', alias: '/main', name: 'main', component: Main, meta: { requiresAuth: true } },

    // 회원가입, 로그인 및 인증
    { path: '/login', name: 'login', component: Login, meta: { hideNavbar: true } },
    { path: '/signup', name: 'signup', component: Signup, meta: { hideNavbar: true } },
    { path: '/email-wait', name: 'emailWait', component: EmailWait, meta: { hideNavbar: true } },
    { path: '/email/verify-success', name: 'emailVerifySuccess', component: EmailVerifySuccess, meta: { hideNavbar: true } },
    { path: '/signup/extra', name: 'signupExtraInfo', component: SignupExtraInfo, meta: { hideNavbar: true } },
    { path: '/social/success', name: 'SocialLoginSuccess', component: SocialLoginSuccess, meta: { hideNavbar: true } },
    { path: '/findpassword', name: 'findpassword', component: FindPassword, meta: { hideNavbar: true } },
    { path: '/resetpassword', name: 'resetpassword', component: ResetPassword, meta: { hideNavbar: true } },
    { path: '/changepassword', name: 'changepassword', component: ChangePassword, meta: { requiresAuth: true } },

    // 채팅
    { path: '/chat', name: 'chatList', component: ChatList, meta: { requiresAuth: true, requiresActiveStatus: true } },
    { path: '/chat/:id', name: 'chat', component: Chat, meta: { requiresAuth: true, requiresActiveStatus: true } },

    // 마이페이지 및 결제
    { path: '/mypage', name: 'mypage', component: MyPage, meta: { requiresAuth: true } },
    { path: '/payment/approve', name: 'paymentApprove', component: PaymentApprove, meta: { requiresAuth: true } },

    // 공지사항
    { path: '/notice', name: 'notice', component: Notice, meta: { requiresAuth: true } },
    { path: '/notice/write', name: 'noticeWrite', component: NoticeWrite, meta: { requiresAuth: true, isEdit: false } },
    { path: '/notice/edit/:idx', name: 'noticeEdit', component: NoticeWrite, meta: { requiresAuth: true, isEdit: true } },
    { path: '/noticedetail/:idx', name: 'noticedetail', component: NoticeDetail, meta: { requiresAuth: true } },

    // 알림 페이지
    { path: '/notification', name: 'notification', component: Notification, meta: { requiresAuth: true } },

    // 설정 페이지
    { path: '/setting', name: 'setting', component: Setting, meta: { requiresAuth: true } },
    { path: '/blocklist', name: 'blocklist', component: BlockList, meta: { requiresAuth: true } },
    { path: '/safenumber', name: 'safenumber', component: SafeNumberSetting, meta: { requiresAuth: true } },
    { path: '/terms', name: 'terms', component: Terms, meta: { requiresAuth: true } },
    { path: '/privacy', name: 'privacy', component: Privacy, meta: { requiresAuth: true } },

    // 드라이버
    { path: '/driverlogin', name: 'driverlogin', component: DriverLogin, meta: { hideDriverNavbar: true } },
    { path: '/driversignup', name: 'driversignup', component: DriverSignup, meta: { hideDriverNavbar: true } },
    { path: '/driverpage', name: 'driverpage', component: DriverPage, meta: { hideDriverNavbar: false, requiresDriver: true } },
    { path: '/driver/calls', name: 'driverCallList', component: DriverCallList, meta: { hideDriverNavbar: false, requiresDriver: true } },
    { path: '/driver/call/:id', name: 'driverCallDetail', component: DriverCallDetail, meta: { hideDriverNavbar: false, requiresDriver: true } },
    { path: '/driver/history', name: 'driverCallHistory', component: DriverCallHistory, meta: { hideDriverNavbar: false, requiresDriver: true } },
    { path: '/driver/settlement/:callIdx', name: 'driverSettlement', component: DriverSettlement, meta: { hideDriverNavbar: true, requiresDriver: true } },

    // 잘못된 주소로 접속하면 다른 페이지로 리다이렉트 아래 둘 중 하나 선택
    // 1. 메인으로 가게 처리
    // { path: '/:pathMatch(.*)*', redirect: '' },
    // 2. 에러 페이지로 이동
    {
      path: '/:pathMatch(.*)*',
      component: {
        template: '<div></div>',
        setup() {
          throw new Error('존재하지 않는 페이지입니다. 주소를 확인해주세요.')
        },
      },
    },
  ],
})

// 네비게이션 가드
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const driverStore = useDriverStore()
  const recruitStore = useRecruitStore()

  // 드라이버 전용 라우트: 승객용 /profile/me 를 호출하지 않음 (드라이버 JWT면 401 → 인증 복구 실패)
  if (to.meta.requiresDriver) {
    if (!driverStore.driver) {
      alert('드라이버 로그인이 필요한 서비스입니다.')
      return next('/driverlogin')
    }
    return next()
  }

  // 1. 인증 복구 로직 (새로고침 대응) — 일반 회원(승객) 라우트만
  if (!authStore.user && to.meta.requiresAuth) {
    try {
      const res = await userApi.getMe()
      const profileRes = await profileApi.profile()
      if (res.data) {
        authStore.login(res.data)
        authStore.updateUser(profileRes.data.result)
        // console.log('새로고침 시 authStore 유저정보', authStore.user)
      }
    } catch (error) {
      // console.error('인증 복구 실패:', error)
      // 드라이버만 로그인된 상태에서는 ATOKEN이 드라이버용이라 /me 가 401 → 전체 로그아웃하면 안 됨
      if (!driverStore.driver) {
        authStore.logout()
      }
    }
  }

  if (to.meta.requiresAuth && !authStore.user) {
    alert('로그인이 필요한 서비스입니다.')
    return next('/login')
  }

  return next()
})

export default router
