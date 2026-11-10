import '@fontsource-variable/inter'
import '@fontsource-variable/manrope'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <App />
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3200,
              style: {
                borderRadius: 0,
                background: '#171717',
                color: '#ffffff',
                fontSize: '13px',
                padding: '12px 16px',
                maxWidth: '420px',
              },
              success: {
                iconTheme: { primary: '#287a50', secondary: '#ffffff' },
              },
              error: {
                iconTheme: { primary: '#d14343', secondary: '#ffffff' },
              },
            }}
          />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
