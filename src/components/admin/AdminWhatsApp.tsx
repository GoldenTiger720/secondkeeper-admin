
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Plus, Trash, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Mock reviewers data
const mockReviewers = [
  { id: "1", name: "David Chen", phone: "+1 (555) 111-2233", status: "active", alerts: 124 },
  { id: "2", name: "Maria Garcia", phone: "+1 (555) 222-3344", status: "active", alerts: 98 },
  { id: "3", name: "Alex Johnson", phone: "+1 (555) 333-4455", status: "inactive", alerts: 45 },
  { id: "4", name: "Priya Patel", phone: "+1 (555) 444-5566", status: "active", alerts: 211 },
];

const AdminWhatsApp = () => {
  const [reviewers, setReviewers] = useState(mockReviewers);
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [apiKey, setApiKey] = useState("tw7h9f3j5k2l8m6n4p1q");
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">WhatsApp Integration</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">WhatsApp Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col space-y-1">
                <Label htmlFor="whatsapp-switch">Enable WhatsApp Alerts</Label>
                <span className="text-sm text-muted-foreground">
                  When enabled, alerts will be sent to the reviewer group
                </span>
              </div>
              <Switch 
                id="whatsapp-switch" 
                checked={whatsappEnabled}
                onCheckedChange={setWhatsappEnabled}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="api-provider">API Provider</Label>
              <select 
                id="api-provider" 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="twilio">Twilio</option>
                <option value="gupshup">Gupshup</option>
                <option value="messagebird">MessageBird</option>
                <option value="vonage">Vonage</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <Input 
                id="api-key" 
                type="password" 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="group-id">WhatsApp Group ID</Label>
              <Input id="group-id" defaultValue="group_19a7b3c5d8" />
            </div>
            
            <Button className="w-full">Save Configuration</Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Alert Template</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 border rounded-md bg-muted/50 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="h-5 w-5 text-primary" />
                <div className="font-medium">Alert Message Preview</div>
              </div>
              
              <div className="text-sm space-y-2">
                <p><strong>🚨 ALERT: {"{alert_type}"}</strong></p>
                <p>User: {"{user_name}"}<br />Camera: {"{camera_name}"}<br />Time: {"{timestamp}"}</p>
                <p>Please verify if this is a valid alert.</p>
                <div className="flex gap-2 mt-2">
                  <div className="bg-primary/10 text-primary px-4 py-1 rounded-md font-medium text-sm flex items-center gap-1">
                    <Check className="h-3.5 w-3.5" /> Valid
                  </div>
                  <div className="bg-destructive/10 text-destructive px-4 py-1 rounded-md font-medium text-sm flex items-center gap-1">
                    ❌ False Alarm
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="template-editor">Edit Template</Label>
              <textarea 
                id="template-editor" 
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                defaultValue={`🚨 ALERT: {alert_type}

User: {user_name}
Camera: {camera_name}
Time: {timestamp}

Please verify if this is a valid alert.`}
              ></textarea>
            </div>
            
            <div className="mt-4">
              <Button className="w-full">Update Template</Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg">Reviewers</CardTitle>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Reviewer
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Reviewer</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Reviewer Name</Label>
                  <Input placeholder="Enter full name" />
                </div>
                <div className="space-y-2">
                  <Label>WhatsApp Number</Label>
                  <Input placeholder="+1 (555) 123-4567" />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline">Cancel</Button>
                <Button>Add Reviewer</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>WhatsApp Number</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Alerts Reviewed</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviewers.map((reviewer) => (
                <TableRow key={reviewer.id}>
                  <TableCell className="font-medium">{reviewer.name}</TableCell>
                  <TableCell>{reviewer.phone}</TableCell>
                  <TableCell>
                    <Badge variant={reviewer.status === "active" ? "outline" : "secondary"}>
                      {reviewer.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{reviewer.alerts}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="icon">
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminWhatsApp;
