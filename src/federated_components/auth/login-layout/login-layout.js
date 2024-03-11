import React from 'react'
import { useFederatedComponent } from '@appblocks/js-sdk'

const LoginLayout = (props) => {
  const system = {
    url: process.env.BB_AUTH_ELEMENTS_URL,
    scope: 'remotes',
    module: './auth_fe_login_layout',
  }

  const { Component: FederatedComponent, errorLoading } = useFederatedComponent(
    system?.url,
    system?.scope,
    system?.module,
    React
  )

  return (
    <>
      <h1>Login Layout</h1>
      <React.Suspense fallback={<div>Loading...</div>}>
        {errorLoading
          ? `Error loading module "${module}"`
          : FederatedComponent && <FederatedComponent {...props} />}
      </React.Suspense>
    </>
  )
}

export default LoginLayout
