// API Configuration for different environments
// const config = {
//   development: {
//     API_BASE_URL: "http://localhost:5000",
//   },
//   production: {
//     API_BASE_URL:
//       import.meta.env.VITE_API_BASE_URL ||
//       "https://job-gujarat-backend.onrender.com",
//   },
// };

const config = {
  API_BASE_URL:
    import.meta.env.VITE_API_BASE_URL ||
    "https://job-gujarat-backend.onrender.com",
};
const environment = import.meta.env.MODE || "development";
export const API_BASE_URL = config.API_BASE_URL;

console.log(`Running in ${environment} mode, API URL: ${API_BASE_URL}`);

// You can use this in your components like:
// import { API_BASE_URL } from '@/config/api'
// const response = await fetch(`${API_BASE_URL}/api/jobs`)
