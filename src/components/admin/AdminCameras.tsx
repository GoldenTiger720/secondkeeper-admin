import { useState } from "react";
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

// Mock camera data
const mockCameras = [
  {
    id: "1",
    name: "Front Door",
    ip: "192.168.1.100",
    url: "rtsp://user:pass@192.168.1.100:554/stream1",
    userId: "1",
    userName: "John Doe",
    status: "online",
  },
  {
    id: "2",
    name: "Living Room",
    ip: "192.168.1.101",
    url: "rtsp://user:pass@192.168.1.101:554/stream1",
    userId: "1",
    userName: "John Doe",
    status: "online",
  },
  {
    id: "3",
    name: "Kitchen",
    ip: "192.168.1.102",
    url: "rtsp://user:pass@192.168.1.102:554/stream1",
    userId: "2",
    userName: "Jane Smith",
    status: "offline",
  },
  {
    id: "4",
    name: "Backyard",
    ip: "192.168.1.103",
    url: "rtsp://user:pass@192.168.1.103:554/stream1",
    userId: "2",
    userName: "Jane Smith",
    status: "online",
  },
  {
    id: "5",
    name: "Bedroom",
    ip: "192.168.1.104",
    url: "rtsp://user:pass@192.168.1.104:554/stream1",
    userId: "3",
    userName: "Mike Johnson",
    status: "offline",
  },
];

// Mock users for filtering
const mockUsers = [
  { id: "1", name: "John Doe" },
  { id: "2", name: "Jane Smith" },
  { id: "3", name: "Mike Johnson" },
  { id: "4", name: "Sarah Williams" },
];

const AdminCameras = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [cameras, setCameras] = useState(mockCameras);
  const [pageSize, setPageSize] = useState("5");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredCameras = cameras.filter((camera) => {
    const matchesSearch =
      camera.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      camera.ip.includes(searchQuery) ||
      camera.url.includes(searchQuery);

    const matchesUser = selectedUser ? camera.userId === selectedUser : true;

    return matchesSearch && matchesUser;
  });

  // Calculate pagination
  const totalItems = filteredCameras.length;
  const pageCount = Math.ceil(totalItems / parseInt(pageSize));
  const startIndex = (currentPage - 1) * parseInt(pageSize);
  const endIndex = Math.min(startIndex + parseInt(pageSize), totalItems);
  const paginatedCameras = filteredCameras.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

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
            placeholder="Search cameras..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={selectedUser} onValueChange={setSelectedUser}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Filter by user" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            {mockUsers.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.name}
              </SelectItem>
            ))}
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
                    IP Address
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Stream URL
                  </TableHead>
                  <TableHead className="hidden sm:table-cell">User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCameras.map((camera) => (
                  <TableRow key={camera.id}>
                    <TableCell className="font-medium">{camera.name}</TableCell>
                    <TableCell className="hidden md:table-cell font-mono text-xs">
                      {camera.ip}
                    </TableCell>
                    <TableCell
                      className="hidden lg:table-cell font-mono text-xs truncate max-w-[300px]"
                      title={camera.url}
                    >
                      {camera.url}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {camera.userName}
                    </TableCell>
                    <TableCell>
                      {camera.status === "online" ? (
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200"
                        >
                          <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                          Online
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-red-50 text-red-700 border-red-200"
                        >
                          <div className="w-2 h-2 rounded-full bg-red-500 mr-1"></div>
                          Offline
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 inline-flex"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 inline-flex"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 inline-flex hover:bg-red-50 hover:text-red-600"
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

          {filteredCameras.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1}-{endIndex} of {totalItems} cameras
              </div>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Select value={pageSize} onValueChange={handlePageSizeChange}>
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
                            : ""
                        }
                      />
                    </PaginationItem>

                    {showEllipsisStart && currentPage > 3 && (
                      <>
                        <PaginationItem>
                          <PaginationLink onClick={() => handlePageChange(1)}>
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
                          >
                            {pageCount}
                          </PaginationLink>
                        </PaginationItem>
                      </>
                    )}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          handlePageChange(Math.min(pageCount, currentPage + 1))
                        }
                        className={
                          currentPage === pageCount
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCameras;
