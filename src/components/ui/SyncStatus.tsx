import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wifi, WifiOff, Loader, CheckCircle, AlertCircle } from "lucide-react";
import { useDataSync } from "@/hooks/useDataSync";

export const SyncStatus: React.FC = () => {
  const { isOnline, pendingOperations, isProcessing, forceSync } =
    useDataSync();

  const getStatusIcon = () => {
    if (!isOnline) {
      return <WifiOff className="h-4 w-4" />;
    }
    if (isProcessing) {
      return <Loader className="h-4 w-4 animate-spin" />;
    }
    if (pendingOperations > 0) {
      return <AlertCircle className="h-4 w-4" />;
    }
    return <CheckCircle className="h-4 w-4" />;
  };

  const getStatusText = () => {
    if (!isOnline) return "Offline";
    if (isProcessing) return "Syncing...";
    if (pendingOperations > 0) return `${pendingOperations} pending`;
    return "Synced";
  };

  const getStatusVariant = () => {
    if (!isOnline) return "destructive";
    if (pendingOperations > 0) return "secondary";
    return "outline";
  };

  return (
    <div className="flex items-center gap-2">
      <Badge variant={getStatusVariant()} className="flex items-center gap-1">
        {getStatusIcon()}
        {getStatusText()}
      </Badge>

      {isOnline && pendingOperations > 0 && !isProcessing && (
        <Button
          variant="ghost"
          size="sm"
          onClick={forceSync}
          className="h-6 px-2"
        >
          Sync Now
        </Button>
      )}
    </div>
  );
};
