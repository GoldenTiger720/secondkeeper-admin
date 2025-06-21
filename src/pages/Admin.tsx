import { useState, useEffect, Suspense, lazy, useCallback } from "react";
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
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useAdminData } from "@/contexts/AdminDataContext";
import { usePersistChanges } from "@/hooks/usePersistChanges";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-10">
    <div className="animate-spin h-8 w-8 border-2 border-primary rounded-full border-t-transparent"></div>
  </div>
);

const Admin = () => {
  const { user } = useAuth();
  const {
    isLoading: dataLoading,
    isPermissionsLoading,
    permissions,
    error,
    refetchAll,
  } = useAdminData();
  const { syncToBackend } = usePersistChanges();
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  // Memoize syncToBackend to prevent unnecessary re-renders
  const memoizedSyncToBackend = useCallback(() => {
    syncToBackend();
  }, [syncToBackend]);

  useEffect(() => {
    // Auto-sync changes periodically
    const syncInterval = setInterval(() => {
      memoizedSyncToBackend();
    }, 60000); // Sync every minute

    return () => clearInterval(syncInterval);
  }, [memoizedSyncToBackend]);

  const handleRetry = async () => {
    if (isRetrying) return;

    setIsRetrying(true);
    setRetryCount((prev) => prev + 1);

    try {
      await refetchAll();
    } catch (error) {
      console.error("Retry failed:", error);
    } finally {
      setIsRetrying(false);
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

    if (permissions.is_reviewer) {
      return [
        {
          path: "/settings",
          label: "Settings",
          icon: <Settings className="mr-2 h-5 w-5" />,
          badge: null,
        },
        {
          path: "/alerts",
          label: "Alerts",
          icon: <Bell className="mr-2 h-5 w-5" />,
          badge: null,
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
      ];
    }

    // Items available to all authenticated users
    baseItems.push(
      {
        path: "/alerts",
        label: "Alerts",
        icon: <Bell className="mr-2 h-5 w-5" />,
        badge: null,
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

  // Show loading state while fetching permissions or data
  if (isPermissionsLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-4 text-muted-foreground">
              Verifying permissions...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show error state - but permissions errors will auto-logout, so this is mainly for other errors
  if (error) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center max-w-md">
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Unable to load dashboard data</p>
                  <p className="text-sm">{error}</p>
                  {retryCount > 0 && (
                    <p className="text-xs">Retry attempt: {retryCount}</p>
                  )}
                </div>
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <Button
                onClick={handleRetry}
                disabled={isRetrying}
                className="w-full"
              >
                {isRetrying ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="w-full"
              >
                Refresh Page
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show access denied if no permissions (this should rarely show since auth errors auto-logout)
  if (!permissions) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center max-w-md">
            <Alert className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Unable to verify permissions</p>
                  <p className="text-sm">
                    Your session may have expired or you may not have access to
                    this area.
                  </p>
                </div>
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <Button
                onClick={() => (window.location.href = "/login")}
                className="w-full"
              >
                Go to Login
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show loading for data while permissions are available
  if (dataLoading) {
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

            {/* Main content loading */}
            <Card className="col-span-12 lg:col-span-9">
              <CardContent className="p-4 sm:p-6">
                <div className="text-center py-10">
                  <LoadingSpinner />
                  <p className="mt-4 text-muted-foreground">
                    Loading dashboard data...
                  </p>
                </div>
              </CardContent>
            </Card>
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
                      permissions.is_reviewer ? (
                        <AdminSettings />
                      ) : permissions.can_manage_users ? (
                        <AdminUsersOptimized />
                      ) : (
                        <AdminAlerts />
                      )
                    }
                  />

                  {/* Routes available to managers and admins only */}
                  {permissions.can_manage_users && !permissions.is_reviewer && (
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

                  {/* Reviewer-only accessible routes */}
                  {permissions.is_reviewer && (
                    <>
                      <Route path="/settings" element={<AdminSettings />} />
                      <Route path="/alerts" element={<AdminAlerts />} />
                      <Route path="/whatsapp" element={<AdminWhatsApp />} />
                      <Route
                        path="/verification"
                        element={<AdminVerification />}
                      />
                    </>
                  )}

                  {/* Routes available to managers and admins (not reviewers) */}
                  {!permissions.is_reviewer && (
                    <>
                      <Route path="/alerts" element={<AdminAlerts />} />
                      <Route path="/whatsapp" element={<AdminWhatsApp />} />
                      <Route
                        path="/verification"
                        element={<AdminVerification />}
                      />
                      <Route path="/training" element={<AdminTraining />} />
                    </>
                  )}
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
