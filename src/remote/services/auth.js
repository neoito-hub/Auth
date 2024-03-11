// import { APP_ENTRYPOINT } from '@/config/config';
import { request } from './request'

const APP_ENTRYPOINT = process.env.BB_AUTH_FUNCTION_URL

const verifyOtp = async (values) => {
  const response = await request.post(`${APP_ENTRYPOINT}/auth_be_verify_otp`, values)
  return response
}

const resendEmailOtp = async (values) => {
  const response = await request.post(`${APP_ENTRYPOINT}/auth_be_resend_email_otp`, values)
  return response
}

const auth = {
  verifyOtp,
  resendEmailOtp,
}

export default auth
