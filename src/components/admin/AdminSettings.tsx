
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const AdminSettings = () => {
  const [timeZone, setTimeZone] = useState("America/New_York");
  const [language, setLanguage] = useState("en-US");
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl md:text-2xl font-bold tracking-tight">Admin Tools & Settings</h2>
      
      <div className="overflow-x-auto pb-2">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full sm:grid-cols-2 lg:grid-cols-4 grid-cols-1 gap-2 sm:gap-0">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="templates">Alert Templates</TabsTrigger>
            <TabsTrigger value="logs">Access Logs</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">System Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="timezone">Default Time Zone</Label>
                    <Select value={timeZone} onValueChange={setTimeZone}>
                      <SelectTrigger id="timezone">
                        <SelectValue placeholder="Select time zone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                        <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                        <SelectItem value="Europe/London">Greenwich Mean Time (GMT)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="language">Default Language</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger id="language">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en-US">English (US)</SelectItem>
                        <SelectItem value="es-ES">Spanish</SelectItem>
                        <SelectItem value="fr-FR">French</SelectItem>
                        <SelectItem value="de-DE">German</SelectItem>
                        <SelectItem value="zh-CN">Chinese (Simplified)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="support-email">Support Email</Label>
                  <Input 
                    id="support-email" 
                    type="email" 
                    defaultValue="support@safeguard-ai.com"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="debug-mode">Debug Mode</Label>
                    <div className="text-sm text-muted-foreground">
                      Enable additional logging for troubleshooting
                    </div>
                  </div>
                  <Switch id="debug-mode" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                    <div className="text-sm text-muted-foreground">
                      Temporarily disable user access when making updates
                    </div>
                  </div>
                  <Switch id="maintenance-mode" />
                </div>
                
                <Button className="w-full">Save System Settings</Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Alert Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="alert-retention">Alert Retention Period (days)</Label>
                  <Input 
                    id="alert-retention" 
                    type="number" 
                    defaultValue="90" 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-valid-notification">Automatic Notifications for Valid Alerts</Label>
                    <div className="text-sm text-muted-foreground">
                      Send notifications automatically after reviewer approval
                    </div>
                  </div>
                  <Switch id="auto-valid-notification" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="training-mode">AI Training Mode</Label>
                    <div className="text-sm text-muted-foreground">
                      Automatically save false positives for AI model improvement
                    </div>
                  </div>
                  <Switch id="training-mode" defaultChecked />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="video-clip-length">Alert Video Clip Length (seconds)</Label>
                  <Select defaultValue="20">
                    <SelectTrigger id="video-clip-length">
                      <SelectValue placeholder="Select length" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 seconds</SelectItem>
                      <SelectItem value="15">15 seconds</SelectItem>
                      <SelectItem value="20">20 seconds</SelectItem>
                      <SelectItem value="30">30 seconds</SelectItem>
                      <SelectItem value="60">60 seconds</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button className="w-full">Save Alert Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="templates" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Email Template</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-subject">Email Subject</Label>
                  <Input 
                    id="email-subject" 
                    defaultValue="URGENT: {alert_type} Detected by SafeGuard AI" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email-body">Email Body Template</Label>
                  <Textarea 
                    id="email-body" 
                    rows={10} 
                    defaultValue={`Dear {user_name},

We have detected a {alert_type} event from your {camera_name} camera at {timestamp}.

Please review the attached video clip and take appropriate action if necessary.

If this is an emergency, please contact emergency services immediately.

You can view more details by logging into your SafeGuard AI dashboard.

Best regards,
The SafeGuard AI Team

Note: This is an automated message, please do not reply.`} 
                  />
                </div>
                
                <Button className="w-full">Save Email Template</Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">SMS Template</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sms-body">SMS Message Template</Label>
                  <Textarea 
                    id="sms-body" 
                    rows={5} 
                    defaultValue={`ALERT: {alert_type} detected by SafeGuard AI in your {camera_name} at {timestamp}. Check email for video or log in to dashboard to view details.`} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="include-link">Include Dashboard Link</Label>
                    <div className="text-sm text-muted-foreground">
                      Add a direct link to the alert in the dashboard
                    </div>
                  </div>
                  <Switch id="include-link" defaultChecked />
                </div>
                
                <Button className="w-full">Save SMS Template</Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">WhatsApp Template</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="whatsapp-body">WhatsApp Message Template</Label>
                  <Textarea 
                    id="whatsapp-body" 
                    rows={6} 
                    defaultValue={`🚨 *ALERT: {alert_type}*

*Camera:* {camera_name}
*Time:* {timestamp}

Please check the attached video clip. Login to your dashboard for more details.`} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="include-video">Include Video Clip</Label>
                    <div className="text-sm text-muted-foreground">
                      Attach video clip directly to WhatsApp message
                    </div>
                  </div>
                  <Switch id="include-video" defaultChecked />
                </div>
                
                <Button className="w-full">Save WhatsApp Template</Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="logs" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Access Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md">
                  <div className="p-4 border-b bg-muted/50">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="space-y-0.5">
                        <h3 className="font-medium">Admin Activity Log</h3>
                        <p className="text-sm text-muted-foreground">
                          Recent admin actions and system events
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Download Log
                      </Button>
                    </div>
                  </div>
                  <div className="p-0">
                    <div className="relative overflow-auto max-h-[400px]">
                      <div className="overflow-x-auto w-full">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="py-3 px-4 text-left font-medium">Timestamp</th>
                              <th className="py-3 px-4 text-left font-medium">Admin</th>
                              <th className="py-3 px-4 text-left font-medium">Action</th>
                              <th className="hidden md:table-cell py-3 px-4 text-left font-medium">Details</th>
                              <th className="hidden md:table-cell py-3 px-4 text-left font-medium">IP Address</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b hover:bg-muted/50">
                              <td className="py-3 px-4">2024-05-17 09:45:22</td>
                              <td className="py-3 px-4">admin@example.com</td>
                              <td className="py-3 px-4">User Creation</td>
                              <td className="hidden md:table-cell py-3 px-4">Created user: john@example.com</td>
                              <td className="hidden md:table-cell py-3 px-4">192.168.1.105</td>
                            </tr>
                            <tr className="border-b hover:bg-muted/50">
                              <td className="py-3 px-4">2024-05-17 09:30:15</td>
                              <td className="py-3 px-4">admin@example.com</td>
                              <td className="py-3 px-4">System Setting Update</td>
                              <td className="hidden md:table-cell py-3 px-4">Changed alert retention period: 60 to 90 days</td>
                              <td className="hidden md:table-cell py-3 px-4">192.168.1.105</td>
                            </tr>
                            <tr className="border-b hover:bg-muted/50">
                              <td className="py-3 px-4">2024-05-17 08:22:40</td>
                              <td className="py-3 px-4">manager@example.com</td>
                              <td className="py-3 px-4">Camera Addition</td>
                              <td className="hidden md:table-cell py-3 px-4">Added camera for user: sarah@example.com</td>
                              <td className="hidden md:table-cell py-3 px-4">192.168.1.110</td>
                            </tr>
                            <tr className="border-b hover:bg-muted/50">
                              <td className="py-3 px-4">2024-05-16 15:12:10</td>
                              <td className="py-3 px-4">admin@example.com</td>
                              <td className="py-3 px-4">Subscription Change</td>
                              <td className="hidden md:table-cell py-3 px-4">Upgraded plan: Basic to Premium for user: mike@example.com</td>
                              <td className="hidden md:table-cell py-3 px-4">192.168.1.105</td>
                            </tr>
                            <tr className="hover:bg-muted/50">
                              <td className="py-3 px-4">2024-05-16 14:05:33</td>
                              <td className="py-3 px-4">manager@example.com</td>
                              <td className="py-3 px-4">User Suspended</td>
                              <td className="hidden md:table-cell py-3 px-4">Suspended user: inactive@example.com</td>
                              <td className="hidden md:table-cell py-3 px-4">192.168.1.110</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="integrations" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">WhatsApp Integration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="whatsapp-provider">Provider</Label>
                  <Select defaultValue="twilio">
                    <SelectTrigger id="whatsapp-provider">
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="twilio">Twilio</SelectItem>
                      <SelectItem value="gupshup">Gupshup</SelectItem>
                      <SelectItem value="messagebird">MessageBird</SelectItem>
                      <SelectItem value="vonage">Vonage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="whatsapp-api-key">API Key</Label>
                  <Input id="whatsapp-api-key" type="password" defaultValue="••••••••••••••••" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="whatsapp-phone">Business Phone Number</Label>
                  <Input id="whatsapp-phone" defaultValue="+1 (555) 987-6543" />
                </div>
                
                <Button className="w-full">Save WhatsApp Integration</Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">SMS Integration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sms-provider">Provider</Label>
                  <Select defaultValue="twilio">
                    <SelectTrigger id="sms-provider">
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="twilio">Twilio</SelectItem>
                      <SelectItem value="nexmo">Nexmo</SelectItem>
                      <SelectItem value="aws-sns">AWS SNS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sms-api-key">API Key</Label>
                  <Input id="sms-api-key" type="password" defaultValue="••••••••••••••••" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sms-phone">From Number</Label>
                  <Input id="sms-phone" defaultValue="+1 (555) 123-4567" />
                </div>
                
                <Button className="w-full">Save SMS Integration</Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Email Integration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-provider">Provider</Label>
                  <Select defaultValue="sendgrid">
                    <SelectTrigger id="email-provider">
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sendgrid">SendGrid</SelectItem>
                      <SelectItem value="mailchimp">Mailchimp</SelectItem>
                      <SelectItem value="aws-ses">AWS SES</SelectItem>
                      <SelectItem value="smtp">Custom SMTP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email-api-key">API Key</Label>
                  <Input id="email-api-key" type="password" defaultValue="••••••••••••••••" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email-from">From Email Address</Label>
                  <Input id="email-from" type="email" defaultValue="alerts@safeguard-ai.com" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email-name">From Name</Label>
                  <Input id="email-name" defaultValue="SafeGuard AI Alerts" />
                </div>
                
                <Button className="w-full">Save Email Integration</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminSettings;
