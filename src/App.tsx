import { useEffect } from 'react'
import { logger } from './lib/logger'
import './App.css'
import { CcGearLayout } from './components/ccgear'
import { ThemeProvider } from './components/ThemeProvider'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Toaster } from './components/ui/sonner'

function App() {
  useEffect(() => {
    logger.info('ccGear application starting up')
    logger.info('App environment', {
      isDev: import.meta.env.DEV,
      mode: import.meta.env.MODE,
    })
  }, [])

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <CcGearLayout />
        <Toaster />
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
