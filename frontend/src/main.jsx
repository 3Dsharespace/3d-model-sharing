import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { installProductionConsoleGuard } from './lib/productionConsole.js'

installProductionConsoleGuard()

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
