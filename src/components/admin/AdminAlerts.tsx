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
import { Search, Calendar, Check, X, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VideoPlayModal from "./VideoPlayModal";
import { toast } from "@/hooks/use-toast";
import { alertsService, Alert } from "@/lib/api/alertsService";

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const AdminAlerts = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all"); // all, pending, confirmed, false_positive
  const [typeFilter, setTypeFilter] = useState("all");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState("");
  const [currentAlertType, setCurrentAlertType] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handlePlayVideo = (videoUrl: string, alertType: string) => {
    setCurrentVideo(videoUrl);
    setCurrentAlertType(alertType);
    setVideoModalOpen(true);
  };

  const handleConfirmAlert = async (alertId: string) => {
    try {
      await alertsService.confirmAlert(alertId);
      // Refresh the alerts list
      const data = await alertsService.getReviewerAllAlerts();
      let alertsData = [];
      if (Array.isArray(data)) {
        alertsData = data;
      } else if (data.results && Array.isArray(data.results)) {
        alertsData = data.results;
      } else if (data.data && Array.isArray(data.data)) {
        alertsData = data.data;
      }
      setAlerts(alertsData);
    } catch (error) {
      console.error("Failed to confirm alert:", error);
    }
  };

  const handleMarkAsFalsePositive = async (alertId: string) => {
    try {
      await alertsService.markAsFalsePositive(alertId);
      // Refresh the alerts list
      const data = await alertsService.getReviewerAllAlerts();
      let alertsData = [];
      if (Array.isArray(data)) {
        alertsData = data;
      } else if (data.results && Array.isArray(data.results)) {
        alertsData = data.results;
      } else if (data.data && Array.isArray(data.data)) {
        alertsData = data.data;
      }
      setAlerts(alertsData);
    } catch (error) {
      console.error("Failed to mark alert as false positive:", error);
    }
  };

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch alerts from the reviewer all endpoint
        const data = await alertsService.getReviewerAllAlerts();
        console.log("Fetched alerts:", data);
        
        // Handle different possible data structures
        let alertsData = [];
        if (Array.isArray(data)) {
          alertsData = data;
        } else if (data.results && Array.isArray(data.results)) {
          alertsData = data.results;
        } else if (data.data && Array.isArray(data.data)) {
          alertsData = data.data;
        } else {
          // Handle unexpected data format
          setError("Failed to load alerts. Please try again.");
          toast({
            title: "Error",
            description: "Failed to load alerts from the server",
            variant: "destructive",
          });
          return;
        }
        
        // Set the alerts state directly with the fetched data
        setAlerts(alertsData);
      } catch (err) {
        console.error("Failed to fetch alerts:", err);
        setError("Failed to load alerts. Please try again.");
        toast({
          title: "Error",
          description: "Failed to load alerts from the server",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filter, typeFilter]);

  if (loading) {
    return <div className="text-center text-muted-foreground">Loading...</div>;
  }
  const filteredAlerts = alerts?.filter((alert) => {
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
    totalAlerts: alerts?.length,
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
                {alerts.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="pending_review">
              Pending
              <Badge variant="secondary" className="ml-2">
                {alerts.filter((a) => a.status === "pending_review").length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="confirmed">
              Confirmed
              <Badge variant="secondary" className="ml-2">
                {alerts.filter((a) => a.status === "confirmed").length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="false_positive">
              False Positive
              <Badge variant="secondary" className="ml-2">
                {alerts.filter((a) => a.status === "false_positive").length}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

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
                  <CardTitle className="text-base font-medium">
                    {alert.alert_type}
                  </CardTitle>
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
    </div>
  );
};

export default AdminAlerts;
