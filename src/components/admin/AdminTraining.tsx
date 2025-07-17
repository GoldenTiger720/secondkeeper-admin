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
import { TrainingData as TrainingDataType } from "@/lib/api/trainService";
import { toast } from "@/hooks/use-toast";
import {
  useTrainingData,
  useTrainingResults,
  useDeleteTrainingData,
  useSaveTrainingData,
  useTrainModel
} from "@/hooks/useTraining";
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
import { Progress } from "@/components/ui/progress";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

type TrainingData = TrainingDataType;

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
  const [currentAlertType, setCurrentAlertType] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemsToDelete, setItemsToDelete] = useState<string[]>([]);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState("");
  const [accurateCurrentPage, setAccurateCurrentPage] = useState(1);
  const [falsePositiveCurrentPage, setFalsePositiveCurrentPage] = useState(1);
  const [deleteProgress, setDeleteProgress] = useState({ current: 0, total: 0 });
  const [isDeleting, setIsDeleting] = useState(false);
  const itemsPerPage = 10;

  // React Query hooks
  const { data: rawTrainingData = [] } = useTrainingData(selectedTab);
  const { data: trainingResults = {} } = useTrainingResults();
  const deleteTrainingDataMutation = useDeleteTrainingData();
  const saveTrainingDataMutation = useSaveTrainingData();
  const trainModelMutation = useTrainModel();

  // Use the training data directly since it now includes database IDs
  const trainingData: TrainingData[] = rawTrainingData;

  useEffect(() => {
    setAccurateCurrentPage(1);
    setFalsePositiveCurrentPage(1);
  }, [selectedTab]);

  useEffect(() => {
    setAccurateCurrentPage(1);
    setFalsePositiveCurrentPage(1);
  }, [searchQuery]);


  const handleViewImage = (item: TrainingData) => {
    setCurrentImage(`https://api.secondkeeper.com/media/${item.image_url}`);
    setCurrentAlertType(item.image_type);
    setImageModalOpen(true);
  };

  const accurateData = trainingData.filter(item => 
    ["Fire", "Choking", "Fall", "Violence"].includes(item.image_type)
  );
  const falsePositiveData = trainingData.filter(item => 
    ["NonFire", "NonChoking", "NonFall", "NonViolence"].includes(item.image_type)
  );

  const filteredAccurateData = accurateData.filter((item) => {
    const matchesSearch =
      item.image_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.image_url.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const filteredFalsePositiveData = falsePositiveData.filter((item) => {
    const matchesSearch =
      item.image_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.image_url.toLowerCase().includes(searchQuery.toLowerCase());

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

  const toggleSelectAccurateItem = (id: number) => {
    const idString = id.toString();
    setSelectedAccurateItems((prev) =>
      prev.includes(idString) ? prev.filter((item) => item !== idString) : [...prev, idString]
    );
  };

  const toggleSelectFalsePositiveItem = (id: number) => {
    const idString = id.toString();
    setSelectedFalsePositiveItems((prev) =>
      prev.includes(idString) ? prev.filter((item) => item !== idString) : [...prev, idString]
    );
  };

  const selectAllAccurateItems = () => {
    if (selectedAccurateItems.length === filteredAccurateData.length) {
      setSelectedAccurateItems([]);
    } else {
      setSelectedAccurateItems(filteredAccurateData.map((item) => item.id.toString()));
    }
  };

  const selectAllFalsePositiveItems = () => {
    if (selectedFalsePositiveItems.length === filteredFalsePositiveData.length) {
      setSelectedFalsePositiveItems([]);
    } else {
      setSelectedFalsePositiveItems(filteredFalsePositiveData.map((item) => item.id.toString()));
    }
  };

  const handleDelete = async () => {
    // Convert UI IDs (strings) back to database IDs (numbers)
    const actualIds = itemsToDelete.map(uiId => {
      const item = trainingData.find(data => data.id.toString() === uiId);
      return item ? item.id : parseInt(uiId);
    });
    
    setIsDeleting(true);
    setDeleteProgress({ current: 0, total: actualIds.length });
    setDeleteDialogOpen(false);
    
    // Simulate progress for better UX
    setTimeout(() => {
      setDeleteProgress({ current: 1, total: actualIds.length });
    }, 200);
    
    // Execute optimistic deletion
    deleteTrainingDataMutation.mutate({ 
      alertIds: actualIds, 
      alertType: selectedTab 
    });
    
    // Simulate progressive deletion for better UX
    const progressInterval = 150; // milliseconds per item
    for (let i = 0; i < actualIds.length; i++) {
      setTimeout(() => {
        setDeleteProgress({ current: i + 1, total: actualIds.length });
      }, (i + 1) * progressInterval);
    }

    // Complete after all progress steps
    setTimeout(() => {
      setSelectedAccurateItems([]);
      setSelectedFalsePositiveItems([]);
      setItemsToDelete([]);
      setIsDeleting(false);
      setDeleteProgress({ current: 0, total: 0 });
    }, actualIds.length * progressInterval + 300);
  };

  const openDeleteDialog = (items: string[]) => {
    setItemsToDelete(items);
    setDeleteDialogOpen(true);
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
      // Convert UI IDs (strings) back to database IDs (numbers)
      const actualIds = items.map(uiId => {
        const item = trainingData.find(data => data.id.toString() === uiId);
        return item ? item.id : parseInt(uiId);
      });
      
      await saveTrainingDataMutation.mutateAsync({ alertIds: actualIds, alertType: selectedTab });
      if (isAccurate) {
        setSelectedAccurateItems([]);
      } else {
        setSelectedFalsePositiveItems([]);
      }
    } catch (error) {
      console.error("Failed to save data:", error);
    }
  };

  const handleTrainModel = async () => {
    try {
      await trainModelMutation.mutateAsync(selectedTab);
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
                        <TableHead className="w-24">Image</TableHead>
                        <TableHead>Image URL</TableHead>
                        <TableHead>Type</TableHead>
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
                              checked={selectedAccurateItems.includes(item.id.toString())}
                              onCheckedChange={() => toggleSelectAccurateItem(item.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <img
                              src={`https://api.secondkeeper.com/media/${item.image_url}`}
                              alt={item.image_type}
                              className="w-16 h-16 object-cover rounded"
                            />
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            <span className="text-xs">{item.image_url}</span>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-green-500">{item.image_type}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredAccurateData.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8">
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
                        <TableHead className="w-24">Image</TableHead>
                        <TableHead>Image URL</TableHead>
                        <TableHead>Type</TableHead>
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
                              checked={selectedFalsePositiveItems.includes(item.id.toString())}
                              onCheckedChange={() => toggleSelectFalsePositiveItem(item.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <img
                              src={`https://api.secondkeeper.com/media/${item.image_url}`}
                              alt={item.image_type}
                              className="w-16 h-16 object-cover rounded"
                            />
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            <span className="text-xs">{item.image_url}</span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="destructive">{item.image_type}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredFalsePositiveData.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8">
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
                disabled={accurateData.length === 0 && falsePositiveData.length === 0 || trainModelMutation.isPending}
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
            <AlertDialogAction onClick={handleDelete} disabled={deleteTrainingDataMutation.isPending}>
              {deleteTrainingDataMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Loading Overlay */}
      {isDeleting && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-background border rounded-lg p-6 shadow-lg max-w-md w-full mx-4">
            <div className="text-center space-y-4">
              <div className="text-lg font-semibold">
                {deleteProgress.total === 1 ? 'Deleting Training Data...' : 'Deleting Training Data...'}
              </div>
              <Progress 
                className="w-full" 
                value={deleteProgress.total > 0 ? (deleteProgress.current / deleteProgress.total) * 100 : 0}
              />
              <div className="text-sm text-muted-foreground">
                {deleteProgress.total === 1 
                  ? 'Please wait while we process your request'
                  : `Processing ${deleteProgress.current} of ${deleteProgress.total} items`
                }
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTraining;