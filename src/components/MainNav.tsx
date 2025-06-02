import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, ChevronDown, LogOut, Menu, Settings, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "./Logo";
import { SyncStatus } from "@/components/ui/SyncStatus";
import { authService } from "@/lib/api/authService";
import { useAuth } from "@/hooks/useAuth";
import { useAdminData } from "@/contexts/AdminDataContext";

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  // const { alerts } = useAdminData();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const [username, setUsername] = useState<string>("");

  // Calculate notification count from cached data
  // const notificationCount =
  //   alerts?.filter(
  //     (alert) => alert.status === "new" || alert.status === "pending"
  //   )?.length || 0;

  // Recent notifications from cached data
  // const recentNotifications =
  //   alerts
  //     ?.filter((alert) => alert.status === "new" || alert.status === "pending")
  //     ?.slice(0, 3)
  //     ?.map((alert) => ({
  //       id: alert.id,
  //       title: `${alert.type} Alert`,
  //       message: `${alert.type} detected at ${alert.camera}`,
  //     })) || [];

  useEffect(() => {
    if (user) {
      setUsername(user.full_name || user.username);
    }
  }, [user]);

  const handleMarkAllAsRead = () => {
    // In a real implementation, you would update the alert status
    // For now, we'll just show a placeholder action
    console.log("Mark all notifications as read");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center space-x-2">
          <Logo />
        </div>

        {/* Mobile Navigation */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] sm:w-[300px]">
            <div className="flex flex-col gap-6 py-4">
              <Logo />
            </div>
          </SheetContent>
        </Sheet>

        <div className="ml-auto flex items-center space-x-2">
          {/* Sync Status Indicator */}
          <SyncStatus />

          {/* Notifications Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {/* {notificationCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {notificationCount}
                  </Badge>
                )} */}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-80 overflow-auto">
                {/* {recentNotifications.length > 0 ? (
                  recentNotifications.map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className="flex flex-col items-start gap-1 p-3"
                    >
                      <div className="font-medium">{notification.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {notification.message}
                      </div>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className="p-3 text-center text-muted-foreground">
                    No new notifications
                  </div>
                )} */}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="justify-center font-medium"
                onClick={handleMarkAllAsRead}
              >
                Mark all as read
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ThemeToggle />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="sm"
                className="gap-1 px-2 h-8 text-xs hidden sm:flex"
              >
                <span>{username || "User"}</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="flex items-center gap-2"
                onClick={() => {
                  authService.logout();
                  window.location.href = "/login";
                }}
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile User Menu Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="sm:hidden">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{username || "User"}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="flex items-center gap-2"
                onClick={() => {
                  authService.logout();
                  window.location.href = "/login";
                }}
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
