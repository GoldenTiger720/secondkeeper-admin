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
import { Search, Calendar, Check, X, Play } from "lucide-react";
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

  const handlePlayVideo = (videoUrl: string, alertType: string) => {
    setCurrentVideo(videoUrl);
    setCurrentAlertType(alertType);
    setVideoModalOpen(true);
  };

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch alerts from the reviewer pending endpoint
        const data = await alertsService.getReviewerPendingAlerts();
        console.log("Fetched alerts:", data);
        if (!Array.isArray(data.results)) {
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
        setAlerts(Array.isArray(data.results) ? data.results : []);
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
  if (loading) {
    return <div className="text-center text-muted-foreground">Loading...</div>;
  }
  const filteredAlerts = alerts?.filter((alert) => {
    const matchesSearch =
      alert.alert_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.camera_name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filter === "all" || alert.status === filter;
    const matchesType = typeFilter === "all" || alert.alert_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
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
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending_review">
              Pending
              <Badge variant="secondary" className="ml-2">
                {alerts.filter((a) => a.status === "pending_review").length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
            <TabsTrigger value="false_positive">False Positive</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAlerts && filteredAlerts.length === 0 ? (
          <div className="col-span-full text-center text-muted-foreground py-8">
            There are no alerts
          </div>
        ) : (
          filteredAlerts?.map((alert) => (
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
                        >
                          <Check className="h-4 w-4 text-green-500" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
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
