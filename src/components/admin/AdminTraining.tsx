import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Download,
  Tag,
  Calendar,
  User,
  Camera,
  Check,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

// Mock training data (false positives)
const mockTrainingData = [
  {
    id: "1",
    type: "Fall Detected",
    actualEvent: "Dropping Object",
    timestamp: "2024-05-16T22:12:33",
    user: "John Doe",
    camera: "Bedroom",
    reviewer: "Priya Patel",
    thumbnail: "https://picsum.photos/seed/5/320/180",
    tags: ["misclassified", "high-quality"],
    exported: false,
  },
  {
    id: "2",
    type: "Fire Detected",
    actualEvent: "Steam from Cooking",
    timestamp: "2024-05-15T15:10:25",
    user: "Jane Smith",
    camera: "Kitchen",
    reviewer: "David Chen",
    thumbnail: "https://picsum.photos/seed/7/320/180",
    tags: ["frequent-error", "high-quality"],
    exported: true,
  },
  {
    id: "3",
    type: "Unauthorized Person",
    actualEvent: "Shadow Movement",
    timestamp: "2024-05-14T08:23:44",
    user: "Mike Johnson",
    camera: "Front Door",
    reviewer: "Maria Garcia",
    thumbnail: "https://picsum.photos/seed/8/320/180",
    tags: ["lighting-issues"],
    exported: false,
  },
  {
    id: "4",
    type: "Violence Detected",
    actualEvent: "Playing with Pet",
    timestamp: "2024-05-10T19:45:12",
    user: "Sarah Williams",
    camera: "Living Room",
    reviewer: "Alex Johnson",
    thumbnail: "https://picsum.photos/seed/9/320/180",
    tags: ["misclassified", "high-quality"],
    exported: true,
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

// Available tags for filtering and categorization
const availableTags = [
  "misclassified",
  "high-quality",
  "lighting-issues",
  "frequent-error",
  "requires-review",
  "model-training",
  "poor-camera-angle",
];

const AdminTraining = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [trainingData, setTrainingData] = useState(mockTrainingData);

  const filteredData = trainingData.filter((item) => {
    const matchesSearch =
      item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.actualEvent.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.camera.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTag = selectedTag ? item.tags.includes(selectedTag) : true;

    return matchesSearch && matchesTag;
  });

  const toggleSelectItem = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAllItems = () => {
    if (selectedItems.length === filteredData.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredData.map((item) => item.id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold tracking-tight">
          AI Training & Data Management
        </h2>

        <div className="flex gap-2">
          <Button variant="outline" disabled={selectedItems.length === 0}>
            <Tag className="mr-2 h-4 w-4" />
            Tag Selected
          </Button>
          <Button disabled={selectedItems.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export Selected
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search training data..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={selectedTag} onValueChange={setSelectedTag}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by tag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tags</SelectItem>
            {availableTags.map((tag) => (
              <SelectItem key={tag} value={tag}>
                {tag}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              False Positive Training Data
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all"
                checked={
                  selectedItems.length === filteredData.length &&
                  filteredData.length > 0
                }
                onCheckedChange={selectAllItems}
              />
              <label htmlFor="select-all" className="text-sm">
                Select All ({selectedItems.length}/{filteredData.length})
              </label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
              {filteredData.map((item) => (
                <Card
                  key={item.id}
                  className={`overflow-hidden border ${
                    selectedItems.includes(item.id) ? "ring-2 ring-primary" : ""
                  }`}
                >
                  <div className="relative">
                    <img
                      src={item.thumbnail}
                      alt={item.type}
                      className="w-full h-40 object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge variant="destructive">False Positive</Badge>
                    </div>
                    <div className="absolute top-2 left-2">
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onCheckedChange={() => toggleSelectItem(item.id)}
                        className="bg-white/80 border-white/80"
                      />
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium">{item.type}</h3>
                        <p className="text-sm text-muted-foreground">
                          Actual: {item.actualEvent}
                        </p>
                      </div>
                      {item.exported && (
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          <Check className="h-3 w-3" /> Exported
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-1 text-sm mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{formatDate(item.timestamp)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{item.user}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Camera className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{item.camera}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {item.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredData.length === 0 && (
                <div className="col-span-2 text-center p-12">
                  <div className="text-muted-foreground">
                    No matching training data found.
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">AI Training Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-muted rounded-lg p-4">
              <div className="text-sm font-medium text-muted-foreground">
                Total False Positives
              </div>
              <div className="text-2xl font-bold mt-1">
                {trainingData.length}
              </div>
            </div>
            <div className="bg-muted rounded-lg p-4">
              <div className="text-sm font-medium text-muted-foreground">
                Last Model Training
              </div>
              <div className="text-2xl font-bold mt-1">3 days ago</div>
            </div>
            <div className="bg-muted rounded-lg p-4">
              <div className="text-sm font-medium text-muted-foreground">
                Export Status
              </div>
              <div className="text-2xl font-bold mt-1">
                {trainingData.filter((d) => d.exported).length}/
                {trainingData.length}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <h4 className="font-medium mb-2">Most Common False Positives</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-primary"></div>
                  <span>Fall Detection</span>
                </div>
                <span className="text-muted-foreground">45%</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                  <span>Fire Detection</span>
                </div>
                <span className="text-muted-foreground">30%</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                  <span>Unauthorized Person</span>
                </div>
                <span className="text-muted-foreground">15%</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <span>Violence Detection</span>
                </div>
                <span className="text-muted-foreground">10%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminTraining;
