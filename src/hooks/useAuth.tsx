import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
  useCallback,
} from "react";
import { authService } from "@/lib/api/authService";
import { setTokenExpiryHandler } from "@/lib/api/axiosConfig";
import { toast } from "@/hooks/use-toast";
import { useNavigate, useLocation } from "react-router-dom";

// Updated User interface to match the API response structure
interface User {
  id: string;
  username: string;
  email: string;
  full_name?: string;
  phone_number?: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: (showMessage?: boolean) => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  // Auto logout handler for token expiry
  const handleAutoLogout = useCallback(async () => {
    console.log("Handling automatic logout due to token expiry");

    // Clear user state immediately
    setUser(null);
    setIsAuthenticated(false);

    // Clear auth service state
    authService.logout();

    // Show notification (only if not already on login page)
    if (window.location.pathname !== "/login") {
      toast({
        title: "Session Expired",
        description:
          "You have been automatically logged out. Please log in again.",
        variant: "destructive",
      });
    }

    // Redirect to login page
    window.location.href = "/login";
  }, []);

  // Set up token expiry handler on component mount
  useEffect(() => {
    setTokenExpiryHandler(handleAutoLogout);

    // Cleanup on unmount
    return () => {
      setTokenExpiryHandler(() => {});
    };
  }, [handleAutoLogout]);

  // Use useCallback to memoize the checkAuth function
  const checkAuth = useCallback(async () => {
    try {
      if (authService.isAuthenticated()) {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);
          return true;
        }
      }
      setIsAuthenticated(false);
      return false;
    } catch (error) {
      console.error("Auth check error:", error);
      setIsAuthenticated(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials: {
    email: string;
    password: string;
  }): Promise<void> => {
    try {
      await authService.login(credentials);
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
      }
    } catch (error) {
      // If login fails during signup process, handle gracefully
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async (showMessage: boolean = true) => {
    try {
      authService.logout();
      setUser(null);
      setIsAuthenticated(false);

      if (showMessage) {
        toast({
          title: "Logged Out",
          description: "You have been successfully logged out.",
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Check for token expiry periodically (every 5 minutes)
  useEffect(() => {
    const checkTokenValidity = () => {
      const token = localStorage.getItem("secondkeeper_access_token");
      if (token && isAuthenticated) {
        try {
          // Basic token structure validation
          const payload = JSON.parse(atob(token.split(".")[1]));
          const currentTime = Date.now() / 1000;

          // If token expires in the next 5 minutes, try to refresh
          if (payload.exp && payload.exp - currentTime < 300) {
            console.log("Token expiring soon, attempting refresh...");
            // The axios interceptor will handle the refresh automatically
          }
        } catch (error) {
          console.error("Error checking token validity:", error);
        }
      }
    };

    if (isAuthenticated) {
      const interval = setInterval(checkTokenValidity, 5 * 60 * 1000); // 5 minutes
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // useEffect to check auth state on component mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
