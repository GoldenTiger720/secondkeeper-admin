
import { useState } from "react";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Plus, Edit, Trash, Calendar, TrendingUp, TrendingDown } from "lucide-react";

// Mock subscription plans
const mockPlans = [
  { id: "1", name: "Basic", price: "$9.99", cameraLimit: 2, features: ["Fall Detection", "Smoke Detection"] },
  { id: "2", name: "Standard", price: "$19.99", cameraLimit: 5, features: ["Fall Detection", "Smoke Detection", "Unauthorized Access"] },
  { id: "3", name: "Premium", price: "$29.99", cameraLimit: 10, features: ["Fall Detection", "Smoke Detection", "Unauthorized Access", "Violence Detection"] },
];

// Mock subscriptions data
const mockSubscriptions = [
  {
    id: "1",
    userId: "1",
    userName: "John Doe",
    email: "john@example.com",
    plan: "Standard",
    status: "active",
    expirationDate: "2024-07-15",
    renewalStatus: "auto",
    cameras: 3,
  },
  {
    id: "2",
    userId: "2",
    userName: "Jane Smith",
    email: "jane@example.com",
    plan: "Premium",
    status: "active",
    expirationDate: "2024-08-22",
    renewalStatus: "auto",
    cameras: 6,
  },
  {
    id: "3",
    userId: "3",
    userName: "Mike Johnson",
    email: "mike@example.com",
    plan: "Basic",
    status: "suspended",
    expirationDate: "2024-06-01",
    renewalStatus: "manual",
    cameras: 2,
  },
  {
    id: "4",
    userId: "4",
    userName: "Sarah Williams",
    email: "sarah@example.com",
    plan: "Premium",
    status: "active",
    expirationDate: "2024-09-10",
    renewalStatus: "auto",
    cameras: 8,
  },
];

const AdminSubscriptions = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [subscriptions, setSubscriptions] = useState(mockSubscriptions);

  const filteredSubscriptions = subscriptions.filter(subscription => 
    subscription.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    subscription.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    subscription.plan.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Subscription & Billing</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {mockPlans.map((plan) => (
          <div key={plan.id} className="bg-card rounded-lg border shadow-sm p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium">{plan.name}</h3>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit {plan.name} Plan</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label className="text-right">Plan Name</label>
                      <Input className="col-span-3" defaultValue={plan.name} />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label className="text-right">Price</label>
                      <Input className="col-span-3" defaultValue={plan.price} />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label className="text-right">Camera Limit</label>
                      <Input className="col-span-3" type="number" defaultValue={plan.cameraLimit} />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button variant="outline">Cancel</Button>
                    <Button>Save Changes</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="text-2xl font-bold mb-2">{plan.price}<span className="text-sm font-normal text-muted-foreground"> /month</span></div>
            <div className="text-sm mb-3">Up to {plan.cameraLimit} cameras</div>
            <ul className="space-y-2 text-sm">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <span className="bg-primary/10 text-primary p-1 rounded-full mr-2">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      
      <div className="flex items-center space-x-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search subscriptions by user, email or plan..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Expiration</TableHead>
            <TableHead>Renewal</TableHead>
            <TableHead>Cameras</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredSubscriptions.map((subscription) => (
            <TableRow key={subscription.id}>
              <TableCell className="font-medium">
                <div>{subscription.userName}</div>
                <div className="text-xs text-muted-foreground">{subscription.email}</div>
              </TableCell>
              <TableCell>{subscription.plan}</TableCell>
              <TableCell>
                <Badge variant={subscription.status === "active" ? "outline" : "destructive"}>
                  {subscription.status === "active" ? "Active" : "Suspended"}
                </Badge>
              </TableCell>
              <TableCell className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{subscription.expirationDate}</span>
              </TableCell>
              <TableCell>
                {subscription.renewalStatus === "auto" ? (
                  <div className="flex items-center gap-1 text-green-500">
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span>Auto</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-amber-500">
                    <TrendingDown className="h-3.5 w-3.5" />
                    <span>Manual</span>
                  </div>
                )}
              </TableCell>
              <TableCell>{subscription.cameras}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className={subscription.status === "active" ? "text-destructive" : "text-green-500"}
                  >
                    {subscription.status === "active" ? "Suspend" : "Reactivate"}
                  </Button>
                  <Button variant="outline" size="icon">
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AdminSubscriptions;
