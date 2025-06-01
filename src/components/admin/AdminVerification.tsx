import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Calendar, User, Camera } from "lucide-react";

// Mock data for alert verifications
const mockVerifications = {
  pending: [
    {
      id: "1",
      type: "Fall Detected",
      timestamp: "2024-05-17T10:23:45",
      user: "John Doe",
      camera: "Living Room",
      thumbnail: "/images/thumnail/fall_clip.png",
    },
    {
      id: "2",
      type: "Fire Detected",
      timestamp: "2024-05-17T09:15:22",
      user: "Jane Smith",
      camera: "Kitchen",
      thumbnail: "/images/thumnail/fire_clip.png",
    },
  ],
  valid: [
    {
      id: "3",
      type: "Unauthorized Person",
      timestamp: "2024-05-17T08:45:10",
      user: "Mike Johnson",
      camera: "Front Door",
      reviewer: "David Chen",
      action: "Notification sent to user",
      thumbnail: "https://picsum.photos/seed/3/400/225",
    },
    {
      id: "4",
      type: "Violence Detected",
      timestamp: "2024-05-17T07:30:55",
      user: "Sarah Williams",
      camera: "Backyard",
      reviewer: "Maria Garcia",
      action: "Notification sent to user",
      thumbnail: "https://picsum.photos/seed/4/400/225",
    },
  ],
  falsePositive: [
    {
      id: "5",
      type: "Fall Detected",
      timestamp: "2024-05-16T22:12:33",
      user: "John Doe",
      camera: "Bedroom",
      reviewer: "Priya Patel",
      reason: "Object falling, not person",
      thumbnail: "https://picsum.photos/seed/5/400/225",
    },
    {
      id: "6",
      type: "Choking Detected",
      timestamp: "2024-05-16T20:05:11",
      user: "Jane Smith",
      camera: "Living Room",
      reviewer: "Alex Johnson",
      reason: "Normal eating behavior",
      thumbnail: "https://picsum.photos/seed/6/400/225",
    },
  ],
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const AdminVerification = () => {
  const [verifications, setVerifications] = useState(mockVerifications);

  // Calculate totals
  const total =
    verifications.pending.length +
    verifications.valid.length +
    verifications.falsePositive.length;
  const validPercent = Math.round((verifications.valid.length / total) * 100);
  const falsePercent = Math.round(
    (verifications.falsePositive.length / total) * 100
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">
        Human Verification Flow
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-sm font-medium text-muted-foreground">
                Pending Verification
              </div>
              <div className="text-3xl font-bold mt-1">
                {verifications.pending.length}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-sm font-medium text-muted-foreground">
                Valid Alerts
              </div>
              <div className="text-3xl font-bold mt-1 text-green-500">
                {verifications.valid.length}
              </div>
              <div className="mt-2">
                <Progress value={validPercent} className="h-2 bg-green-100" />
                <div className="text-xs text-muted-foreground mt-1">
                  {validPercent}% of total
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-sm font-medium text-muted-foreground">
                False Positives
              </div>
              <div className="text-3xl font-bold mt-1 text-destructive">
                {verifications.falsePositive.length}
              </div>
              <div className="mt-2">
                <Progress value={falsePercent} className="h-2 bg-red-100" />
                <div className="text-xs text-muted-foreground mt-1">
                  {falsePercent}% of total
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">
            Pending
            <Badge variant="secondary" className="ml-2">
              {verifications.pending.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="valid">Valid Alerts</TabsTrigger>
          <TabsTrigger value="false">False Positives</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {verifications.pending.map((alert) => (
              <Card key={alert.id} className="overflow-hidden">
                <div className="relative">
                  <img
                    src={alert.thumbnail}
                    alt={alert.type}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-amber-500 text-white border-amber-500">
                      Pending
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium text-lg mb-2">{alert.type}</h3>

                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDate(alert.timestamp)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{alert.user}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Camera className="h-4 w-4 text-muted-foreground" />
                      <span>{alert.camera}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1">
                      <Check className="mr-2 h-4 w-4" />
                      Mark Valid
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <X className="mr-2 h-4 w-4" />
                      False Positive
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {verifications.pending.length === 0 && (
              <div className="col-span-2 text-center p-12 border rounded-md bg-muted/50">
                <div className="text-muted-foreground">
                  No pending verifications at the moment.
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="valid" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {verifications.valid.map((alert) => (
              <Card key={alert.id} className="overflow-hidden">
                <div className="relative">
                  <img
                    src={alert.thumbnail}
                    alt={alert.type}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge
                      variant="outline"
                      className="bg-green-500 text-white border-green-500"
                    >
                      Valid
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium text-lg mb-2">{alert.type}</h3>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDate(alert.timestamp)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{alert.user}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Camera className="h-4 w-4 text-muted-foreground" />
                      <span>{alert.camera}</span>
                    </div>
                    <div className="pt-2">
                      <div className="text-xs text-muted-foreground">
                        Verified by
                      </div>
                      <div>{alert.reviewer}</div>
                    </div>
                    <div className="pt-1">
                      <div className="text-xs text-muted-foreground">
                        Action taken
                      </div>
                      <div>{alert.action}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {verifications.valid.length === 0 && (
              <div className="col-span-2 text-center p-12 border rounded-md bg-muted/50">
                <div className="text-muted-foreground">
                  No valid alerts to display.
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="false" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {verifications.falsePositive.map((alert) => (
              <Card key={alert.id} className="overflow-hidden">
                <div className="relative">
                  <img
                    src={alert.thumbnail}
                    alt={alert.type}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant="destructive">False Positive</Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium text-lg mb-2">{alert.type}</h3>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDate(alert.timestamp)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{alert.user}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Camera className="h-4 w-4 text-muted-foreground" />
                      <span>{alert.camera}</span>
                    </div>
                    <div className="pt-2">
                      <div className="text-xs text-muted-foreground">
                        Verified by
                      </div>
                      <div>{alert.reviewer}</div>
                    </div>
                    <div className="pt-1">
                      <div className="text-xs text-muted-foreground">
                        Reason
                      </div>
                      <div>{alert.reason}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {verifications.falsePositive.length === 0 && (
              <div className="col-span-2 text-center p-12 border rounded-md bg-muted/50">
                <div className="text-muted-foreground">
                  No false positives to display.
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminVerification;
