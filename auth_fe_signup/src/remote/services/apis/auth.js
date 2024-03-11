import { request } from '../request'

const APP_ENTRYPOINT = process.env.BB_AUTH_FUNCTION_URL

const register = async (values) => {
  const response = await request.post(`${APP_ENTRYPOINT}/auth_be_signup`, values)
  return response
}

const auth = {
  register,
}

export default auth
