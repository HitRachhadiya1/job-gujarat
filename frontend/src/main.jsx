import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Auth0Provider } from '@auth0/auth0-react';


createRoot(document.getElementById('root')).render(
  <Auth0Provider
    domain="dev-oywmbfaftloq7rl1.us.auth0.com"
    clientId="dpvm0hpIHYozwvJql25dkQ7ZCUrKxxZO"
    authorizationParams={{
      redirect_uri: window.location.origin,
      audience: "https://dev-oywmbfaftloq7rl1.us.auth0.com/api/v2/"
    }}
  >
    <App />
  </Auth0Provider>,
)
