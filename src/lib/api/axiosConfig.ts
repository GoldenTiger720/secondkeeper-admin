import axios from "axios";
import { toast } from "@/hooks/use-toast";

// Create an axios instance with base configuration
const apiClient = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL || "https://api.secondkeeper.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Token expiry handler - will be set from useAuth hook
let handleTokenExpiry: (() => void) | null = null;

// Function to set the token expiry handler
export const setTokenExpiryHandler = (handler: () => void) => {
  handleTokenExpiry = handler;
};

// Add a request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("secondkeeper_access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle authentication errors
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("secondkeeper_token");

        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        const response = await apiClient.post("/auth/token/refresh/", {
          refresh_token: refreshToken,
        });

        const { access } = response.data.tokens;
        localStorage.setItem("secondkeeper_access_token", access);
        originalRequest.headers.Authorization = `Bearer ${access}`;

        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);

        // Clear all stored tokens
        localStorage.removeItem("secondkeeper_token");
        localStorage.removeItem("secondkeeper_access_token");
        localStorage.removeItem("safeguard_user");

        // Show user-friendly message
        toast({
          title: "Session Expired",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
        });

        // Use the token expiry handler if available (from useAuth)
        if (handleTokenExpiry) {
          handleTokenExpiry();
        } else {
          // Fallback to direct redirect
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
