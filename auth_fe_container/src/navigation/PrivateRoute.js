import React from 'react'
import { Navigate } from 'react-router-dom'
import { isLoggedIn } from '../helpers/utils'

const PrivateRoute = ({ children, redirect, ...props }) => {
  const auth = isLoggedIn()
  return auth ? <div {...props}>{children}</div> : <Navigate to={redirect} />
}

export default PrivateRoute
