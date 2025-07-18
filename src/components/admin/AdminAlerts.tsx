import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Calendar, Check, X, Play, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VideoPlayModal from "./VideoPlayModal";
import { toast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { 
  useReviewerAllAlerts, 
  useConfirmAlert, 
  useMarkAsFalsePositive, 
  useDeleteAlert,
  useDeleteMultipleAlerts
} from "@/hooks/useAlerts";

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

// Helper function to extract alerts array from various response formats
const extractAlertsData = (data: any): any[] => {
  if (Array.isArray(data)) {
    return data;
  } else if (data?.results && Array.isArray(data.results)) {
    return data.results;
  } else if (data?.data && Array.isArray(data.data)) {
    return data.data;
  }
  return [];
};

const AdminAlerts = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all"); // all, pending, confirmed, false_positive
  const [typeFilter, setTypeFilter] = useState("all");
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState("");
  const [currentAlertType, setCurrentAlertType] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedAlerts, setSelectedAlerts] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [alertToDelete, setAlertToDelete] = useState<string | null>(null);
  const [deleteMultipleDialogOpen, setDeleteMultipleDialogOpen] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState({ current: 0, total: 0 });
  const [isDeleting, setIsDeleting] = useState(false);

  // React Query hooks
  const { data: alerts = [], isLoading: loading, error } = useReviewerAllAlerts();
  const confirmAlertMutation = useConfirmAlert();
  const markAsFalsePositiveMutation = useMarkAsFalsePositive();
  const deleteAlertMutation = useDeleteAlert();
  const deleteMultipleAlertsMutation = useDeleteMultipleAlerts();

  const handlePlayVideo = (videoUrl: string, alertType: string) => {
    setCurrentVideo(videoUrl);
    setCurrentAlertType(alertType);
    setVideoModalOpen(true);
  };

  const handleConfirmAlert = async (alertId: string) => {
    confirmAlertMutation.mutate(alertId);
  };

  const handleMarkAsFalsePositive = async (alertId: string) => {
    markAsFalsePositiveMutation.mutate(alertId);
  };

  const handleDeleteAlert = async (alertId: string) => {
    setAlertToDelete(alertId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteAlert = async () => {
    if (alertToDelete) {
      setIsDeleting(true);
      setDeleteProgress({ current: 0, total: 1 });
      setDeleteDialogOpen(false);
      
      // Simulate progress for better UX
      setTimeout(() => {
        setDeleteProgress({ current: 1, total: 1 });
      }, 200);
      
      // Execute optimistic deletion
      deleteAlertMutation.mutate(alertToDelete);
      
      // Remove from selected alerts and complete after short delay
      setTimeout(() => {
        setSelectedAlerts(prev => prev.filter(id => id !== alertToDelete));
        setAlertToDelete(null);
        setIsDeleting(false);
        setDeleteProgress({ current: 0, total: 0 });
      }, 600);
    }
  };

  const handleDeleteMultiple = async () => {
    if (selectedAlerts.length === 0) return;
    setDeleteMultipleDialogOpen(true);
  };

  const confirmDeleteMultiple = async () => {
    const alertsToDelete = [...selectedAlerts];
    setIsDeleting(true);
    setDeleteProgress({ current: 0, total: alertsToDelete.length });
    setDeleteMultipleDialogOpen(false);

    // Execute optimistic deletion immediately
    deleteMultipleAlertsMutation.mutate(alertsToDelete);

    // Simulate progressive deletion for better UX
    const progressInterval = 150; // milliseconds per item
    for (let i = 0; i < alertsToDelete.length; i++) {
      setTimeout(() => {
        setDeleteProgress({ current: i + 1, total: alertsToDelete.length });
      }, (i + 1) * progressInterval);
    }

    // Complete after all progress steps
    setTimeout(() => {
      setSelectedAlerts([]);
      setIsDeleting(false);
      setDeleteProgress({ current: 0, total: 0 });
    }, alertsToDelete.length * progressInterval + 300);
  };

  const handleSelectAll = () => {
    const currentTabAlerts = filteredAlerts || [];
    if (selectedAlerts.length === currentTabAlerts.length) {
      setSelectedAlerts([]);
    } else {
      setSelectedAlerts(currentTabAlerts.map(alert => alert.id));
    }
  };

  const handleSelectAlert = (alertId: string) => {
    setSelectedAlerts(prev => 
      prev.includes(alertId) 
        ? prev.filter(id => id !== alertId)
        : [...prev, alertId]
    );
  };

  // Handle error display
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load alerts from the server",
        variant: "destructive",
      });
    }
  }, [error]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
    setSelectedAlerts([]);
  }, [searchQuery, filter, typeFilter]);

  if (loading) {
    return <div className="text-center text-muted-foreground">Loading...</div>;
  }
  // Extract alerts data from various response formats
  const alertsData = extractAlertsData(alerts);

  const filteredAlerts = alertsData?.filter((alert) => {
    const matchesSearch =
      (alert.alert_type?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (alert.username?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (alert.camera_name?.toLowerCase() || '').includes(searchQuery.toLowerCase());

    const matchesStatus = filter === "all" || alert.status === filter;
    const matchesType = typeFilter === "all" || alert.alert_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Pagination calculations
  const totalPages = Math.ceil((filteredAlerts?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAlerts = filteredAlerts?.slice(startIndex, endIndex);

  // Debug logging
  console.log('Pagination Debug:', {
    totalAlerts: alertsData?.length,
    filteredAlertsLength: filteredAlerts?.length,
    itemsPerPage,
    totalPages,
    currentPage,
    shouldShowPagination: filteredAlerts && filteredAlerts.length > itemsPerPage
  });

  const alertTypes = [
    ...new Set(filteredAlerts?.map((alert) => alert.alert_type)),
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl md:text-2xl font-bold tracking-tight">
        Global Alert Feed
      </h2>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search alerts..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {alertTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto pb-2">
        <Tabs
          defaultValue="all"
          value={filter}
          onValueChange={setFilter}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="all">
              All
              <Badge variant="secondary" className="ml-2">
                {alertsData.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="pending_review">
              Pending
              <Badge variant="secondary" className="ml-2">
                {alertsData.filter((a) => a.status === "pending_review").length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="confirmed">
              Confirmed
              <Badge variant="secondary" className="ml-2">
                {alertsData.filter((a) => a.status === "confirmed").length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="false_positive">
              False Positive
              <Badge variant="secondary" className="ml-2">
                {alertsData.filter((a) => a.status === "false_positive").length}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {filteredAlerts && filteredAlerts.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={selectedAlerts.length === filteredAlerts.length}
              onCheckedChange={handleSelectAll}
              id="select-all"
            />
            <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
              Select All ({selectedAlerts.length} selected)
            </label>
          </div>
          {selectedAlerts.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteMultiple}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete Selected ({selectedAlerts.length})
            </Button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAlerts && filteredAlerts.length === 0 ? (
          <div className="col-span-full text-center text-muted-foreground py-8">
            There are no alerts
          </div>
        ) : (
          paginatedAlerts?.map((alert) => (
            <Card key={alert.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedAlerts.includes(alert.id)}
                      onCheckedChange={() => handleSelectAlert(alert.id)}
                    />
                    <CardTitle className="text-base font-medium">
                      {alert.alert_type}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        alert.status === "confirmed"
                          ? "outline"
                          : alert.status === "pending_review"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {alert.status === "confirmed"
                        ? "Confirmed"
                        : alert.status === "pending_review"
                        ? "Pending Review"
                        : "False Positive"}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => handleDeleteAlert(alert.id)}
                      title="Delete alert"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5 mr-1" />
                  {formatDate(alert.created_at)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="relative">
                  <img
                    src={alert.thumbnail}
                    alt={alert.alert_type}
                    className="w-full h-40 object-cover rounded-md"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Button
                      variant="secondary"
                      className="opacity-90"
                      onClick={() =>
                        handlePlayVideo(alert.video_file, alert.alert_type)
                      }
                    >
                      <Play className="h-4 w-4 mr-1" /> Play Video
                    </Button>
                  </div>
                </div>
                <div className="text-sm">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{alert.username}</div>
                      <div className="text-xs text-muted-foreground">
                        {alert.camera_name}
                      </div>
                    </div>
                    {alert.status === "pending_review" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={() => handleConfirmAlert(alert.id)}
                          title="Confirm as accurate detection"
                        >
                          <Check className="h-4 w-4 text-green-500" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={() => handleMarkAsFalsePositive(alert.id)}
                          title="Mark as false positive"
                        >
                          <X className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {filteredAlerts && filteredAlerts.length > 0 && (
        <div className="flex items-center justify-between border-t pt-4">
          <div className="text-sm text-muted-foreground">
            {filteredAlerts.length > itemsPerPage ? (
              <>Showing {startIndex + 1} to {Math.min(endIndex, filteredAlerts.length)} of{" "}</>
            ) : (
              <>Showing all </>
            )}
            {filteredAlerts.length} alerts
          </div>
          {totalPages > 1 && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    const start = Math.max(1, currentPage - 2);
                    const end = Math.min(totalPages, currentPage + 2);
                    return page >= start && page <= end;
                  })
                  .map(page => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      <VideoPlayModal
        open={videoModalOpen}
        onOpenChange={setVideoModalOpen}
        videoUrl={currentVideo}
        title={currentAlertType}
      />

      {/* Delete Single Alert Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Alert</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this alert? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setAlertToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteAlert}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Multiple Alerts Dialog */}
      <Dialog open={deleteMultipleDialogOpen} onOpenChange={setDeleteMultipleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {selectedAlerts.length} Alerts</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedAlerts.length} selected alerts? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteMultipleDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteMultiple}
            >
              Delete All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Loading Overlay */}
      {isDeleting && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-background border rounded-lg p-6 shadow-lg max-w-md w-full mx-4">
            <div className="text-center space-y-4">
              <div className="text-lg font-semibold">
                {deleteProgress.total === 1 ? 'Deleting Alert...' : 'Deleting Alerts...'}
              </div>
              <Progress 
                className="w-full" 
                value={deleteProgress.total > 0 ? (deleteProgress.current / deleteProgress.total) * 100 : 0}
              />
              <div className="text-sm text-muted-foreground">
                {deleteProgress.total === 1 
                  ? 'Please wait while we process your request'
                  : `Processing ${deleteProgress.current} of ${deleteProgress.total} alerts`
                }
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAlerts;
