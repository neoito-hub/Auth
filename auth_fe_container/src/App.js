import React from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { Outlet } from 'react-router-dom'

const App = () => {
  const handleError = (error, errorInfo) => {
    // handle error
    console.log(error, errorInfo)
  }

  return (
    <ErrorBoundary fallback={<ErrorFallback />} onError={handleError}>
      <div className='App' data-testid='app'>
        <Outlet />
      </div>
    </ErrorBoundary>
  )
}

// Provide a fallback UI for the ErrorBoundary component
function ErrorFallback() {
  return <div>Something went wrong.</div>
}

export default App
