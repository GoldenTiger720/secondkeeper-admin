// src/pages/Admin.tsx - Updated with role-based navigation

import { useState, useEffect } from "react";
import { Routes, Route, NavLink, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Users,
  Camera,
  CreditCard,
  Bell,
  MessageSquare,
  Check,
  Database,
  Settings,
  Shield,
  Menu,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminCameras from "@/components/admin/AdminCameras";
import AdminSubscriptions from "@/components/admin/AdminSubscriptions";
import AdminAlerts from "@/components/admin/AdminAlerts";
import AdminWhatsApp from "@/components/admin/AdminWhatsApp";
import AdminVerification from "@/components/admin/AdminVerification";
import AdminTraining from "@/components/admin/AdminTraining";
import AdminSettings from "@/components/admin/AdminSettings";
import AddRole from "@/components/admin/AddRole";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import apiClient from "@/lib/api/axiosConfig";
import { toast } from "@/hooks/use-toast";

interface UserPermissions {
  can_add_roles: boolean;
  can_manage_users: boolean;
  role: string;
  is_admin: boolean;
  is_manager: boolean;
  is_reviewer: boolean;
}

const Admin = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [alertCount, setAlertCount] = useState(12);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(true);

  useEffect(() => {
    fetchUserPermissions();
  }, []);

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

    // Items available to all authenticated users (admin, manager, reviewer)
    baseItems.push(
      {
        path: "/alerts",
        label: "Alerts",
        icon: <Bell className="mr-2 h-5 w-5" />,
        badge: alertCount > 0 ? alertCount : null,
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
            onClick={() => setMobileMenuOpen(false)}
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

  if (isLoadingPermissions) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary rounded-full border-t-transparent"></div>
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
              <Routes>
                {/* Default route based on role */}
                <Route
                  path="/"
                  element={
                    permissions.can_manage_users ? (
                      <AdminUsers />
                    ) : (
                      <AdminAlerts />
                    )
                  }
                />

                {/* Routes available to managers and admins */}
                {permissions.can_manage_users && (
                  <>
                    <Route path="/users" element={<AdminUsers />} />
                    <Route path="/cameras" element={<AdminCameras />} />
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
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Admin;
