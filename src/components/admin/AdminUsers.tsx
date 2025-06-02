import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search, Plus, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminData } from "@/contexts/AdminDataContext";
import { useUsers } from "@/hooks/useUsers";
import { toast } from "@/hooks/use-toast";

interface User {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  is_active: boolean;
  status: "active" | "blocked";
  cameras_count: number;
  alerts_count: number;
}

interface AddUserFormData {
  full_name: string;
  email: string;
  role: string;
  password: string;
  confirm_password: string;
  phone_number: string;
}

const AdminUsers = () => {
  const { users, isLoading } = useAdminData();
  const { updateUserStatus, addUser } = useUsers();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedActions, setSelectedActions] = useState<
    Record<string, string>
  >({});
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<AddUserFormData>({
    full_name: "",
    email: "",
    role: "",
    password: "",
    confirm_password: "",
    phone_number: "",
  });

  // Memoized filtered users to avoid unnecessary re-renders
  const filteredUsers = useMemo(() => {
    if (!users) return [];

    return users.filter(
      (user) =>
        user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      // user.phone_number.includes(searchQuery)
    );
  }, [users, searchQuery]);

  const actionOptions = ["Edit", "Block", "Unblock", "Delete"];
  const roleOptions = [
    { value: "manager", label: "Manager" },
    { value: "reviewer", label: "Reviewer" },
    { value: "user", label: "User" },
  ];

  const handleInputChange = (field: keyof AddUserFormData, value: string) => {
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

    if (!formData.phone_number.trim()) {
      toast({
        title: "Validation Error",
        description: "Phone is required.",
        variant: "destructive",
      });
      return false;
    }

    if (!/^\d+$/.test(formData.phone_number.trim())) {
      toast({
        title: "Validation Error",
        description: "Phone number must contain only numbers.",
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

  const handleAddUser = async () => {
    if (!validateForm()) return;

    try {
      const userData = {
        full_name: formData.full_name,
        email: formData.email,
        role: formData.role,
        password: formData.password,
        phone_number: formData.phone_number,
      };

      await addUser.mutateAsync(userData);

      // Reset form and close dialog
      setFormData({
        full_name: "",
        email: "",
        role: "",
        password: "",
        confirm_password: "",
        phone_number: "",
      });
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Error adding user:", error);
      // Error is already handled in the mutation
    }
  };

  const handleUserAction = async (userId: string, action: string) => {
    // Update local state immediately for better UX
    setSelectedActions((prev) => ({
      ...prev,
      [userId]: action,
    }));

    try {
      if (action === "Block" || action === "Unblock" || action === "Delete") {
        await updateUserStatus.mutateAsync({ userId, action } as any);
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      // Error is already handled in the mutation
    } finally {
      // Reset the dropdown
      setSelectedActions((prev) => ({
        ...prev,
        [userId]: "",
      }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin h-8 w-8 border-2 border-primary rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight">
          User Management ({filteredUsers.length})
        </h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
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
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  value={formData.phone_number}
                  onChange={(e) =>
                    handleInputChange("phone_number", e.target.value)
                  }
                  placeholder="Enter phone number"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleInputChange("role", value)}
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
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-10 px-3"
                    onClick={() => setShowPassword(!showPassword)}
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
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-10 px-3"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                onClick={() => setIsAddDialogOpen(false)}
                disabled={addUser.isPending}
              >
                Cancel
              </Button>
              <Button onClick={handleAddUser} disabled={addUser.isPending}>
                {addUser.isPending ? "Creating..." : "Create User"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Cameras</TableHead>
              <TableHead className="text-center">Alerts</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.full_name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone_number}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      user.status === "active" ? "success" : "destructive"
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
                <TableCell className="text-right">
                  <Select
                    value={selectedActions[user.id] || ""}
                    onValueChange={(value) => handleUserAction(user.id, value)}
                    disabled={updateUserStatus.isPending}
                  >
                    <SelectTrigger className="ml-auto w-[120px]">
                      <SelectValue placeholder="Actions" />
                    </SelectTrigger>
                    <SelectContent>
                      {actionOptions.map((action) => {
                        if (action === "Block" && user.status === "blocked")
                          return null;
                        if (action === "Unblock" && user.status === "active")
                          return null;

                        return (
                          <SelectItem
                            key={action}
                            value={action}
                            className={
                              action === "Delete" ? "text-red-600" : ""
                            }
                          >
                            {action}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {filteredUsers.map((user) => (
          <Card key={user.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">
                  {user.full_name}
                </CardTitle>
                <Badge
                  variant={user.status === "active" ? "success" : "destructive"}
                >
                  {user.status === "active" ? "Active" : "Blocked"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-[80px_1fr] gap-1 text-sm">
                <div className="text-muted-foreground">Email:</div>
                <div className="truncate">{user.email}</div>

                <div className="text-muted-foreground">Phone:</div>
                <div>{user.phone_number}</div>

                <div className="text-muted-foreground">Cameras:</div>
                <div>{user.cameras_count}</div>

                <div className="text-muted-foreground">Alerts:</div>
                <div>{user.alerts_count}</div>
              </div>

              <div className="pt-2">
                <Select
                  value={selectedActions[user.id] || ""}
                  onValueChange={(value) => handleUserAction(user.id, value)}
                  disabled={updateUserStatus.isPending}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Actions" />
                  </SelectTrigger>
                  <SelectContent>
                    {actionOptions.map((action) => {
                      if (action === "Block" && user.status === "blocked")
                        return null;
                      if (action === "Unblock" && user.status === "active")
                        return null;

                      return (
                        <SelectItem
                          key={action}
                          value={action}
                          className={action === "Delete" ? "text-red-600" : ""}
                        >
                          {action}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-10">
          <p className="text-muted-foreground">
            No users found matching your search.
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
