import { useState, useEffect, Suspense, lazy } from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Camera,
  CreditCard,
  Bell,
  MessageSquare,
  Check,
  Database,
  Settings,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useAdminData } from "@/contexts/AdminDataContext";
import { usePersistChanges } from "@/hooks/usePersistChanges";
import apiClient from "@/lib/api/axiosConfig";
import { toast } from "@/hooks/use-toast";

// Lazy load components for better performance
const AdminUsersOptimized = lazy(() => import("@/components/admin/AdminUsers"));
const AdminCamerasOptimized = lazy(
  () => import("@/components/admin/AdminCameras")
);
const AdminSubscriptions = lazy(
  () => import("@/components/admin/AdminSubscriptions")
);
const AdminAlerts = lazy(() => import("@/components/admin/AdminAlerts"));
const AdminWhatsApp = lazy(() => import("@/components/admin/AdminWhatsApp"));
const AdminVerification = lazy(
  () => import("@/components/admin/AdminVerification")
);
const AdminTraining = lazy(() => import("@/components/admin/AdminTraining"));
const AdminSettings = lazy(() => import("@/components/admin/AdminSettings"));
const AddRole = lazy(() => import("@/components/admin/AddRole"));

interface UserPermissions {
  can_add_roles: boolean;
  can_manage_users: boolean;
  role: string;
  is_admin: boolean;
  is_manager: boolean;
  is_reviewer: boolean;
}

const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-10">
    <div className="animate-spin h-8 w-8 border-2 border-primary rounded-full border-t-transparent"></div>
  </div>
);

const Admin = () => {
  const { user } = useAuth();
  const { isLoading: dataLoading, error } = useAdminData();
  const { syncToBackend } = usePersistChanges();
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(true);

  // Calculate alert count from the cached data
  // const alertCount =
  //   alerts?.filter(
  //     (alert) => alert.status === "new" || alert.status === "pending"
  //   )?.length || 0;

  useEffect(() => {
    fetchUserPermissions();

    // Auto-sync changes periodically
    const syncInterval = setInterval(() => {
      syncToBackend();
    }, 60000); // Sync every minute

    return () => clearInterval(syncInterval);
  }, [syncToBackend]);

  const fetchUserPermissions = async () => {
    try {
      const response = await apiClient.get("/admin/users/user_permissions/");
      if (response.data && response.data.success) {
        setPermissions(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching user permissions:", error);
      toast({
        title: "Error",
        description: "Failed to load user permissions.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingPermissions(false);
    }
  };

  const getMenuItems = () => {
    if (!permissions) return [];

    const baseItems = [];

    // Items available to managers and admins
    if (permissions.can_manage_users) {
      baseItems.push({
        path: "/users",
        label: "Users",
        icon: <Users className="mr-2 h-5 w-5" />,
        badge: null,
      });

      baseItems.push({
        path: "/cameras",
        label: "Cameras",
        icon: <Camera className="mr-2 h-5 w-5" />,
        badge: null,
      });
    }

    // Admin-only items
    if (permissions.is_admin) {
      baseItems.push(
        {
          path: "/add-role",
          label: "Add Role",
          icon: <UserPlus className="mr-2 h-5 w-5" />,
          badge: null,
        },
        {
          path: "/subscriptions",
          label: "Subscriptions",
          icon: <CreditCard className="mr-2 h-5 w-5" />,
          badge: null,
        },
        {
          path: "/settings",
          label: "Settings",
          icon: <Settings className="mr-2 h-5 w-5" />,
          badge: null,
        }
      );
    }

    // Items available to all authenticated users
    baseItems.push(
      {
        path: "/alerts",
        label: "Alerts",
        icon: <Bell className="mr-2 h-5 w-5" />,
        // badge: alertCount > 0 ? alertCount : null,
      },
      {
        path: "/whatsapp",
        label: "WhatsApp",
        icon: <MessageSquare className="mr-2 h-5 w-5" />,
        badge: null,
      },
      {
        path: "/verification",
        label: "Verification",
        icon: <Check className="mr-2 h-5 w-5" />,
        badge: null,
      },
      {
        path: "/training",
        label: "Training Data",
        icon: <Database className="mr-2 h-5 w-5" />,
        badge: null,
      }
    );

    return baseItems;
  };

  const AdminNav = () => {
    const menuItems = getMenuItems();

    return (
      <nav className="flex flex-col p-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )
            }
          >
            <div className="flex items-center">
              {item.icon}
              {item.label}
            </div>
            {item.badge && (
              <Badge variant="secondary" className="ml-auto">
                {item.badge}
              </Badge>
            )}
          </NavLink>
        ))}
      </nav>
    );
  };

  if (isLoadingPermissions || dataLoading) {
    return (
      <DashboardLayout>
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Error Loading Data</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Retry
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!permissions) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
            <p className="text-muted-foreground">
              You don't have permission to access this area.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background">
        <div className="container py-6 grid grid-cols-12 gap-6">
          {/* Desktop sidebar */}
          <Card className="col-span-12 lg:col-span-3 h-fit hidden lg:block">
            <CardContent className="p-0">
              <AdminNav />
            </CardContent>
          </Card>

          {/* Main content */}
          <Card className="col-span-12 lg:col-span-9">
            <CardContent className="p-4 sm:p-6">
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  {/* Default route based on role */}
                  <Route
                    path="/"
                    element={
                      permissions.can_manage_users ? (
                        <AdminUsersOptimized />
                      ) : (
                        <AdminAlerts />
                      )
                    }
                  />

                  {/* Routes available to managers and admins */}
                  {permissions.can_manage_users && (
                    <>
                      <Route path="/users" element={<AdminUsersOptimized />} />
                      <Route
                        path="/cameras"
                        element={<AdminCamerasOptimized />}
                      />
                    </>
                  )}

                  {/* Admin-only routes */}
                  {permissions.is_admin && (
                    <>
                      <Route path="/add-role" element={<AddRole />} />
                      <Route
                        path="/subscriptions"
                        element={<AdminSubscriptions />}
                      />
                      <Route path="/settings" element={<AdminSettings />} />
                    </>
                  )}

                  {/* Routes available to all authenticated users */}
                  <Route path="/alerts" element={<AdminAlerts />} />
                  <Route path="/whatsapp" element={<AdminWhatsApp />} />
                  <Route path="/verification" element={<AdminVerification />} />
                  <Route path="/training" element={<AdminTraining />} />
                </Routes>
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Admin;
