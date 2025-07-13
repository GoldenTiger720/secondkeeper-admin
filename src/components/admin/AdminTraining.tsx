import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Trash2,
  Save,
  Brain,
  Image,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, alertsService } from "@/lib/api/alertsService";
import { toast } from "@/hooks/use-toast";
import ImageViewModal from "./ImageViewModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

interface TrainingData extends Alert {
  isAccurate: boolean;
}

interface TrainingResults {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  lastTrainingDate: string;
  totalSamples: number;
  trainingStatus: "idle" | "training" | "completed" | "failed";
}

const alertTypeLabels = {
  fire_smoke: "Fire & Smoke",
  fall: "Fall",
  choking: "Choking",
  violence: "Violence",
};

const AdminTraining = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState<keyof typeof alertTypeLabels>("fire_smoke");
  const [selectedAccurateItems, setSelectedAccurateItems] = useState<string[]>([]);
  const [selectedFalsePositiveItems, setSelectedFalsePositiveItems] = useState<string[]>([]);
  const [trainingData, setTrainingData] = useState<TrainingData[]>([]);
  const [currentAlertType, setCurrentAlertType] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemsToDelete, setItemsToDelete] = useState<string[]>([]);
  const [trainingResults, setTrainingResults] = useState<Record<string, TrainingResults>>({});
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState("");
  const [currentImageMetadata, setCurrentImageMetadata] = useState<{
    date: string;
    user_email: string;
    camera: string;
  } | undefined>();
  const [accurateCurrentPage, setAccurateCurrentPage] = useState(1);
  const [falsePositiveCurrentPage, setFalsePositiveCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchTrainingData();
    fetchTrainingResults();
    setAccurateCurrentPage(1);
    setFalsePositiveCurrentPage(1);
  }, [selectedTab]);

  useEffect(() => {
    setAccurateCurrentPage(1);
    setFalsePositiveCurrentPage(1);
  }, [searchQuery]);

  const fetchTrainingData = async () => {
    try {
      const data = await alertsService.getTrainingData(selectedTab);
      
      // Transform data to include accuracy status
      const transformedData: TrainingData[] = data.map(alert => ({
        ...alert,
        isAccurate: alert.status === "confirmed",
        camera: {
          name: alert.camera.name
        }
      }));
      
      setTrainingData(transformedData);
    } catch (error) {
      console.error("Failed to fetch training data:", error);
    }
  };

  const fetchTrainingResults = async () => {
    try {
      const results = await alertsService.getTrainingResults();
      setTrainingResults(results);
    } catch (error) {
      console.error("Failed to fetch training results:", error);
    }
  };


  const handleViewImage = (item: TrainingData) => {
    setCurrentImage(`http://api.secondkeeper.com${item.thumbnail}`);
    setCurrentAlertType(item.alert_type);
    setCurrentImageMetadata({
      date: formatDate(item.created_at),
      user_email: item.user_email,
      camera: item.camera.name,
    });
    setImageModalOpen(true);
  };

  const accurateData = trainingData.filter(item => item.isAccurate);
  const falsePositiveData = trainingData.filter(item => !item.isAccurate);

  const filteredAccurateData = accurateData.filter((item) => {
    const matchesSearch =
      item.alert_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.camera.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const filteredFalsePositiveData = falsePositiveData.filter((item) => {
    const matchesSearch =
      item.alert_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.camera.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  // Pagination calculations for accurate data
  const accurateTotalPages = Math.ceil(filteredAccurateData.length / itemsPerPage);
  const accurateStartIndex = (accurateCurrentPage - 1) * itemsPerPage;
  const accurateEndIndex = accurateStartIndex + itemsPerPage;
  const paginatedAccurateData = filteredAccurateData.slice(accurateStartIndex, accurateEndIndex);

  // Pagination calculations for false positive data
  const falsePositiveTotalPages = Math.ceil(filteredFalsePositiveData.length / itemsPerPage);
  const falsePositiveStartIndex = (falsePositiveCurrentPage - 1) * itemsPerPage;
  const falsePositiveEndIndex = falsePositiveStartIndex + itemsPerPage;
  const paginatedFalsePositiveData = filteredFalsePositiveData.slice(falsePositiveStartIndex, falsePositiveEndIndex);

  const toggleSelectAccurateItem = (id: string) => {
    setSelectedAccurateItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectFalsePositiveItem = (id: string) => {
    setSelectedFalsePositiveItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAllAccurateItems = () => {
    if (selectedAccurateItems.length === filteredAccurateData.length) {
      setSelectedAccurateItems([]);
    } else {
      setSelectedAccurateItems(filteredAccurateData.map((item) => item.id));
    }
  };

  const selectAllFalsePositiveItems = () => {
    if (selectedFalsePositiveItems.length === filteredFalsePositiveData.length) {
      setSelectedFalsePositiveItems([]);
    } else {
      setSelectedFalsePositiveItems(filteredFalsePositiveData.map((item) => item.id));
    }
  };

  const handleDelete = async () => {
    try {
      await alertsService.deleteTrainingData(itemsToDelete);
      await fetchTrainingData();
      setSelectedAccurateItems([]);
      setSelectedFalsePositiveItems([]);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Failed to delete items:", error);
    }
  };

  const openDeleteDialog = (items: string[]) => {
    setItemsToDelete(items);
    setDeleteDialogOpen(true);
  };

  const handleExtractFrames = async (isAccurate: boolean) => {
    const items = isAccurate ? selectedAccurateItems : selectedFalsePositiveItems;
    if (items.length === 0) {
      toast({
        title: "No items selected",
        description: "Please select videos to extract frames from.",
        variant: "destructive",
      });
      return;
    }

    try {
      await alertsService.extractFrames(items, selectedTab);
      toast({
        title: "Frames Extracted",
        description: `Frames have been extracted from ${items.length} videos.`,
      });
    } catch (error) {
      console.error("Failed to extract frames:", error);
    }
  };

  const handleSaveData = async (isAccurate: boolean) => {
    const items = isAccurate ? selectedAccurateItems : selectedFalsePositiveItems;
    if (items.length === 0) {
      toast({
        title: "No items selected",
        description: "Please select videos to save.",
        variant: "destructive",
      });
      return;
    }

    try {
      await alertsService.saveTrainingData(items, selectedTab);
      toast({
        title: "Data Saved",
        description: `${items.length} training data items have been saved.`,
      });
    } catch (error) {
      console.error("Failed to save data:", error);
    }
  };

  const handleTrainModel = async () => {
    try {
      await alertsService.trainModel(selectedTab);
      // Update training results after initiating training
      setTimeout(fetchTrainingResults, 2000);
    } catch (error) {
      console.error("Failed to start training:", error);
    }
  };

  const currentResults = trainingResults[selectedTab];

  const renderPagination = (currentPage: number, totalPages: number, totalItems: number, onPageChange: (page: number) => void) => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-muted-foreground">
          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} items
        </div>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            {pageNumbers.map((number) => (
              <PaginationItem key={number}>
                <PaginationLink
                  onClick={() => onPageChange(number)}
                  isActive={currentPage === number}
                  className="cursor-pointer"
                >
                  {number}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext 
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold tracking-tight">
          AI Training & Data Management
        </h2>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search training data..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as keyof typeof alertTypeLabels)}>
        <TabsList className="grid w-full grid-cols-4">
          {Object.entries(alertTypeLabels).map(([key, label]) => (
            <TabsTrigger key={key} value={key}>
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.keys(alertTypeLabels).map((alertType) => (
          <TabsContent key={alertType} value={alertType} className="space-y-6">
            {/* Accurate Detection Section */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <CardTitle className="text-lg">Accurate Detection Videos</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`select-all-accurate-${alertType}`}
                      checked={
                        selectedAccurateItems.length === filteredAccurateData.length &&
                        filteredAccurateData.length > 0
                      }
                      onCheckedChange={selectAllAccurateItems}
                    />
                    <label htmlFor={`select-all-accurate-${alertType}`} className="text-sm">
                      Select All ({selectedAccurateItems.length}/{filteredAccurateData.length})
                    </label>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={selectedAccurateItems.length === 0}
                    onClick={() => handleExtractFrames(true)}
                  >
                    <Image className="mr-2 h-4 w-4" />
                    Extract Frames
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={selectedAccurateItems.length === 0}
                    onClick={() => handleSaveData(true)}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={selectedAccurateItems.length === 0}
                    onClick={() => openDeleteDialog(selectedAccurateItems)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead className="w-24">Thumbnail</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Camera</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedAccurateData.map((item) => (
                        <TableRow
                          key={item.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleViewImage(item)}
                        >
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={selectedAccurateItems.includes(item.id)}
                              onCheckedChange={() => toggleSelectAccurateItem(item.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <img
                              src={`http://api.secondkeeper.com${item.thumbnail}`}
                              alt={item.alert_type}
                              className="w-16 h-16 object-cover rounded"
                            />
                          </TableCell>
                          <TableCell>{formatDate(item.created_at)}</TableCell>
                          <TableCell>{item.user_email}</TableCell>
                          <TableCell>{item.camera.name}</TableCell>
                          <TableCell>
                            <Badge className="bg-green-500">Accurate Detection</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredAccurateData.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            <div className="text-muted-foreground">
                              No accurate detection data found.
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                {renderPagination(accurateCurrentPage, accurateTotalPages, filteredAccurateData.length, setAccurateCurrentPage)}
              </CardContent>
            </Card>

            {/* False Positive Section */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <CardTitle className="text-lg">False Positive Videos</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`select-all-false-${alertType}`}
                      checked={
                        selectedFalsePositiveItems.length === filteredFalsePositiveData.length &&
                        filteredFalsePositiveData.length > 0
                      }
                      onCheckedChange={selectAllFalsePositiveItems}
                    />
                    <label htmlFor={`select-all-false-${alertType}`} className="text-sm">
                      Select All ({selectedFalsePositiveItems.length}/{filteredFalsePositiveData.length})
                    </label>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={selectedFalsePositiveItems.length === 0}
                    onClick={() => handleExtractFrames(false)}
                  >
                    <Image className="mr-2 h-4 w-4" />
                    Extract Frames
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={selectedFalsePositiveItems.length === 0}
                    onClick={() => handleSaveData(false)}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={selectedFalsePositiveItems.length === 0}
                    onClick={() => openDeleteDialog(selectedFalsePositiveItems)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead className="w-24">Thumbnail</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Camera</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedFalsePositiveData.map((item) => (
                        <TableRow
                          key={item.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleViewImage(item)}
                        >
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={selectedFalsePositiveItems.includes(item.id)}
                              onCheckedChange={() => toggleSelectFalsePositiveItem(item.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <img
                              src={`http://api.secondkeeper.com${item.thumbnail}`}
                              alt={item.alert_type}
                              className="w-16 h-16 object-cover rounded"
                            />
                          </TableCell>
                          <TableCell>{formatDate(item.created_at)}</TableCell>
                          <TableCell>{item.user_email}</TableCell>
                          <TableCell>{item.camera.name}</TableCell>
                          <TableCell>
                            <Badge variant="destructive">False Positive</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredFalsePositiveData.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            <div className="text-muted-foreground">
                              No false positive data found.
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                {renderPagination(falsePositiveCurrentPage, falsePositiveTotalPages, filteredFalsePositiveData.length, setFalsePositiveCurrentPage)}
              </CardContent>
            </Card>

            {/* Training Button */}
            <div className="flex justify-center">
              <Button
                size="lg"
                onClick={handleTrainModel}
                disabled={accurateData.length === 0 && falsePositiveData.length === 0}
              >
                <Brain className="mr-2 h-5 w-5" />
                Start {alertTypeLabels[alertType as keyof typeof alertTypeLabels]} Model Training
              </Button>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Training Results Section */}
      <Card>
        <CardHeader>
          <CardTitle>Training Results</CardTitle>
        </CardHeader>
        <CardContent>
          {currentResults ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-muted rounded-lg p-4">
                  <div className="text-sm font-medium text-muted-foreground">
                    Accuracy
                  </div>
                  <div className="text-2xl font-bold mt-1">
                    {(currentResults.accuracy * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <div className="text-sm font-medium text-muted-foreground">
                    Precision
                  </div>
                  <div className="text-2xl font-bold mt-1">
                    {(currentResults.precision * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <div className="text-sm font-medium text-muted-foreground">
                    Recall
                  </div>
                  <div className="text-2xl font-bold mt-1">
                    {(currentResults.recall * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <div className="text-sm font-medium text-muted-foreground">
                    F1 Score
                  </div>
                  <div className="text-2xl font-bold mt-1">
                    {currentResults.f1Score.toFixed(3)}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <div>
                  <span className="text-muted-foreground">Last Training: </span>
                  <span>{formatDate(currentResults.lastTrainingDate)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Samples: </span>
                  <span>{currentResults.totalSamples}</span>
                </div>
                <div>
                  <Badge
                    variant={
                      currentResults.trainingStatus === "completed"
                        ? "default"
                        : currentResults.trainingStatus === "training"
                        ? "secondary"
                        : currentResults.trainingStatus === "failed"
                        ? "destructive"
                        : "outline"
                    }
                  >
                    {currentResults.trainingStatus === "completed"
                      ? "Training Completed"
                      : currentResults.trainingStatus === "training"
                      ? "Training..."
                      : currentResults.trainingStatus === "failed"
                      ? "Training Failed"
                      : "Idle"}
                  </Badge>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No training results available for {alertTypeLabels[selectedTab]} model.
            </div>
          )}
        </CardContent>
      </Card>

      <ImageViewModal
        open={imageModalOpen}
        onOpenChange={setImageModalOpen}
        imageUrl={currentImage}
        title={currentAlertType}
        metadata={currentImageMetadata}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {itemsToDelete.length} selected training data items? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminTraining;