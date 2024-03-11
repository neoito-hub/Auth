import * as React from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App'
import AuthRouter from './navigation/AuthRouter'
import AppRoute from './navigation/appRoute'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <AppRoute />,
      },
      {
        path: '/*',
        element: <AppRoute />,
      },
      {
        path: 'auth/*',
        element: <AuthRouter />,
      },
    ],
  },
])

const root = createRoot(document.getElementById('root'))
root.render(<RouterProvider router={router} />)
