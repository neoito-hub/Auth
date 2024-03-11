import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import PrivateOutlet from './PrivateOutlet'

export const PageNotFound = () => {
  return <p>Page not Found </p>
}

const AppRoute = () => {
  const DashBoard = lazy(() => import('../federated_components/DashBoard.js'))

  return (
    <Suspense fallback={<>Loading ...</>}>
      <Routes>
        <Route element={<PrivateOutlet redirect={'/auth/login'} />}>
          <Route index element={<DashBoard />} exact />
          <Route path='/*' element={<PageNotFound />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default AppRoute
