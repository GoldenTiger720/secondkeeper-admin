import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Edit, Trash, Eye, Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAdminData } from "@/contexts/AdminDataContext";
import { useCameras } from "@/hooks/useCameras";

const AdminCameras = () => {
  const { cameras, users, isLoading } = useAdminData();
  const { updateCamera, addCamera, deleteCamera } = useCameras();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingCamera, setEditingCamera] = useState<any>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Memoized filtered cameras
  const filteredCameras = useMemo(() => {
    if (!cameras) return [];

    return cameras.filter((camera) => {
      const matchesSearch =
        camera.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        camera.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        camera.stream_url.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesUser = selectedUser ? camera.user_id === selectedUser : true;
      const matchesStatus = selectedStatus
        ? camera.status === selectedStatus
        : true;

      return matchesSearch && matchesUser && matchesStatus;
    });
  }, [cameras, searchQuery, selectedUser, selectedStatus]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleUpdateCamera = async (cameraId: string, data: any) => {
    try {
      await updateCamera.mutateAsync({ cameraId, data });
      setEditingCamera(null);
    } catch (error) {
      console.error("Error updating camera:", error);
    }
  };

  const handleDeleteCamera = async (cameraId: string) => {
    if (confirm("Are you sure you want to delete this camera?")) {
      try {
        await deleteCamera.mutateAsync({ cameraId });
      } catch (error) {
        console.error("Error deleting camera:", error);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "online":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
            Online
          </Badge>
        );
      case "offline":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            <div className="w-2 h-2 rounded-full bg-red-500 mr-1"></div>
            Offline
          </Badge>
        );
      case "error":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            <div className="w-2 h-2 rounded-full bg-yellow-500 mr-1"></div>
            Error
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="bg-gray-50 text-gray-700 border-gray-200"
          >
            <div className="w-2 h-2 rounded-full bg-gray-500 mr-1"></div>
            {status}
          </Badge>
        );
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight">
          Camera Management ({filteredCameras.length})
        </h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            {/* <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Camera
            </Button> */}
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Camera</DialogTitle>
            </DialogHeader>
            {/* Add Camera Form */}
            <div className="grid gap-4 py-4">
              <Input placeholder="Camera Name" />
              <Input placeholder="Stream URL" />
              <Input placeholder="Username (optional)" />
              <Input type="password" placeholder="Password (optional)" />
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button>Add Camera</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search cameras by name, user, or URL..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Select
          value={selectedStatus || "all"}
          onValueChange={(value) =>
            setSelectedStatus(value === "all" ? "" : value)
          }
        >
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="offline">Offline</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Camera List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Name</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Stream URL
                  </TableHead>
                  <TableHead className="hidden sm:table-cell">User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Created
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCameras.map((camera) => (
                  <TableRow key={camera.id}>
                    <TableCell className="font-medium">{camera.name}</TableCell>
                    <TableCell
                      className="hidden md:table-cell font-mono text-xs truncate max-w-[300px]"
                      title={camera.stream_url}
                    >
                      {camera.stream_url}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div>
                        <div className="font-medium">{camera.user_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {camera.user_email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(camera.status)}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {new Date(camera.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 inline-flex"
                        title="View Camera"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 inline-flex"
                        title="Edit Camera"
                        onClick={() => setEditingCamera(camera)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 inline-flex hover:bg-red-50 hover:text-red-600"
                        title="Delete Camera"
                        onClick={() => handleDeleteCamera(camera.id)}
                        disabled={deleteCamera.isPending}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredCameras.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No cameras found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Camera Dialog */}
      <Dialog
        open={!!editingCamera}
        onOpenChange={() => setEditingCamera(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Camera</DialogTitle>
          </DialogHeader>
          {editingCamera && (
            <div className="grid gap-4 py-4">
              <Input
                defaultValue={editingCamera.name}
                placeholder="Camera Name"
              />
              <Input
                defaultValue={editingCamera.stream_url}
                placeholder="Stream URL"
              />
            </div>
          )}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setEditingCamera(null)}>
              Cancel
            </Button>
            <Button>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCameras;
