import { useState } from "react";
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

// Mock alerts data
const mockAlerts = [
  {
    id: "1",
    type: "Fall Detected",
    timestamp: "2024-05-17T10:23:45",
    user: "John Doe",
    camera: "Living Room",
    status: "pending",
    videoUrl: "/videos/detected/fall_clip.mp4",
    thumbnail: "/images/thumnail/fall_clip.png",
  },
  {
    id: "2",
    type: "Fire Detected",
    timestamp: "2024-05-17T09:15:22",
    user: "Jane Smith",
    camera: "Kitchen",
    status: "confirmed",
    videoUrl: "/videos/detected/fire_clip.mp4",
    thumbnail: "/images/thumnail/fire_clip.png",
  },
  {
    id: "3",
    type: "Unauthorized Person",
    timestamp: "2024-05-17T08:45:10",
    user: "Mike Johnson",
    camera: "Front Door",
    status: "false_positive",
    videoUrl: "/videos/detected/choking_clip.mp4",
    thumbnail: "https://picsum.photos/seed/3/320/180",
  },
  {
    id: "4",
    type: "Violence Detected",
    timestamp: "2024-05-17T07:30:55",
    user: "Sarah Williams",
    camera: "Backyard",
    status: "pending",
    videoUrl: "/videos/detected/violence_clip.mp4",
    thumbnail: "/images/thumnail/violence_clip.png",
  },
  {
    id: "5",
    type: "Fall Detected",
    timestamp: "2024-05-16T22:12:33",
    user: "John Doe",
    camera: "Bedroom",
    status: "confirmed",
    videoUrl: "/videos/detected/fall_clip.mp4",
    thumbnail: "/images/thumnail/fall_clip.png",
  },
  {
    id: "6",
    type: "Choking Detected",
    timestamp: "2024-05-16T20:05:11",
    user: "Jane Smith",
    camera: "Living Room",
    status: "false_positive",
    videoUrl: "/videos/detected/choking_clip.mp4",
    thumbnail: "/images/thumnail/choking_clip.png",
  },
];

const formatDate = (dateString) => {
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
  const [alerts, setAlerts] = useState(mockAlerts);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState("");
  const [currentAlertType, setCurrentAlertType] = useState("");

  const handlePlayVideo = (videoUrl: string, alertType: string) => {
    setCurrentVideo(videoUrl);
    setCurrentAlertType(alertType);
    setVideoModalOpen(true);
  };

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch =
      alert.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.camera.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filter === "all" || alert.status === filter;
    const matchesType = typeFilter === "all" || alert.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const alertTypes = [...new Set(mockAlerts.map((alert) => alert.type))];

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
            <TabsTrigger value="pending">
              Pending
              <Badge variant="secondary" className="ml-2">
                {alerts.filter((a) => a.status === "pending").length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
            <TabsTrigger value="false_positive">False Positive</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAlerts.map((alert) => (
          <Card key={alert.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base font-medium">
                  {alert.type}
                </CardTitle>
                <Badge
                  variant={
                    alert.status === "confirmed"
                      ? "outline"
                      : alert.status === "pending"
                      ? "secondary"
                      : "destructive"
                  }
                >
                  {alert.status === "confirmed"
                    ? "Confirmed"
                    : alert.status === "pending"
                    ? "Pending"
                    : "False Positive"}
                </Badge>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-3.5 w-3.5 mr-1" />
                {formatDate(alert.timestamp)}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <img
                  src={alert.thumbnail}
                  alt={alert.type}
                  className="w-full h-40 object-cover rounded-md"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button
                    variant="secondary"
                    className="opacity-90"
                    onClick={() => handlePlayVideo(alert.videoUrl, alert.type)}
                  >
                    <Play className="h-4 w-4 mr-1" /> Play Video
                  </Button>
                </div>
              </div>
              <div className="text-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{alert.user}</div>
                    <div className="text-xs text-muted-foreground">
                      {alert.camera}
                    </div>
                  </div>
                  {alert.status === "pending" && (
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
        ))}
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
