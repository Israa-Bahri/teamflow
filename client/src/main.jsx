import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // enables routing for the whole app
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Anything inside BrowserRouter can use routes and links */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)