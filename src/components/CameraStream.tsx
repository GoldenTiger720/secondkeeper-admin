
import React, { useState, useEffect, useRef } from "react";
import Hls from "hls.js";
import { camerasService, Camera } from "@/lib/api/camerasService";
import { Loader } from "lucide-react";

interface CameraStreamProps {
  cameraId: string;
  className?: string;
}

export const CameraStream: React.FC<CameraStreamProps> = ({
  cameraId,
  className = "",
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [camera, setCamera] = useState<Camera | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchCameraData = async () => {
      try {
        const response = await camerasService.getCamera(cameraId);
        if (response.success) {
          setCamera(response.data);
          
          // Start the stream
          try {
            const streamResponse = await camerasService.startStream(cameraId, "medium");
            if (streamResponse.success) {
              setStreamUrl(streamResponse.data.websocket_url);
            } else {
              setError("Failed to start camera stream");
            }
          } catch (streamErr) {
            console.error("Error starting stream:", streamErr);
            setError("Failed to initialize camera stream");
          }
        } else {
          setError("Failed to retrieve camera data");
        }
      } catch (err) {
        console.error("Error fetching camera:", err);
        setError("Failed to load camera");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCameraData();
    
    // Cleanup function to stop the stream when component unmounts
    return () => {
      if (camera) {
        // Here we could stop the stream if needed
      }
    };
  }, [cameraId]);

  useEffect(() => {
    if (!streamUrl || !videoRef.current) return;

    const video = videoRef.current;

    if (Hls.isSupported()) {
      const hls = new Hls({
        debug: false,
        enableWorker: true,
        lowLatencyMode: true,
      });

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(e => {
          console.warn("Autoplay prevented:", e);
        });
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error("HLS error:", data);
        if (data.fatal) {
          setError("Streaming error occurred");
        }
      });

      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // For Safari
      video.src = streamUrl;
      video.addEventListener("loadedmetadata", () => {
        video.play().catch(e => {
          console.warn("Autoplay prevented:", e);
        });
      });
    } else {
      setError("Your browser doesn't support HLS streaming");
    }
  }, [streamUrl]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[200px]">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-[200px] text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className={`camera-stream ${className}`}>
      <video
        ref={videoRef}
        controls
        width="100%"
        height="auto"
        className="rounded-lg"
        playsInline
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
};
