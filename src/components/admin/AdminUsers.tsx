import { useState, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import apiClient from "@/lib/api/axiosConfig";
import { toast } from "@/hooks/use-toast";

// User type definition
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

const AdminUsers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedActions, setSelectedActions] = useState<
    Record<string, string>
  >({});

  // Action options for dropdown
  const actionOptions = ["Edit", "Block", "Unblock", "Delete"];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get("/admin/users/");
      if (response.data && response.data.success) {
        setUsers(response.data.data.results || response.data.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to load users. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle user actions
  const handleUserAction = async (userId: string, action: string) => {
    console.log(`Action ${action} triggered for user ${userId}`);

    // Update selected action for this user
    setSelectedActions((prev) => ({
      ...prev,
      [userId]: action,
    }));

    try {
      let response;

      switch (action) {
        case "Edit":
          // Open edit dialog (implement separately)
          break;

        case "Block":
        case "Unblock":
        case "Delete":
          response = await apiClient.post(
            `/admin/users/${userId}/update_status/`,
            {
              action: action,
            }
          );

          if (response.data && response.data.success) {
            toast({
              title: "Success",
              description: response.data.message,
            });

            // Update the user in the local state
            setUsers((prevUsers) =>
              prevUsers.map((user) =>
                user.id === userId ? response.data.data : user
              )
            );
          }
          break;

        default:
          break;
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action.toLowerCase()} user. Please try again.`,
        variant: "destructive",
      });
    }

    // Reset the dropdown
    setSelectedActions((prev) => ({
      ...prev,
      [userId]: "",
    }));
  };

  const filteredUsers = users.filter(
    (user) =>
      user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone_number.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight">
          User Management
        </h2>
        <Dialog>
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
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                <label className="sm:text-right">Full Name</label>
                <Input className="sm:col-span-3" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                <label className="sm:text-right">Email</label>
                <Input type="email" className="sm:col-span-3" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                <label className="sm:text-right">Phone</label>
                <Input type="tel" className="sm:col-span-3" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                <label className="sm:text-right">Address</label>
                <Input className="sm:col-span-3" />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline">Cancel</Button>
              <Button>Create User</Button>
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

      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin h-8 w-8 border-2 border-primary rounded-full border-t-transparent"></div>
        </div>
      ) : (
        <>
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
                        onValueChange={(value) =>
                          handleUserAction(user.id, value)
                        }
                      >
                        <SelectTrigger className="ml-auto w-[120px]">
                          <SelectValue placeholder="Actions" />
                        </SelectTrigger>
                        <SelectContent>
                          {actionOptions.map((action) => {
                            // Conditionally show Block/Unblock based on current status
                            if (action === "Block" && user.status === "blocked")
                              return null;
                            if (
                              action === "Unblock" &&
                              user.status === "active"
                            )
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
                      variant={
                        user.status === "active" ? "success" : "destructive"
                      }
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
                      onValueChange={(value) =>
                        handleUserAction(user.id, value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Actions" />
                      </SelectTrigger>
                      <SelectContent>
                        {actionOptions.map((action) => {
                          // Conditionally show Block/Unblock based on current status
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
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminUsers;
