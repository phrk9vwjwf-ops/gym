import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { triggerBackupReminder } from '@/lib/pwaUtils'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// Check for backup reminder on app load
triggerBackupReminder()