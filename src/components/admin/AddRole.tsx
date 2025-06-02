// src/components/admin/AddRoleOptimized.tsx
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Eye, EyeOff } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAdminData } from "@/contexts/AdminDataContext";
import { useUsers } from "@/hooks/useUsers";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/axiosConfig";

interface User {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  role: string;
  is_active: boolean;
  status: "active" | "blocked";
  cameras_count: number;
  alerts_count: number;
  date_joined: string;
}

interface UserPermissions {
  can_add_roles: boolean;
  can_manage_users: boolean;
  role: string;
  is_admin: boolean;
  is_manager: boolean;
  is_reviewer: boolean;
}

interface AddRoleFormData {
  full_name: string;
  email: string;
  role: string;
  password: string;
  confirm_password: string;
}

const AddRole = () => {
  const { users, isLoading: usersLoading } = useAdminData();
  const { addUser } = useUsers();
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<AddRoleFormData>({
    full_name: "",
    email: "",
    role: "",
    password: "",
    confirm_password: "",
  });

  // Fetch user permissions with React Query
  const {
    data: permissions,
    isLoading: permissionsLoading,
    error: permissionsError,
  } = useQuery({
    queryKey: ["admin", "permissions"],
    queryFn: async (): Promise<UserPermissions> => {
      const response = await apiClient.get("/admin/users/user_permissions/");
      if (response.data && response.data.success) {
        return response.data.data;
      }
      throw new Error("Failed to fetch permissions");
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });

  const roleOptions = [
    { value: "manager", label: "Manager" },
    { value: "reviewer", label: "Reviewer" },
    { value: "user", label: "User" },
  ];

  // Memoized filtered users to avoid unnecessary re-renders
  const filteredUsers = useMemo(() => {
    if (!users) return [];

    return users.filter(
      (user) =>
        user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  const handleInputChange = (field: keyof AddRoleFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.full_name.trim()) {
      toast({
        title: "Validation Error",
        description: "Full name is required.",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.email.trim()) {
      toast({
        title: "Validation Error",
        description: "Email is required.",
        variant: "destructive",
      });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.role) {
      toast({
        title: "Validation Error",
        description: "Please select a role.",
        variant: "destructive",
      });
      return false;
    }

    if (formData.password.length < 8) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return false;
    }

    if (formData.password !== formData.confirm_password) {
      toast({
        title: "Validation Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const payload = {
        full_name: formData.full_name,
        email: formData.email,
        role: formData.role,
        password: formData.password,
      };

      await addUser.mutateAsync(payload);

      // Reset form and close modal
      setFormData({
        full_name: "",
        email: "",
        role: "",
        password: "",
        confirm_password: "",
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding role:", error);
      // Error is already handled in the mutation
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "default";
      case "manager":
        return "secondary";
      case "reviewer":
        return "outline";
      case "user":
        return "secondary";
      default:
        return "secondary";
    }
  };

  // Loading state
  if (usersLoading || permissionsLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin h-8 w-8 border-2 border-primary rounded-full border-t-transparent"></div>
      </div>
    );
  }

  // Error state
  if (permissionsError) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-bold mb-4">Error Loading Permissions</h2>
        <p className="text-muted-foreground mb-4">
          {permissionsError.message || "Failed to load user permissions"}
        </p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  // Access denied state
  if (!permissions?.can_add_roles) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-bold mb-4">Access Denied</h2>
        <p className="text-muted-foreground">
          You don't have permission to add roles.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {users?.filter((u) => u.status === "active").length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Managers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {users?.filter((u) => u.role === "manager").length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Reviewers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {users?.filter((u) => u.role === "reviewer").length || 0}
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight">
          Role Management ({filteredUsers.length} users)
        </h2>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Role
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Role</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) =>
                    handleInputChange("full_name", e.target.value)
                  }
                  placeholder="Enter full name"
                  disabled={addUser.isPending}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter email address"
                  disabled={addUser.isPending}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleInputChange("role", value)}
                  disabled={addUser.isPending}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    placeholder="Enter password"
                    disabled={addUser.isPending}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-10 px-3"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={addUser.isPending}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirm_password">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirm_password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirm_password}
                    onChange={(e) =>
                      handleInputChange("confirm_password", e.target.value)
                    }
                    placeholder="Confirm password"
                    disabled={addUser.isPending}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-10 px-3"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={addUser.isPending}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={addUser.isPending}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={addUser.isPending}>
                {addUser.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users by name, email, or role..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div>
        <div className="text-lg font-semibold mb-4">Users & Roles</div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Cameras</TableHead>
                <TableHead className="text-center">Alerts</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.full_name}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.status === "active" ? "outline" : "destructive"
                      }
                    >
                      {user.status === "active" ? "Active" : "Blocked"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {user.cameras_count}
                  </TableCell>
                  <TableCell className="text-center">
                    {user.alerts_count}
                  </TableCell>
                  <TableCell>
                    {new Date(user.date_joined).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No users found matching your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default AddRole;
