import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Auth0Provider } from "@auth0/auth0-react";
import { AuthMetaProvider } from "./context/AuthMetaContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Auth0Provider
      domain="dev-oywmbfaftloq7rl1.us.auth0.com"
      clientId="dpvm0hpIHYozwvJql25dkQ7ZCUrKxxZO" // Changed to match backend .env
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: "https://dev-oywmbfaftloq7rl1.us.auth0.com/api/v2/", // Use our backend API identifier
      }}
    >
      <ThemeProvider>
        <AuthMetaProvider>
          <App />
        </AuthMetaProvider>
      </ThemeProvider>
    </Auth0Provider>
  </StrictMode>
);
