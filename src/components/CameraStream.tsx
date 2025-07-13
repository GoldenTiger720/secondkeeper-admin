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
  const [isRtsp, setIsRtsp] = useState(false);

  useEffect(() => {
    const fetchCameraData = async () => {
      try {
        const response = await camerasService.getCamera(cameraId);
        if (response.success) {
          setCamera(response.data);
          
          // Check if camera URL is RTSP
          const isRtspUrl = response.data.stream_url.startsWith("rtsp://");
          setIsRtsp(isRtspUrl);

          if (isRtspUrl) {
            // For RTSP URLs, use direct streaming endpoint with auth
            const baseUrl = import.meta.env.VITE_API_BASE_URL || "https://api.secondkeeper.com/api";
            const directStreamUrl = `${baseUrl}/cameras/${cameraId}/stream/?quality=medium`;
            setStreamUrl(directStreamUrl);
          } else {
            // For non-RTSP URLs, start streaming first then use HLS
            try {
              const streamResponse = await camerasService.startStream(
                cameraId,
                "medium"
              );
              console.log("Stream response:", streamResponse);
              if (streamResponse.success) {
                const hlsUrl = `https://api.secondkeeper.com/media/streams/${cameraId}/index.m3u8`;
                setStreamUrl(hlsUrl);
              } else {
                setError("Failed to start camera stream");
              }
            } catch (streamErr) {
              console.error("Error starting stream:", streamErr);
              setError("Failed to initialize camera stream");
            }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraId]);

  useEffect(() => {
    console.log("Stream URL:", streamUrl, "Is RTSP:", isRtsp);
    if (!streamUrl || !videoRef.current) return;

    const video = videoRef.current;

    if (isRtsp) {
      // For RTSP streams, add auth token as URL parameter
      const token = localStorage.getItem("secondkeeper_access_token");
      const authenticatedUrl = `${streamUrl}&token=${encodeURIComponent(token)}`;
      video.src = authenticatedUrl;
      
      const handleLoadedMetadata = () => {
        video.play().catch((e) => {
          console.warn("Autoplay prevented:", e);
        });
      };

      const handleError = (e: Event) => {
        // Only log error if video src is not empty (component is not unmounting)
        if (video.src) {
          console.error("Video error:", e);
          setError("Failed to load RTSP stream");
        }
      };

      video.addEventListener("loadedmetadata", handleLoadedMetadata);
      video.addEventListener("error", handleError);

      return () => {
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
        video.removeEventListener("error", handleError);
        video.src = "";
      };
    } else {
      // For non-RTSP streams, use HLS
      if (Hls.isSupported()) {
        const hls = new Hls({
          debug: false,
          enableWorker: true,
          lowLatencyMode: true,
          maxLoadingDelay: 4,
          maxBufferLength: 30,
          maxBufferSize: 60 * 1000 * 1000,
        });

        hls.loadSource(streamUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch((e) => {
            console.warn("Autoplay prevented:", e);
          });
        });

        hls.on(Hls.Events.ERROR, (_event, data) => {
          console.error("HLS error:", data);
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                setError("Network error occurred while loading stream");
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                setError("Media error occurred while playing stream");
                break;
              default:
                setError("Fatal streaming error occurred");
                break;
            }
          }
        });

        return () => {
          hls.destroy();
        };
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // For Safari
        video.src = streamUrl;
        video.addEventListener("loadedmetadata", () => {
          video.play().catch((e) => {
            console.warn("Autoplay prevented:", e);
          });
        });
      } else {
        setError("Your browser doesn't support HLS streaming");
      }
    }
  }, [streamUrl, isRtsp]);

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
