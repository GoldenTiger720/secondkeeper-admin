import axios from "axios";

// Create an axios instance with base configuration
const apiClient = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL || "https://api.secondkeeper.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

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
        const response = await apiClient.post("/auth/token/refresh/", {
          refresh_token: refreshToken,
        });
        const { access } = response.data.tokens;
        localStorage.setItem("secondkeeper_access_token", access);
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error("Error refreshing token:", error);
        localStorage.removeItem("secondkeeper_token");
        localStorage.removeItem("secondkeeper_access_token");
        localStorage.removeItem("safeguard_user");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
