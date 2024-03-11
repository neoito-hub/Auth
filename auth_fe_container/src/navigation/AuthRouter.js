import React, { lazy, Suspense } from 'react'
import { Routes, Route, Outlet } from 'react-router-dom'
import url_constants from './url_constants'

const {
  LOGIN,
  RESET_PASSWORD,
  VERIFY_EMAIL,
  FORGOT_PASSWORD,
  SIGNUP,
  VERIFY_OTP,
} = url_constants

function Dashboard() {
  return (
    <div>
      <Outlet />
    </div>
  )
}

function AuthRoutes() {
  const Login = lazy(() =>
    import('../federated_components/auth/login/login.js')
  )
  const ForgotPassword = lazy(() =>
    import('../federated_components/auth/forgot-password/forgot-password.js')
  )
  const VerifyOtp = lazy(() =>
    import('../federated_components/auth/verify-otp/verify-otp.js')
  )
  const ResetPassword = lazy(() =>
    import('../federated_components/auth/reset-password/reset-password.js')
  )
  const Signup = lazy(() =>
    import('../federated_components/auth/signup/signup.js')
  )
  const VerifyOtpEmail = lazy(() =>
    import('../federated_components/auth/verify-email/verify-email.js')
  )

  return (
    <Suspense fallback={<>Loading ...</>}>
      <Routes>
        <Route element={<Dashboard />}>
          <Route index element={<Login />} />
          <Route path={LOGIN} element={<Login />} />
          <Route exact path={FORGOT_PASSWORD} element={<ForgotPassword />} />
          <Route path={VERIFY_OTP} element={<VerifyOtp />} />
          <Route exact path={RESET_PASSWORD} element={<ResetPassword />} />
          <Route exact path={SIGNUP} element={<Signup />} />
          <Route path={VERIFY_EMAIL} element={<VerifyOtpEmail />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default AuthRoutes
