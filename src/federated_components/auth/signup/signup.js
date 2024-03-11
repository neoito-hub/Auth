import React from 'react'
import { useFederatedComponent } from '@appblocks/js-sdk'

const SignUp = (props) => {
  const system = {
    url: process.env.BB_AUTH_ELEMENTS_URL,
    scope: 'remotes',
    module: './auth_fe_signup',
  }
  const { Component: FederatedComponent, errorLoading } = useFederatedComponent(
    system?.url,
    system?.scope,
    system?.module,
    React
  )

  return (
    <>
      <React.Suspense fallback={''}>
        {errorLoading
          ? `Error loading module "${module}"`
          : FederatedComponent && <FederatedComponent {...props} />}
      </React.Suspense>
    </>
  )
}

export default SignUp
