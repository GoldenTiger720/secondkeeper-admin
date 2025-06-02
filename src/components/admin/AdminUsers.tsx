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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  role: string;
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

interface EditUserFormData {
  full_name: string;
  email: string;
  role: string;
  phone_number: string;
}

const AdminUsers = () => {
  const { users, isLoading } = useAdminData();
  const { updateUserStatus, addUser, editUser, deleteUser } = useUsers();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedActions, setSelectedActions] = useState<
    Record<string, string>
  >({});

  // Add User Modal States
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [addFormData, setAddFormData] = useState<AddUserFormData>({
    full_name: "",
    email: "",
    role: "",
    password: "",
    confirm_password: "",
    phone_number: "",
  });

  // Edit User Modal States
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState<EditUserFormData>({
    full_name: "",
    email: "",
    role: "",
    phone_number: "",
  });

  // Delete User Modal States
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Memoized filtered users to avoid unnecessary re-renders
  const filteredUsers = useMemo(() => {
    if (!users) return [];

    return users.filter(
      (user) =>
        user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  const actionOptions = ["Edit", "Block", "Unblock", "Delete"];
  const roleOptions = [
    { value: "manager", label: "Manager" },
    { value: "reviewer", label: "Reviewer" },
    { value: "user", label: "User" },
  ];

  // Add User Form Handlers
  const handleAddInputChange = (
    field: keyof AddUserFormData,
    value: string
  ) => {
    setAddFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateAddForm = (): boolean => {
    if (!addFormData.full_name.trim()) {
      toast({
        title: "Validation Error",
        description: "Full name is required.",
        variant: "destructive",
      });
      return false;
    }

    if (!addFormData.phone_number.trim()) {
      toast({
        title: "Validation Error",
        description: "Phone is required.",
        variant: "destructive",
      });
      return false;
    }

    if (!/^\d+$/.test(addFormData.phone_number.trim())) {
      toast({
        title: "Validation Error",
        description: "Phone number must contain only numbers.",
        variant: "destructive",
      });
      return false;
    }

    if (!addFormData.email.trim()) {
      toast({
        title: "Validation Error",
        description: "Email is required.",
        variant: "destructive",
      });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(addFormData.email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return false;
    }

    if (!addFormData.role) {
      toast({
        title: "Validation Error",
        description: "Please select a role.",
        variant: "destructive",
      });
      return false;
    }

    if (addFormData.password.length < 8) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return false;
    }

    if (addFormData.password !== addFormData.confirm_password) {
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
    if (!validateAddForm()) return;

    try {
      const userData = {
        full_name: addFormData.full_name,
        email: addFormData.email,
        role: addFormData.role,
        password: addFormData.password,
        phone_number: addFormData.phone_number,
      };

      await addUser.mutateAsync(userData);

      // Reset form and close dialog
      setAddFormData({
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
    }
  };

  // Edit User Form Handlers
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditFormData({
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      phone_number: user.phone_number,
    });
    setIsEditDialogOpen(true);
  };

  const handleEditInputChange = (
    field: keyof EditUserFormData,
    value: string
  ) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateEditForm = (): boolean => {
    if (!editFormData.full_name.trim()) {
      toast({
        title: "Validation Error",
        description: "Full name is required.",
        variant: "destructive",
      });
      return false;
    }

    if (!editFormData.phone_number.trim()) {
      toast({
        title: "Validation Error",
        description: "Phone is required.",
        variant: "destructive",
      });
      return false;
    }

    if (!/^\d+$/.test(editFormData.phone_number.trim())) {
      toast({
        title: "Validation Error",
        description: "Phone number must contain only numbers.",
        variant: "destructive",
      });
      return false;
    }

    if (!editFormData.email.trim()) {
      toast({
        title: "Validation Error",
        description: "Email is required.",
        variant: "destructive",
      });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editFormData.email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return false;
    }

    if (!editFormData.role) {
      toast({
        title: "Validation Error",
        description: "Please select a role.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleUpdateUser = async () => {
    if (!validateEditForm() || !editingUser) return;

    try {
      await editUser.mutateAsync({
        userId: editingUser.id,
        userData: editFormData,
      });

      setIsEditDialogOpen(false);
      setEditingUser(null);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  // Delete User Handlers
  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await deleteUser.mutateAsync({ userId: userToDelete.id });
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  // Action Handler
  const handleUserAction = async (userId: string, action: string) => {
    const user = users?.find((u) => u.id === userId);
    if (!user) return;

    // Update local state immediately for better UX
    setSelectedActions((prev) => ({
      ...prev,
      [userId]: action,
    }));

    try {
      if (action === "Edit") {
        handleEditUser(user);
      } else if (action === "Delete") {
        handleDeleteUser(user);
      } else if (action === "Block" || action === "Unblock") {
        await updateUserStatus.mutateAsync({ userId, action } as any);
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
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

        {/* Add User Dialog */}
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
                <Label htmlFor="add_full_name">Full Name</Label>
                <Input
                  id="add_full_name"
                  value={addFormData.full_name}
                  onChange={(e) =>
                    handleAddInputChange("full_name", e.target.value)
                  }
                  placeholder="Enter full name"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="add_email">Email</Label>
                <Input
                  id="add_email"
                  type="email"
                  value={addFormData.email}
                  onChange={(e) =>
                    handleAddInputChange("email", e.target.value)
                  }
                  placeholder="Enter email address"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="add_phone_number">Phone Number</Label>
                <Input
                  id="add_phone_number"
                  value={addFormData.phone_number}
                  onChange={(e) =>
                    handleAddInputChange("phone_number", e.target.value)
                  }
                  placeholder="Enter phone number"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="add_role">Role</Label>
                <Select
                  value={addFormData.role}
                  onValueChange={(value) => handleAddInputChange("role", value)}
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
                <Label htmlFor="add_password">Password</Label>
                <div className="relative">
                  <Input
                    id="add_password"
                    type={showPassword ? "text" : "password"}
                    value={addFormData.password}
                    onChange={(e) =>
                      handleAddInputChange("password", e.target.value)
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
                <Label htmlFor="add_confirm_password">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="add_confirm_password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={addFormData.confirm_password}
                    onChange={(e) =>
                      handleAddInputChange("confirm_password", e.target.value)
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
              <TableHead>Role</TableHead>
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
                  <Badge variant="outline">
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Badge>
                </TableCell>
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
                    disabled={
                      updateUserStatus.isPending ||
                      editUser.isPending ||
                      deleteUser.isPending
                    }
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

                <div className="text-muted-foreground">Role:</div>
                <div>
                  <Badge variant="outline">
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Badge>
                </div>

                <div className="text-muted-foreground">Cameras:</div>
                <div>{user.cameras_count}</div>

                <div className="text-muted-foreground">Alerts:</div>
                <div>{user.alerts_count}</div>
              </div>

              <div className="pt-2">
                <Select
                  value={selectedActions[user.id] || ""}
                  onValueChange={(value) => handleUserAction(user.id, value)}
                  disabled={
                    updateUserStatus.isPending ||
                    editUser.isPending ||
                    deleteUser.isPending
                  }
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

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit_full_name">Full Name</Label>
              <Input
                id="edit_full_name"
                value={editFormData.full_name}
                onChange={(e) =>
                  handleEditInputChange("full_name", e.target.value)
                }
                placeholder="Enter full name"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit_email">Email</Label>
              <Input
                id="edit_email"
                type="email"
                value={editFormData.email}
                onChange={(e) => handleEditInputChange("email", e.target.value)}
                placeholder="Enter email address"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit_phone_number">Phone Number</Label>
              <Input
                id="edit_phone_number"
                value={editFormData.phone_number}
                onChange={(e) =>
                  handleEditInputChange("phone_number", e.target.value)
                }
                placeholder="Enter phone number"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit_role">Role</Label>
              <Select
                value={editFormData.role}
                onValueChange={(value) => handleEditInputChange("role", value)}
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
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={editUser.isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateUser} disabled={editUser.isPending}>
              {editUser.isPending ? "Updating..." : "Update User"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              user{" "}
              <span className="font-semibold">{userToDelete?.full_name}</span>{" "}
              and remove all their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteUser.isPending}
            >
              {deleteUser.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
