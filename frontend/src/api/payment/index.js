import api from '@/plugins/axiosinterceptor'

const key = async () => {
  return await api.get('/payment/key', { withCredentials: true })
}

const defaultBilling = async (billingIdx) => {
  return await api.patch(
    '/payment/default-billing',
    {},
    {
      params: { billingIdx },
      withCredentials: true,
    },
  )
}

const enroll = async (customerKey, authKey) => {
  return await api.get('/payment/enroll', {
    params: { customerKey, authKey },
    withCredentials: true,
  })
}

const revoke = async (billingIdx) => {
  return await api.delete(`/payment/billing/${billingIdx}`,{ withCredentials: true })
}

const list = async () => {
  return await api.get('/payment/billing', { withCredentials: true })
}

export default {
  key,
  list,
  enroll,
  revoke,
  defaultBilling
}
