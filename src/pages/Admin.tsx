import { useState } from "react";
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
import { DashboardLayout } from "@/components/DashboardLayout";

const Admin = () => {
  const navigate = useNavigate();
  const [alertCount, setAlertCount] = useState(12);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    {
      path: "/users",
      label: "Users",
      icon: <Users className="mr-2 h-5 w-5" />,
      badge: null,
    },
    {
      path: "/cameras",
      label: "Cameras",
      icon: <Camera className="mr-2 h-5 w-5" />,
      badge: null,
    },
    {
      path: "/subscriptions",
      label: "Subscriptions",
      icon: <CreditCard className="mr-2 h-5 w-5" />,
      badge: null,
    },
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
    },
    {
      path: "/settings",
      label: "Settings",
      icon: <Settings className="mr-2 h-5 w-5" />,
      badge: null,
    },
  ];

  const AdminNav = () => (
    <nav className="flex flex-col p-2">
      {menuItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          onClick={() => setMobileMenuOpen(false)}
          className={({ isActive }) =>
            cn(
              "flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors",
              isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
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
                <Route path="/" element={<AdminUsers />} />
                <Route path="/users" element={<AdminUsers />} />
                <Route path="/cameras" element={<AdminCameras />} />
                <Route path="/subscriptions" element={<AdminSubscriptions />} />
                <Route path="/alerts" element={<AdminAlerts />} />
                <Route path="/whatsapp" element={<AdminWhatsApp />} />
                <Route path="/verification" element={<AdminVerification />} />
                <Route path="/training" element={<AdminTraining />} />
                <Route path="/settings" element={<AdminSettings />} />
              </Routes>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Admin;
