
import React, { useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface VideoPlayModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoUrl: string;
  title?: string;
}

export const VideoPlayModal = ({
  open,
  onOpenChange,
  videoUrl,
  title,
}: VideoPlayModalProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Auto-play video when dialog opens
  useEffect(() => {
    if (open && videoRef.current) {
      videoRef.current.play().catch(error => {
        console.error("Error playing video:", error);
      });
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title || "Alert Video"}</DialogTitle>
        </DialogHeader>
        <div className="aspect-video relative bg-black rounded-md overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-full"
            src={videoUrl}
            controls
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoPlayModal;
