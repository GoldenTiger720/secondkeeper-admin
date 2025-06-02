// src/components/admin/AdminCameras.tsx - Updated with real API integration and pagination

import { useState, useEffect } from "react";
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
import {
  Search,
  Edit,
  Trash,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { toast } from "@/hooks/use-toast";
import apiClient from "@/lib/api/axiosConfig";

interface Camera {
  id: string;
  name: string;
  stream_url: string;
  status: string;
  user_id: string;
  user_name: string;
  user_email: string;
  created_at: string;
  updated_at: string;
}

interface User {
  id: string;
  full_name: string;
  email: string;
}

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Camera[];
}

const AdminCameras = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [pageSize, setPageSize] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      await fetchCameras();
      await fetchUsers();
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, searchQuery, selectedUser, selectedStatus]);

  const fetchCameras = async () => {
    try {
      setIsLoading(true);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        page_size: pageSize,
      });

      if (searchQuery) {
        params.append("search", searchQuery);
      }
      if (selectedUser) {
        params.append("user_id", selectedUser);
      }
      if (selectedStatus) {
        params.append("status", selectedStatus);
      }

      const response = await apiClient.get(
        `/admin/cameras/?${params.toString()}`
      );

      if (response.data && response.data.success) {
        const data = response.data.data;

        // Handle both paginated and non-paginated responses
        if (data.results) {
          setCameras(data.results);
          setTotalCount(data.count);
        } else {
          setCameras(data);
          setTotalCount(data.length);
        }
      }
    } catch (error) {
      console.error("Error fetching cameras:", error);
      toast({
        title: "Error",
        description: "Failed to load cameras. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await apiClient.get("/admin/users/");
      if (response.data && response.data.success) {
        const userData = response.data.data.results || response.data.data;
        setUsers(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          userData.map((user: any) => ({
            id: user.id,
            full_name: user.full_name,
            email: user.email,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleUserFilter = (value: string) => {
    setSelectedUser(value === "all" ? "" : value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (value: string) => {
    setSelectedStatus(value === "all" ? "" : value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: string) => {
    setPageSize(size);
    setCurrentPage(1);
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

  const pageCount = Math.ceil(totalCount / parseInt(pageSize));
  const startIndex = (currentPage - 1) * parseInt(pageSize);
  const endIndex = Math.min(startIndex + parseInt(pageSize), totalCount);

  // Generate pagination items
  const paginationItems = [];
  const showEllipsisStart = currentPage > 3;
  const showEllipsisEnd = currentPage < pageCount - 2;
  const maxPages = 5;

  let startPage = 1;
  let endPage = pageCount;

  if (pageCount > maxPages) {
    if (currentPage <= 3) {
      endPage = maxPages;
    } else if (currentPage >= pageCount - 2) {
      startPage = pageCount - maxPages + 1;
    } else {
      startPage = currentPage - 2;
      endPage = currentPage + 2;
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    paginationItems.push(
      <PaginationItem key={i}>
        <PaginationLink
          onClick={() => handlePageChange(i)}
          isActive={currentPage === i}
          className="cursor-pointer"
        >
          {i}
        </PaginationLink>
      </PaginationItem>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl md:text-2xl font-bold tracking-tight">
        Camera Management
      </h2>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search cameras by name, user, or URL..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        <Select value={selectedUser || "all"} onValueChange={handleUserFilter}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Filter by user" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedStatus || "all"}
          onValueChange={handleStatusFilter}
        >
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="offline">Offline</SelectItem>
            <SelectItem value="error">Error</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Camera List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin h-8 w-8 border-2 border-primary rounded-full border-t-transparent"></div>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">Name</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Stream URL
                      </TableHead>
                      <TableHead className="hidden sm:table-cell">
                        User
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden lg:table-cell">
                        Created
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cameras.map((camera) => (
                      <TableRow key={camera.id}>
                        <TableCell className="font-medium">
                          {camera.name}
                        </TableCell>
                        <TableCell
                          className="hidden md:table-cell font-mono text-xs truncate max-w-[300px]"
                          title={camera.stream_url}
                        >
                          {camera.stream_url}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div>
                            <div className="font-medium">
                              {camera.user_name}
                            </div>
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
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 inline-flex hover:bg-red-50 hover:text-red-600"
                            title="Delete Camera"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {cameras.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          No cameras found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {totalCount > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {startIndex + 1}-{endIndex} of {totalCount} cameras
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <Select
                        value={pageSize}
                        onValueChange={handlePageSizeChange}
                      >
                        <SelectTrigger className="h-8 w-[70px]">
                          <SelectValue placeholder={pageSize} />
                        </SelectTrigger>
                        <SelectContent side="top">
                          {["5", "10", "20", "30", "50"].map((size) => (
                            <SelectItem key={size} value={size}>
                              {size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {pageCount > 1 && (
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={() =>
                                handlePageChange(Math.max(1, currentPage - 1))
                              }
                              className={
                                currentPage === 1
                                  ? "pointer-events-none opacity-50"
                                  : "cursor-pointer"
                              }
                            />
                          </PaginationItem>

                          {showEllipsisStart && currentPage > 3 && (
                            <>
                              <PaginationItem>
                                <PaginationLink
                                  onClick={() => handlePageChange(1)}
                                  className="cursor-pointer"
                                >
                                  1
                                </PaginationLink>
                              </PaginationItem>
                              <PaginationItem>
                                <PaginationEllipsis />
                              </PaginationItem>
                            </>
                          )}

                          {paginationItems}

                          {showEllipsisEnd && currentPage < pageCount - 2 && (
                            <>
                              <PaginationItem>
                                <PaginationEllipsis />
                              </PaginationItem>
                              <PaginationItem>
                                <PaginationLink
                                  onClick={() => handlePageChange(pageCount)}
                                  className="cursor-pointer"
                                >
                                  {pageCount}
                                </PaginationLink>
                              </PaginationItem>
                            </>
                          )}

                          <PaginationItem>
                            <PaginationNext
                              onClick={() =>
                                handlePageChange(
                                  Math.min(pageCount, currentPage + 1)
                                )
                              }
                              className={
                                currentPage === pageCount
                                  ? "pointer-events-none opacity-50"
                                  : "cursor-pointer"
                              }
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCameras;
